import { useContext, useRef, useCallback, useMemo, useEffect } from 'react';
import { DataContext, DataDispatchContext } from '../provider';
import { asyncStart, asyncSuccess, asyncError, generateRequestId } from '../state/actions';
import { combineXPaths } from '../state/xpath-utils';
import { CommandQueueManager } from '../state/command-queue';

export interface BatchOperation<T = any> {
    xpath: string;
    fetcher: () => Promise<T>;
    priority?: 'low' | 'normal' | 'high';
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

export interface BatchConfig {
    concurrency?: number;
    failFast?: boolean;
    retryCount?: number;
    retryDelay?: number;
    onBatchComplete?: (results: BatchResult[]) => void;
    onBatchError?: (error: Error, results: BatchResult[]) => void;
}

export interface BatchResult<T = any> {
    xpath: string;
    status: 'success' | 'error' | 'pending';
    data?: T;
    error?: Error;
}

export interface AsyncBatchResult {
    execute: () => Promise<BatchResult[]>;
    cancel: () => void;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    isIdle: boolean;
    results: BatchResult[];
    progress: {
        total: number;
        completed: number;
        failed: number;
        pending: number;
        percentage: number;
    };
}

export function useAsyncBatch(
    operations: BatchOperation[],
    config: BatchConfig = {}
): AsyncBatchResult {
    const dataState = useContext(DataContext);
    const dispatch = useContext(DataDispatchContext);
    
    if (!dataState || !dispatch) {
        throw new Error('useAsyncBatch must be used within a DataProvider');
    }

    const {
        concurrency = 3,
        failFast = false,
        retryCount = 1,
        retryDelay = 1000,
        onBatchComplete,
        onBatchError
    } = config;

    const commandQueueRef = useRef<CommandQueueManager>();
    const resultsRef = useRef<BatchResult[]>([]);
    const statusRef = useRef<'idle' | 'loading' | 'success' | 'error'>('idle');
    const batchIdRef = useRef<string>();

    // Initialize command queue manager
    if (!commandQueueRef.current) {
        commandQueueRef.current = new CommandQueueManager(dispatch, concurrency);
        commandQueueRef.current.updateQueue(dataState.commandQueue);
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => { commandQueueRef.current?.destroy(); };
    }, []);

    const executeOperation = useCallback(async (
        operation: BatchOperation,
        retryAttempt: number = 0
    ): Promise<BatchResult> => {
        const absoluteXPath = combineXPaths(dataState.xpath, operation.xpath);
        const requestId = generateRequestId();

        try {
            dispatch(asyncStart(absoluteXPath, requestId, 'fetch', operation.priority));
            
            const result = await operation.fetcher();
            
            dispatch(asyncSuccess(absoluteXPath, requestId, result));
            
            operation.onSuccess?.(result);
            
            return {
                xpath: operation.xpath,
                status: 'success',
                data: result
            };
        } catch (error) {
            const errorInstance = error instanceof Error ? error : new Error(String(error));
            
            if (retryAttempt < retryCount) {
                const delay = retryDelay * Math.pow(2, retryAttempt);
                await new Promise(resolve => setTimeout(resolve, delay));
                return executeOperation(operation, retryAttempt + 1);
            }
            
            dispatch(asyncError(absoluteXPath, requestId, errorInstance, false));
            
            operation.onError?.(errorInstance);
            
            return {
                xpath: operation.xpath,
                status: 'error',
                error: errorInstance
            };
        }
    }, [dataState.xpath, dispatch, retryCount, retryDelay]);

