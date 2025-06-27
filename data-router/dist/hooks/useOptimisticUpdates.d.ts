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
export declare function useOptimisticUpdates<T = any>(xpath: string, config?: OptimisticUpdateConfig<T>): OptimisticUpdateResult<T>;
export declare function useOptimisticList<T = any>(xpath: string, config?: OptimisticUpdateConfig<T[]>): OptimisticUpdateResult<T[]> & {
    addItem: (item: T, position?: number) => string;
    updateItem: (index: number, item: T) => string;
    removeItem: (index: number) => string;
    moveItem: (fromIndex: number, toIndex: number) => string;
};
export declare function useOptimisticObject<T extends Record<string, any>>(xpath: string, config?: OptimisticUpdateConfig<T>): OptimisticUpdateResult<T> & {
    updateProperty: <K extends keyof T>(key: K, value: T[K]) => string;
    updateProperties: (updates: Partial<T>) => string;
    removeProperty: <K extends keyof T>(key: K) => string;
    mergeObject: (updates: Partial<T>) => string;
};
