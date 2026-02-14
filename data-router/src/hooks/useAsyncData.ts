import { useContext, useEffect, useRef, useCallback } from 'react';
import { DataContext, DataDispatchContext } from '../provider';
import { asyncStart, asyncSuccess, asyncError, generateRequestId } from '../state/actions';
import { combineXPaths, getDataAtXPath } from '../state/xpath-utils';
import { CommandQueueManager } from '../state/command-queue';

export interface AsyncDataConfig {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
    retryCount?: number;
    retryDelay?: number;
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}

export interface AsyncDataResult<T = any> {
    data: T | undefined;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    isIdle: boolean;
    error: Error | undefined;
    refetch: () => Promise<T>;
    cancel: () => void;
    invalidate: () => void;
}

export function useAsyncData<T = any>(
    xpath: string,
    fetcher: () => Promise<T>,
    config: AsyncDataConfig = {}
): AsyncDataResult<T> {
    const dataState = useContext(DataContext);
    const dispatch = useContext(DataDispatchContext);
    
    if (!dataState || !dispatch) {
        throw new Error('useAsyncData must be used within a DataProvider');
    }

    const {
        enabled = true,
        staleTime = 0,
        cacheTime = 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus = false,
        refetchOnReconnect = false,
        retryCount = 3,
        retryDelay = 1000,
        onSuccess,
        onError
    } = config;

    const absoluteXPath = combineXPaths(dataState.xpath, xpath);
    const asyncState = dataState.asyncStates[absoluteXPath];
    const currentData = getDataAtXPath(dataState.data, absoluteXPath);
    
    const commandQueueRef = useRef<CommandQueueManager>();
    const retryCountRef = useRef(0);
    const currentRequestIdRef = useRef<string>();

    // Initialize command queue manager
    if (!commandQueueRef.current) {
        commandQueueRef.current = new CommandQueueManager(dispatch);
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => { commandQueueRef.current?.destroy(); };
    }, []);

    // Update command queue with current state
    useEffect(() => {
        if (commandQueueRef.current) {
            commandQueueRef.current.updateQueue(dataState.commandQueue);
        }
    }, [dataState.commandQueue]);

    const executeRequest = useCallback(async (requestId: string): Promise<T> => {
        try {
            dispatch(asyncStart(absoluteXPath, requestId, 'fetch'));
            
            const result = await fetcher();
            
            dispatch(asyncSuccess(absoluteXPath, requestId, result));
            
            retryCountRef.current = 0;
            onSuccess?.(result);
            
            return result;
        } catch (error) {
            const errorInstance = error instanceof Error ? error : new Error(String(error));
            
            if (retryCountRef.current < retryCount) {
                retryCountRef.current++;
                
                // Exponential backoff
                const delay = retryDelay * Math.pow(2, retryCountRef.current - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                return executeRequest(requestId);
            }
            
            dispatch(asyncError(absoluteXPath, requestId, errorInstance, false));
            onError?.(errorInstance);
            
            throw errorInstance;
        }
    }, [absoluteXPath, fetcher, dispatch, retryCount, retryDelay, onSuccess, onError]);

    const refetch = useCallback(async (): Promise<T> => {
        const requestId = generateRequestId();
        currentRequestIdRef.current = requestId;
        
        if (commandQueueRef.current) {
            const command = commandQueueRef.current.createCommand(
                absoluteXPath,
                'fetch',
                executeRequest(requestId),
                'normal'
            );
            
            commandQueueRef.current.enqueue(command);
            return command.promise;
        }
        
        return executeRequest(requestId);
    }, [absoluteXPath, executeRequest]);

    const cancel = useCallback(() => {
        if (currentRequestIdRef.current && commandQueueRef.current) {
            commandQueueRef.current.cancel(currentRequestIdRef.current);
        }
    }, []);

    const invalidate = useCallback(() => {
        if (commandQueueRef.current) {
            commandQueueRef.current.cancelByXPath(absoluteXPath);
        }
        
        // Clear async state for this path
        if (asyncState) {
            dispatch({
                type: 'ASYNC_CANCEL',
                payload: {
                    xpath: absoluteXPath,
                    requestId: asyncState.requestId || generateRequestId()
                }
            });
        }
    }, [absoluteXPath, asyncState, dispatch]);

    // Determine if data is stale
    const isStale = useCallback(() => {
        if (!asyncState?.timestamp) return true;
        return Date.now() - asyncState.timestamp > staleTime;
    }, [asyncState?.timestamp, staleTime]);

    // Auto-fetch on mount and when enabled/xpath changes
    useEffect(() => {
        if (enabled && (!asyncState || asyncState.status === 'idle')) {
            refetch().catch(() => {
                // Error handling is done in executeRequest
            });
        }
    }, [enabled, absoluteXPath]);

    // Handle window focus refetch
    useEffect(() => {
        if (!refetchOnWindowFocus) return;

        const handleFocus = () => {
            if (enabled && isStale()) {
                refetch().catch(() => {
                    // Error handling is done in executeRequest
                });
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [enabled, refetchOnWindowFocus, refetch, isStale]);

    // Handle reconnect refetch
    useEffect(() => {
        if (!refetchOnReconnect) return;

        const handleOnline = () => {
            if (enabled && isStale()) {
                refetch().catch(() => {
                    // Error handling is done in executeRequest
                });
            }
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [enabled, refetchOnReconnect, refetch, isStale]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (cacheTime === 0) {
                invalidate();
            }
        };
    }, [cacheTime, invalidate]);

    const status = asyncState?.status || 'idle';

    return {
        data: currentData,
        isLoading: status === 'loading',
        isError: status === 'error',
        isSuccess: status === 'success',
        isIdle: status === 'idle',
        error: asyncState?.error,
        refetch,
        cancel,
        invalidate
    };
}