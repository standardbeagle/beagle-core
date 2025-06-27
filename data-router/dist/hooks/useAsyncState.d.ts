import { AsyncState } from '../types';
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
export declare function useAsyncState<T = any>(xpath: string): AsyncStateResult<T>;
export declare function useAsyncStates(xpaths: string[]): Record<string, AsyncStateResult>;
export declare function useGlobalAsyncState(): {
    summary: {
        totalStates: number;
        loadingStates: number;
        errorStates: number;
        successStates: number;
        idleStates: number;
        pendingOperations: number;
        executingOperations: number;
        queuedOperations: number;
        hasAnyLoading: boolean;
        hasAnyError: boolean;
        optimisticUpdateCount: number;
    };
    statesByStatus: {
        loading: [string, AsyncState][];
        error: [string, AsyncState][];
        success: [string, AsyncState][];
        idle: [string, AsyncState][];
    };
    asyncStates: Record<string, AsyncState>;
    pendingOperations: ReadonlySet<string>;
    commandQueue: import("../types").CommandQueue;
    optimisticUpdates: Record<string, import("../types").OptimisticUpdate>;
};
