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
export declare function useInvalidation(): InvalidationResult;
export declare function useAutoInvalidation(dependencies: string[], config?: InvalidationConfig & {
    debounceMs?: number;
    onInvalidate?: (paths: string[]) => void;
}): {
    trigger: () => void;
    invalidateDependencies: () => void;
};
export declare function useQueryInvalidation(): {
    invalidateQueries: (queryKey: string | string[]) => void;
    invalidateQueriesMatching: (predicate: (path: string) => boolean) => void;
    getQueries: (queryKey?: string | string[]) => string[];
};
