import { useContext, useCallback, useRef, useEffect } from 'react';
import { DataContext, DataDispatchContext } from '../provider';
import { generateRequestId } from '../state/actions';
import { combineXPaths, parseXPath } from '../state/xpath-utils';
import { CommandQueueManager } from '../state/command-queue';

export interface InvalidationConfig {
    includeChildren?: boolean;
    includeParents?: boolean;
    clearData?: boolean;
    force?: boolean;
}

export interface InvalidationResult {
    invalidate: (xpath: string, config?: InvalidationConfig) => void;
    invalidateMany: (xpaths: string[], config?: InvalidationConfig) => void;
    invalidatePattern: (pattern: string, config?: InvalidationConfig) => void;
    invalidateAll: () => void;
    revalidate: (xpath: string) => void;
    revalidateMany: (xpaths: string[]) => void;
    getInvalidationCount: () => number;
}

export function useInvalidation(): InvalidationResult {
    const dataState = useContext(DataContext);
    const dispatch = useContext(DataDispatchContext);
    
    if (!dataState || !dispatch) {
        throw new Error('useInvalidation must be used within a DataProvider');
    }

    const commandQueueRef = useRef<CommandQueueManager>();
    if (!commandQueueRef.current) {
        commandQueueRef.current = new CommandQueueManager(dispatch);
    }

    useEffect(() => {
        commandQueueRef.current?.updateQueue(dataState.commandQueue);
    }, [dataState.commandQueue]);

    useEffect(() => {
        return () => { commandQueueRef.current?.destroy(); };
    }, []);

    const invalidate = useCallback((xpath: string, config: InvalidationConfig = {}) => {
        const {
            includeChildren = false,
            includeParents = false,
            clearData = false
        } = config;

        const absoluteXPath = combineXPaths(dataState.xpath, xpath);
        const pathsToInvalidate = new Set<string>([absoluteXPath]);

        // Add child paths if requested
        if (includeChildren) {
            Object.keys(dataState.asyncStates).forEach(statePath => {
                if (statePath.startsWith(absoluteXPath + '/') || 
                    statePath.startsWith(absoluteXPath + '[')) {
                    pathsToInvalidate.add(statePath);
                }
            });
        }

        // Add parent paths if requested
        if (includeParents) {
            const segments = parseXPath(absoluteXPath);
            for (let i = segments.length - 1; i >= 0; i--) {
                const parentSegments = segments.slice(0, i);
                const parentPath = parentSegments.length === 0 ? 
                    '/' : 
                    '/' + parentSegments.map(seg => 
                        seg.isArray && seg.index !== undefined ? 
                        `${seg.property}[${seg.index}]` : 
                        seg.property
                    ).join('/');
                
                if (dataState.asyncStates[parentPath]) {
                    pathsToInvalidate.add(parentPath);
                }
            }
        }

        // Invalidate each path
        pathsToInvalidate.forEach(path => {
            const asyncState = dataState.asyncStates[path];
            
            // Cancel any pending operations for this path
            commandQueueRef.current?.cancelByXPath(path);
            
            // Clear async state
            if (asyncState) {
                dispatch({
                    type: 'ASYNC_CANCEL',
                    payload: {
                        xpath: path,
                        requestId: asyncState.requestId || generateRequestId()
                    }
                });
            }

            // Clear data if requested
            if (clearData) {
                dispatch({
                    type: 'DATA_OPERATION',
                    payload: {
                        xpath: path,
                        operation: 'delete',
                        data: null
                    }
                });
            }
        });
    }, [dataState, dispatch]);

    const invalidateMany = useCallback((xpaths: string[], config: InvalidationConfig = {}) => {
        xpaths.forEach(xpath => invalidate(xpath, config));
    }, [invalidate]);

    const invalidatePattern = useCallback((pattern: string, config: InvalidationConfig = {}) => {
        const regex = new RegExp(
            pattern
                .replace(/\*/g, '.*')
                .replace(/\[(\d+)\]/g, '\\[$1\\]')
                .replace(/\[\*\]/g, '\\[\\d+\\]')
        );

        const matchingPaths = Object.keys(dataState.asyncStates).filter(path => 
            regex.test(path)
        );

        invalidateMany(matchingPaths, config);
    }, [dataState.asyncStates, invalidateMany]);

    const invalidateAll = useCallback(() => {
        // Cancel all pending operations
        dataState.commandQueue.executing.forEach((command) => {
            command.abortController.abort();
        });

        dataState.commandQueue.pending.forEach((command) => {
            command.abortController.abort();
        });

        // Clear all async states
        Object.keys(dataState.asyncStates).forEach(path => {
            const asyncState = dataState.asyncStates[path];
            dispatch({
                type: 'ASYNC_CANCEL',
                payload: {
                    xpath: path,
                    requestId: asyncState.requestId || generateRequestId()
                }
            });
        });

        // Reset command queue
        dispatch({
            type: 'COMMAND_QUEUE_UPDATE',
            payload: {
                operation: 'remove',
                commandId: 'all'
            }
        });
    }, [dataState, dispatch]);

    const revalidate = useCallback((xpath: string) => {
        const absoluteXPath = combineXPaths(dataState.xpath, xpath);
        const asyncState = dataState.asyncStates[absoluteXPath];
        
        if (asyncState) {
            // Mark as stale by setting timestamp to 0
            dispatch({
                type: 'ASYNC_START',
                payload: {
                    xpath: absoluteXPath,
                    requestId: generateRequestId(),
                    operation: 'fetch',
                    priority: 'normal'
                }
            });
        }
    }, [dataState, dispatch]);

    const revalidateMany = useCallback((xpaths: string[]) => {
        xpaths.forEach(xpath => revalidate(xpath));
    }, [revalidate]);

    const getInvalidationCount = useCallback(() => {
        return Object.keys(dataState.asyncStates).filter(path => {
            const state = dataState.asyncStates[path];
            return state.status === 'idle' || state.status === 'error';
        }).length;
    }, [dataState.asyncStates]);

    return {
        invalidate,
        invalidateMany,
        invalidatePattern,
        invalidateAll,
        revalidate,
        revalidateMany,
        getInvalidationCount
    };
}

