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
export declare function useAsyncData<T = any>(xpath: string, fetcher: () => Promise<T>, config?: AsyncDataConfig): AsyncDataResult<T>;
