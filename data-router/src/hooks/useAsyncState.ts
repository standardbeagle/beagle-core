import { useContext, useMemo } from 'react';
import { DataContext } from '../provider';
import { AsyncState } from '../types';
import { combineXPaths, getDataAtXPath } from '../state/xpath-utils';

export interface AsyncStateInfo extends AsyncState {
    xpath: string;
    hasPendingOperation: boolean;
    isStale: (staleTime?: number) => boolean;
}

export interface AsyncStateResult<T = any> {
    data: T | undefined;
    asyncState: AsyncStateInfo | undefined;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    isIdle: boolean;
    error: Error | undefined;
    isPending: boolean;
    lastUpdated: number | undefined;
}

export function useAsyncState<T = any>(xpath: string): AsyncStateResult<T> {
    const dataState = useContext(DataContext);
    
    if (!dataState) {
        throw new Error('useAsyncState must be used within a DataProvider');
    }

    const absoluteXPath = combineXPaths(dataState.xpath, xpath);
    const asyncState = dataState.asyncStates[absoluteXPath];
    const currentData = getDataAtXPath(dataState.data, absoluteXPath);
    const isPending = dataState.pendingOperations.has(asyncState?.requestId || '');

    const asyncStateInfo: AsyncStateInfo | undefined = useMemo(() => {
        if (!asyncState) return undefined;

        return {
            ...asyncState,
            xpath: absoluteXPath,
            hasPendingOperation: isPending,
            isStale: (staleTime: number = 0) => {
                if (!asyncState.timestamp) return true;
                return Date.now() - asyncState.timestamp > staleTime;
            }
        };
    }, [asyncState, absoluteXPath, isPending]);

    const status = asyncState?.status || 'idle';

    return {
        data: currentData,
        asyncState: asyncStateInfo,
        isLoading: status === 'loading',
        isError: status === 'error',
        isSuccess: status === 'success',
        isIdle: status === 'idle',
        error: asyncState?.error,
        isPending,
        lastUpdated: asyncState?.timestamp
    };
}

export function useAsyncStates(xpaths: string[]): Record<string, AsyncStateResult> {
    const dataState = useContext(DataContext);
    
    if (!dataState) {
        throw new Error('useAsyncStates must be used within a DataProvider');
    }

    return useMemo(() => {
        const results: Record<string, AsyncStateResult> = {};
        
        xpaths.forEach(xpath => {
            const absoluteXPath = combineXPaths(dataState.xpath, xpath);
            const asyncState = dataState.asyncStates[absoluteXPath];
            const currentData = getDataAtXPath(dataState.data, absoluteXPath);
            const isPending = dataState.pendingOperations.has(asyncState?.requestId || '');

            const asyncStateInfo: AsyncStateInfo | undefined = asyncState ? {
                ...asyncState,
                xpath: absoluteXPath,
                hasPendingOperation: isPending,
                isStale: (staleTime: number = 0) => {
                    if (!asyncState.timestamp) return true;
                    return Date.now() - asyncState.timestamp > staleTime;
                }
            } : undefined;

            const status = asyncState?.status || 'idle';

            results[xpath] = {
                data: currentData,
                asyncState: asyncStateInfo,
                isLoading: status === 'loading',
                isError: status === 'error',
                isSuccess: status === 'success',
                isIdle: status === 'idle',
                error: asyncState?.error,
                isPending,
                lastUpdated: asyncState?.timestamp
            };
        });

        return results;
    }, [dataState, xpaths]);
}

export function useGlobalAsyncState() {
    const dataState = useContext(DataContext);
    
    if (!dataState) {
        throw new Error('useGlobalAsyncState must be used within a DataProvider');
    }

    return useMemo(() => {
        const allStates = Object.entries(dataState.asyncStates);
        const pendingCount = dataState.pendingOperations.size;
        const executingCount = dataState.commandQueue.executing.size;
        const queuedCount = dataState.commandQueue.pending.length;

        const summary = {
            totalStates: allStates.length,
            loadingStates: allStates.filter(([, state]) => state.status === 'loading').length,
            errorStates: allStates.filter(([, state]) => state.status === 'error').length,
            successStates: allStates.filter(([, state]) => state.status === 'success').length,
            idleStates: allStates.filter(([, state]) => state.status === 'idle').length,
            pendingOperations: pendingCount,
            executingOperations: executingCount,
            queuedOperations: queuedCount,
            hasAnyLoading: allStates.some(([, state]) => state.status === 'loading'),
            hasAnyError: allStates.some(([, state]) => state.status === 'error'),
            optimisticUpdateCount: Object.keys(dataState.optimisticUpdates).length
        };

        const statesByStatus = {
            loading: allStates.filter(([, state]) => state.status === 'loading'),
            error: allStates.filter(([, state]) => state.status === 'error'),
            success: allStates.filter(([, state]) => state.status === 'success'),
            idle: allStates.filter(([, state]) => state.status === 'idle')
        };

        return {
            summary,
            statesByStatus,
            asyncStates: dataState.asyncStates,
            pendingOperations: dataState.pendingOperations,
            commandQueue: dataState.commandQueue,
            optimisticUpdates: dataState.optimisticUpdates
        };
    }, [dataState]);
}