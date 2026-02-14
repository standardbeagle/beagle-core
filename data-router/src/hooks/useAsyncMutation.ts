import { useContext, useRef, useCallback, useEffect } from 'react';
import { DataContext, DataDispatchContext } from '../provider';
import { asyncStart, asyncSuccess, asyncError, generateRequestId } from '../state/actions';
import { combineXPaths, getDataAtXPath } from '../state/xpath-utils';
import { CommandQueueManager } from '../state/command-queue';

export interface AsyncMutationConfig<TData = any, TVariables = any> {
    optimisticUpdate?: (currentData: TData, variables: TVariables) => TData;
    rollbackOnError?: boolean;
    invalidate?: string[];
    retryCount?: number;
    retryDelay?: number;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: TData | undefined, error: Error | undefined, variables: TVariables) => void;
}

export interface AsyncMutationResult<TData = any, TVariables = any> {
    mutate: (variables: TVariables) => Promise<TData>;
    mutateAsync: (variables: TVariables) => Promise<TData>;
    reset: () => void;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    isIdle: boolean;
    data: TData | undefined;
    error: Error | undefined;
}

export function useAsyncMutation<TData = any, TVariables = any>(
    xpath: string,
    mutationFn: (variables: TVariables) => Promise<TData>,
    config: AsyncMutationConfig<TData, TVariables> = {}
): AsyncMutationResult<TData, TVariables> {
    const dataState = useContext(DataContext);
    const dispatch = useContext(DataDispatchContext);
    
    if (!dataState || !dispatch) {
        throw new Error('useAsyncMutation must be used within a DataProvider');
    }

    const {
        optimisticUpdate,
        rollbackOnError = true,
        invalidate = [],
        retryCount = 0, // Mutations typically don't retry by default
        retryDelay = 1000,
        onSuccess,
        onError,
        onSettled
    } = config;

    const absoluteXPath = combineXPaths(dataState.xpath, xpath);
    const asyncState = dataState.asyncStates[absoluteXPath];
    const currentData = getDataAtXPath(dataState.data, absoluteXPath);
    
    const commandQueueRef = useRef<CommandQueueManager>();
    const retryCountRef = useRef(0);
    const lastVariablesRef = useRef<TVariables>();

    // Initialize command queue manager
    if (!commandQueueRef.current) {
        commandQueueRef.current = new CommandQueueManager(dispatch);
        commandQueueRef.current.updateQueue(dataState.commandQueue);
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => { commandQueueRef.current?.destroy(); };
    }, []);

    const executeMutation = useCallback(async (
        variables: TVariables, 
        requestId: string
    ): Promise<TData> => {
        try {
            // Apply optimistic update if provided
            let optimisticData: TData | undefined;
            if (optimisticUpdate && currentData !== undefined) {
                optimisticData = optimisticUpdate(currentData, variables);
            }

            dispatch(asyncStart(
                absoluteXPath, 
                requestId, 
                'mutate', 
                'high', // Mutations get high priority
                optimisticData
            ));
            
            const result = await mutationFn(variables);
            
            dispatch(asyncSuccess(absoluteXPath, requestId, result));
            
            // Invalidate related data
            if (invalidate.length > 0 && commandQueueRef.current) {
                invalidate.forEach(path => {
                    const invalidatePath = combineXPaths(dataState.xpath, path);
                    commandQueueRef.current!.cancelByXPath(invalidatePath);
                    
                    // Clear async state for invalidated paths
                    dispatch({
                        type: 'ASYNC_CANCEL',
                        payload: {
                            xpath: invalidatePath,
                            requestId: generateRequestId()
                        }
                    });
                });
            }
            
            retryCountRef.current = 0;
            onSuccess?.(result, variables);
            onSettled?.(result, undefined, variables);
            
            return result;
        } catch (error) {
            const errorInstance = error instanceof Error ? error : new Error(String(error));
            
            if (retryCountRef.current < retryCount) {
                retryCountRef.current++;
                
                const delay = retryDelay * Math.pow(2, retryCountRef.current - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                return executeMutation(variables, requestId);
            }
            
            dispatch(asyncError(absoluteXPath, requestId, errorInstance, rollbackOnError));
            
            onError?.(errorInstance, variables);
            onSettled?.(undefined, errorInstance, variables);
            
            throw errorInstance;
        }
    }, [
        absoluteXPath, 
        mutationFn, 
        optimisticUpdate, 
        currentData, 
        dispatch, 
        invalidate, 
        dataState.xpath, 
        retryCount, 
        retryDelay, 
        rollbackOnError,
        onSuccess, 
        onError, 
        onSettled
    ]);

    const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
        const requestId = generateRequestId();
        lastVariablesRef.current = variables;
        
        if (commandQueueRef.current) {
            const command = commandQueueRef.current.createCommand(
                absoluteXPath,
                'mutate',
                executeMutation(variables, requestId),
                'high'
            );
            
            commandQueueRef.current.enqueue(command);
            return command.promise;
        }
        
        return executeMutation(variables, requestId);
    }, [absoluteXPath, executeMutation]);

    const mutate = useCallback((variables: TVariables): Promise<TData> => {
        return mutateAsync(variables).catch((error) => {
            // Silent catch for fire-and-forget mutations
            console.error('Mutation failed:', error);
            throw error;
        });
    }, [mutateAsync]);

    const reset = useCallback(() => {
        if (asyncState?.requestId && commandQueueRef.current) {
            commandQueueRef.current.cancel(asyncState.requestId);
        }
        
        dispatch({
            type: 'ASYNC_CANCEL',
            payload: {
                xpath: absoluteXPath,
                requestId: asyncState?.requestId || generateRequestId()
            }
        });
        
        retryCountRef.current = 0;
    }, [absoluteXPath, asyncState?.requestId, dispatch]);

    const status = asyncState?.status || 'idle';

    return {
        mutate,
        mutateAsync,
        reset,
        isLoading: status === 'loading',
        isError: status === 'error',
        isSuccess: status === 'success',
        isIdle: status === 'idle',
        data: currentData,
        error: asyncState?.error
    };
}