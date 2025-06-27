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
export declare function useAsyncMutation<TData = any, TVariables = any>(xpath: string, mutationFn: (variables: TVariables) => Promise<TData>, config?: AsyncMutationConfig<TData, TVariables>): AsyncMutationResult<TData, TVariables>;
