export interface NavContext {
    readonly path: string;
    readonly history: readonly string[];
    readonly location: number;
}

export interface RouteParams {
    [key: string]: string | undefined;
}

export interface PathData {
    readonly routePath: string;
    readonly data: RouteParams;
    readonly hash: string;
    readonly query: string;
}

export interface RouteContextData extends PathData {}

// Strongly typed action types
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

export type SyncAction = {
    readonly type: 'SYNC';
    readonly payload: string;
};

export type RouterAction = NavigateAction | BackAction | ForwardAction | SyncAction;

export interface Action<T> {
    readonly type: string;
    readonly payload: T;
}

export interface PathMatch extends PathData {
    readonly isMatch: boolean;
    readonly remainder: string;
    readonly path: string;
}

// Navigation hook return types
export interface NavigationObject {
    readonly navigate: (path: string) => void;
    readonly back: (count?: number) => void;
    readonly forward: (count?: number) => void;
    readonly hasBack: boolean;
    readonly hasForward: boolean;
    readonly path: string;
    readonly history: readonly string[];
    readonly location: number;
}

export interface SearchParams {
    readonly search: URLSearchParams;
    readonly hash: string;
    readonly query: string;
}

