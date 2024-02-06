export interface NavContext {
    path: string;
    history: string[];
    location: number;
}
export interface PathData {
    routePath: string;
    data: any;
    hash: string;
    query: string;
}
export interface RouteContextData extends PathData {
}

export interface Action<T> {
    type: string;
    payload: T;
}

export interface PathMatch extends PathData {
    isMatch: boolean,
    remainder: string,
    path: string,
}

