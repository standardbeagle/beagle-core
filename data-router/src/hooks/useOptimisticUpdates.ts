import { useContext, useCallback } from 'react';
import { DataContext, DataDispatchContext } from '../provider';
import { generateRequestId } from '../state/actions';
import { combineXPaths, getDataAtXPath } from '../state/xpath-utils';

export interface OptimisticUpdateConfig<T = any> {
    rollbackOnError?: boolean;
    onRollback?: (originalData: T) => void;
    onCommit?: (newData: T) => void;
}

export interface OptimisticUpdateResult<T = any> {
    apply: (newData: T) => string;
    rollback: (updateId: string) => void;
    commit: (updateId: string) => void;
    rollbackAll: () => void;
    getOriginalData: (updateId: string) => T | undefined;
    hasOptimisticUpdates: boolean;
    optimisticUpdateIds: string[];
}

export function useOptimisticUpdates<T = any>(
    xpath: string,
    config: OptimisticUpdateConfig<T> = {}
): OptimisticUpdateResult<T> {
    const dataState = useContext(DataContext);
    const dispatch = useContext(DataDispatchContext);
    
    if (!dataState || !dispatch) {
        throw new Error('useOptimisticUpdates must be used within a DataProvider');
    }

    const {
        onRollback,
        onCommit
    } = config;

    const absoluteXPath = combineXPaths(dataState.xpath, xpath);

    const apply = useCallback((newData: T): string => {
        const updateId = generateRequestId();
        
        dispatch({
            type: 'ASYNC_START',
            payload: {
                xpath: absoluteXPath,
                requestId: updateId,
                operation: 'mutate',
                priority: 'normal',
                optimisticData: newData
            }
        });
        
        return updateId;
    }, [absoluteXPath, dispatch]);

    const rollback = useCallback((updateId: string) => {
        const optimisticId = `${updateId}_${absoluteXPath}`;
        const optimisticUpdate = dataState.optimisticUpdates[optimisticId];
        
        if (optimisticUpdate) {
            dispatch({
                type: 'ASYNC_CANCEL',
                payload: {
                    xpath: absoluteXPath,
                    requestId: updateId
                }
            });
            
            onRollback?.(optimisticUpdate.originalData);
        }
    }, [absoluteXPath, dataState.optimisticUpdates, dispatch, onRollback]);

    const commit = useCallback((updateId: string) => {
        const optimisticId = `${updateId}_${absoluteXPath}`;
        const optimisticUpdate = dataState.optimisticUpdates[optimisticId];
        
        if (optimisticUpdate) {
            dispatch({
                type: 'ASYNC_SUCCESS',
                payload: {
                    xpath: absoluteXPath,
                    requestId: updateId,
                    data: optimisticUpdate.optimisticData,
                    timestamp: Date.now()
                }
            });
            
            onCommit?.(optimisticUpdate.optimisticData);
        }
    }, [absoluteXPath, dataState.optimisticUpdates, dispatch, onCommit]);

    const rollbackAll = useCallback(() => {
        Object.entries(dataState.optimisticUpdates).forEach(([optimisticId, update]) => {
            if (update.xpath === absoluteXPath) {
                const updateId = optimisticId.split('_')[0];
                rollback(updateId);
            }
        });
    }, [dataState.optimisticUpdates, absoluteXPath, rollback]);

    const getOriginalData = useCallback((updateId: string): T | undefined => {
        const optimisticId = `${updateId}_${absoluteXPath}`;
        const optimisticUpdate = dataState.optimisticUpdates[optimisticId];
        
        return optimisticUpdate ? getDataAtXPath(optimisticUpdate.originalData, absoluteXPath) : undefined;
    }, [dataState.optimisticUpdates, absoluteXPath]);

    const optimisticUpdateIds = Object.keys(dataState.optimisticUpdates)
        .filter(id => id.endsWith(`_${absoluteXPath}`))
        .map(id => id.split('_')[0]);

    return {
        apply,
        rollback,
        commit,
        rollbackAll,
        getOriginalData,
        hasOptimisticUpdates: optimisticUpdateIds.length > 0,
        optimisticUpdateIds
    };
}

