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
export declare function useAsyncBatch(operations: BatchOperation[], config?: BatchConfig): AsyncBatchResult;
export declare function useAsyncParallel<T = any>(operations: Array<{
    xpath: string;
    fetcher: () => Promise<T>;
}>, config?: Omit<BatchConfig, 'concurrency'>): AsyncBatchResult;
export declare function useAsyncSequential<T = any>(operations: Array<{
    xpath: string;
    fetcher: () => Promise<T>;
}>, config?: Omit<BatchConfig, 'concurrency'>): AsyncBatchResult;
