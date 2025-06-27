export interface AsyncState {
    readonly status: 'idle' | 'loading' | 'success' | 'error';
    readonly error?: Error;
    readonly timestamp?: number;
    readonly requestId?: string;
}

export interface AsyncCommand {
    readonly id: string;
    readonly xpath: string;
    readonly operation: 'fetch' | 'mutate';
    readonly abortController: AbortController;
    readonly promise: Promise<any>;
    readonly timestamp: number;
    readonly priority: 'low' | 'normal' | 'high';
}

export interface CommandQueue {
    readonly pending: readonly AsyncCommand[];
    readonly executing: ReadonlyMap<string, AsyncCommand>;
    readonly maxConcurrent: number;
}

export interface OptimisticUpdate {
    readonly id: string;
    readonly xpath: string;
    readonly originalData: any;
    readonly optimisticData: any;
    readonly rollbackOnError: boolean;
}

export interface DataContext {
    readonly data: Record<string, any>;
    readonly xpath: string;
    readonly history: readonly string[];
    readonly location: number;
    readonly asyncStates: Record<string, AsyncState>;
    readonly pendingOperations: ReadonlySet<string>;
    readonly commandQueue: CommandQueue;
    readonly optimisticUpdates: Record<string, OptimisticUpdate>;
}

export interface XPathParams {
    [key: string]: string | number | undefined;
}

export interface DataRouteContext {
    readonly xpath: string;
    readonly data: Record<string, any>;
    readonly targetData: any;
    readonly params: XPathParams;
}

export type DataOperationType = 'merge' | 'replace' | 'append' | 'delete';

export type NavigateAction = {
    readonly type: 'NAVIGATE';
    readonly payload: string;
};

export type BackAction = {
    readonly type: 'BACK';
    readonly payload: number;
};

export type ForwardAction = {
    readonly type: 'FORWARD';
    readonly payload: number;
};

export type DataAction = {
    readonly type: 'DATA_OPERATION';
    readonly payload: {
        xpath: string;
        operation: DataOperationType;
        data: any;
    };
};

export type AsyncStartAction = {
    readonly type: 'ASYNC_START';
    readonly payload: {
        xpath: string;
        requestId: string;
        operation: 'fetch' | 'mutate';
        priority?: 'low' | 'normal' | 'high';
        optimisticData?: any;
    };
};

export type AsyncSuccessAction = {
    readonly type: 'ASYNC_SUCCESS';
    readonly payload: {
        xpath: string;
        requestId: string;
        data: any;
        timestamp: number;
    };
};

export type AsyncErrorAction = {
    readonly type: 'ASYNC_ERROR';
    readonly payload: {
        xpath: string;
        requestId: string;
        error: Error;
        shouldRollback: boolean;
    };
};

export type AsyncCancelAction = {
    readonly type: 'ASYNC_CANCEL';
    readonly payload: {
        xpath: string;
        requestId: string;
    };
};

export type CommandQueueAction = {
    readonly type: 'COMMAND_QUEUE_UPDATE';
    readonly payload: {
        operation: 'add' | 'remove' | 'execute';
        command?: AsyncCommand;
        commandId?: string;
    };
};

export type DataRouterAction = NavigateAction | BackAction | ForwardAction | DataAction | 
    AsyncStartAction | AsyncSuccessAction | AsyncErrorAction | AsyncCancelAction | CommandQueueAction;

export interface Action<T> {
    readonly type: string;
    readonly payload: T;
}

export interface NavigationObject {
    readonly navigate: (xpath: string) => void;
    readonly back: (count?: number) => void;
    readonly forward: (count?: number) => void;
    readonly hasBack: boolean;
    readonly hasForward: boolean;
    readonly xpath: string;
    readonly history: readonly string[];
    readonly location: number;
}

export interface FormData {
    [key: string]: FormDataEntryValue | FormDataEntryValue[];
}

export interface DataManipulationHook {
    readonly setData: (xpath: string, data: any, operation?: DataOperationType) => void;
    readonly mergeData: (xpath: string, data: any) => void;
    readonly replaceData: (xpath: string, data: any) => void;
    readonly appendData: (xpath: string, data: any) => void;
    readonly deleteData: (xpath: string) => void;
}