export function useOptimisticList<T = any>(
    xpath: string,
    config: OptimisticUpdateConfig<T[]> = {}
): OptimisticUpdateResult<T[]> & {
    addItem: (item: T, position?: number) => string;
    updateItem: (index: number, item: T) => string;
    removeItem: (index: number) => string;
    moveItem: (fromIndex: number, toIndex: number) => string;
} {
    const baseResult = useOptimisticUpdates<T[]>(xpath, config);
    const dataState = useContext(DataContext);
    const absoluteXPath = combineXPaths(dataState.xpath, xpath);
    const currentList = getDataAtXPath(dataState.data, absoluteXPath) as T[] || [];

    const addItem = useCallback((item: T, position?: number): string => {
        const newList = [...currentList];
        if (position !== undefined && position >= 0 && position <= newList.length) {
            newList.splice(position, 0, item);
        } else {
            newList.push(item);
        }
        return baseResult.apply(newList);
    }, [currentList, baseResult]);

    const updateItem = useCallback((index: number, item: T): string => {
        if (index < 0 || index >= currentList.length) {
            throw new Error(`Index ${index} is out of bounds for list of length ${currentList.length}`);
        }
        
        const newList = [...currentList];
        newList[index] = item;
        return baseResult.apply(newList);
    }, [currentList, baseResult]);

    const removeItem = useCallback((index: number): string => {
        if (index < 0 || index >= currentList.length) {
            throw new Error(`Index ${index} is out of bounds for list of length ${currentList.length}`);
        }
        
        const newList = [...currentList];
        newList.splice(index, 1);
        return baseResult.apply(newList);
    }, [currentList, baseResult]);

    const moveItem = useCallback((fromIndex: number, toIndex: number): string => {
        if (fromIndex < 0 || fromIndex >= currentList.length || 
            toIndex < 0 || toIndex >= currentList.length) {
            throw new Error('Move indices are out of bounds');
        }
        
        const newList = [...currentList];
        const [movedItem] = newList.splice(fromIndex, 1);
        newList.splice(toIndex, 0, movedItem);
        return baseResult.apply(newList);
    }, [currentList, baseResult]);

    return {
        ...baseResult,
        addItem,
        updateItem,
        removeItem,
        moveItem
    };
}

export function useOptimisticObject<T extends Record<string, any>>(
    xpath: string,
    config: OptimisticUpdateConfig<T> = {}
): OptimisticUpdateResult<T> & {
    updateProperty: <K extends keyof T>(key: K, value: T[K]) => string;
    updateProperties: (updates: Partial<T>) => string;
    removeProperty: <K extends keyof T>(key: K) => string;
    mergeObject: (updates: Partial<T>) => string;
} {
    const baseResult = useOptimisticUpdates<T>(xpath, config);
    const dataState = useContext(DataContext);
    const absoluteXPath = combineXPaths(dataState.xpath, xpath);
    const currentObject = getDataAtXPath(dataState.data, absoluteXPath) as T || {} as T;

    const updateProperty = useCallback(<K extends keyof T>(key: K, value: T[K]): string => {
        const newObject = { ...currentObject, [key]: value };
        return baseResult.apply(newObject);
    }, [currentObject, baseResult]);

    const updateProperties = useCallback((updates: Partial<T>): string => {
        const newObject = { ...currentObject, ...updates };
        return baseResult.apply(newObject);
    }, [currentObject, baseResult]);

    const removeProperty = useCallback(<K extends keyof T>(key: K): string => {
        const newObject = { ...currentObject };
        delete newObject[key];
        return baseResult.apply(newObject);
    }, [currentObject, baseResult]);

    const mergeObject = useCallback((updates: Partial<T>): string => {
        const newObject = { ...currentObject };
        Object.entries(updates).forEach(([key, value]) => {
            if (typeof newObject[key as keyof T] === 'object' && typeof value === 'object' && 
                newObject[key as keyof T] !== null && value !== null) {
                (newObject as any)[key] = { ...newObject[key as keyof T], ...value };
            } else {
                (newObject as any)[key] = value;
            }
        });
        return baseResult.apply(newObject);
    }, [currentObject, baseResult]);

    return {
        ...baseResult,
        updateProperty,
        updateProperties,
        removeProperty,
        mergeObject
    };
}