    const execute = useCallback(async (): Promise<BatchResult[]> => {
        if (statusRef.current === 'loading') {
            throw new Error('Batch operation is already in progress');
        }

        statusRef.current = 'loading';
        batchIdRef.current = generateRequestId();
        resultsRef.current = operations.map(op => ({
            xpath: op.xpath,
            status: 'pending' as const
        }));

        try {
            const promises = operations.map(async (operation, index) => {
                try {
                    const result = await executeOperation(operation);
                    resultsRef.current[index] = result;
                    
                    // If failFast is enabled and we hit an error, cancel remaining operations
                    if (failFast && result.status === 'error' && commandQueueRef.current) {
                        operations.slice(index + 1).forEach(op => {
                            const absoluteXPath = combineXPaths(dataState.xpath, op.xpath);
                            commandQueueRef.current!.cancelByXPath(absoluteXPath);
                        });
                        throw result.error;
                    }
                    
                    return result;
                } catch (error) {
                    const errorResult: BatchResult = {
                        xpath: operation.xpath,
                        status: 'error',
                        error: error instanceof Error ? error : new Error(String(error))
                    };
                    resultsRef.current[index] = errorResult;
                    
                    if (failFast) {
                        throw error;
                    }
                    
                    return errorResult;
                }
            });

            const results = await Promise.allSettled(promises);
            const finalResults = results.map((result, index) => 
                result.status === 'fulfilled' 
                    ? result.value 
                    : {
                        xpath: operations[index].xpath,
                        status: 'error' as const,
                        error: result.reason instanceof Error ? result.reason : new Error(String(result.reason))
                    }
            );

            resultsRef.current = finalResults;
            
            const hasErrors = finalResults.some(r => r.status === 'error');
            statusRef.current = hasErrors ? 'error' : 'success';
            
            if (hasErrors && onBatchError) {
                const firstError = finalResults.find(r => r.status === 'error')?.error;
                onBatchError(firstError || new Error('Batch operation failed'), finalResults);
            } else if (!hasErrors && onBatchComplete) {
                onBatchComplete(finalResults);
            }
            
            return finalResults;
        } catch (error) {
            statusRef.current = 'error';
            const errorInstance = error instanceof Error ? error : new Error(String(error));
            
            if (onBatchError) {
                onBatchError(errorInstance, resultsRef.current);
            }
            
            throw errorInstance;
        }
    }, [operations, executeOperation, failFast, onBatchComplete, onBatchError, dataState.xpath]);

    const cancel = useCallback(() => {
        if (commandQueueRef.current && batchIdRef.current) {
            operations.forEach(operation => {
                const absoluteXPath = combineXPaths(dataState.xpath, operation.xpath);
                commandQueueRef.current!.cancelByXPath(absoluteXPath);
            });
        }
        
        statusRef.current = 'idle';
        resultsRef.current = [];
    }, [operations, dataState.xpath]);

    const progress = useMemo(() => {
        const total = operations.length;
        const completed = resultsRef.current.filter(r => r.status === 'success').length;
        const failed = resultsRef.current.filter(r => r.status === 'error').length;
        const pending = resultsRef.current.filter(r => r.status === 'pending').length;
        
        return {
            total,
            completed,
            failed,
            pending,
            percentage: total > 0 ? Math.round(((completed + failed) / total) * 100) : 0
        };
    }, [operations.length, resultsRef.current]);

    return {
        execute,
        cancel,
        isLoading: statusRef.current === 'loading',
        isError: statusRef.current === 'error',
        isSuccess: statusRef.current === 'success',
        isIdle: statusRef.current === 'idle',
        results: resultsRef.current,
        progress
    };
}

export function useAsyncParallel<T = any>(
    operations: Array<{ xpath: string; fetcher: () => Promise<T> }>,
    config?: Omit<BatchConfig, 'concurrency'>
): AsyncBatchResult {
    return useAsyncBatch(
        operations.map(op => ({ ...op, priority: 'normal' as const })),
        { ...config, concurrency: operations.length }
    );
}

export function useAsyncSequential<T = any>(
    operations: Array<{ xpath: string; fetcher: () => Promise<T> }>,
    config?: Omit<BatchConfig, 'concurrency'>
): AsyncBatchResult {
    return useAsyncBatch(
        operations.map(op => ({ ...op, priority: 'normal' as const })),
        { ...config, concurrency: 1 }
    );
}