export function useAutoInvalidation(
    dependencies: string[],
    config: InvalidationConfig & {
        debounceMs?: number;
        onInvalidate?: (paths: string[]) => void;
    } = {}
) {
    const { invalidateMany } = useInvalidation();
    const { debounceMs = 100, onInvalidate, ...invalidationConfig } = config;

    const debouncedInvalidate = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout;
            
            return (paths: string[]) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    invalidateMany(paths, invalidationConfig);
                    onInvalidate?.(paths);
                }, debounceMs);
            };
        })(),
        [invalidateMany, invalidationConfig, debounceMs, onInvalidate]
    );

    return {
        trigger: () => debouncedInvalidate(dependencies),
        invalidateDependencies: () => invalidateMany(dependencies, invalidationConfig)
    };
}

export function useQueryInvalidation() {
    const dataState = useContext(DataContext);
    const { invalidatePattern, invalidateMany } = useInvalidation();

    const invalidateQueries = useCallback((queryKey: string | string[]) => {
        if (Array.isArray(queryKey)) {
            invalidateMany(queryKey);
        } else {
            invalidatePattern(queryKey);
        }
    }, [invalidatePattern, invalidateMany]);

    const invalidateQueriesMatching = useCallback((predicate: (path: string) => boolean) => {
        const matchingPaths = Object.keys(dataState.asyncStates).filter(predicate);
        invalidateMany(matchingPaths);
    }, [dataState.asyncStates, invalidateMany]);

    const getQueries = useCallback((queryKey?: string | string[]) => {
        if (!queryKey) {
            return Object.keys(dataState.asyncStates);
        }

        if (Array.isArray(queryKey)) {
            return queryKey.filter(path => dataState.asyncStates[path]);
        }

        const regex = new RegExp(queryKey.replace(/\*/g, '.*'));
        return Object.keys(dataState.asyncStates).filter(path => regex.test(path));
    }, [dataState.asyncStates]);

    return {
        invalidateQueries,
        invalidateQueriesMatching,
        getQueries
    };
}