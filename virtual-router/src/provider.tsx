import { useReducer, createContext, useMemo, useEffect, useRef, ReactNode, Dispatch} from 'react';
import { reducer } from './state/reducer';
import { RouteContextData, Action } from './types';
import { defaultState, defaultRoute } from './state/reducer';
import { matchPath } from './state/matchPath';
import { createSyncAction } from './state/actions';

export const PathContext = createContext(defaultState);
export const PathDispatchContext = createContext<Dispatch<Action<any>> | null>(null);
export const RouteContext = createContext<RouteContextData>(defaultRoute);

interface PathProviderProps {
    path: string;
    children: ReactNode;
    basePath?: string;
    externalPath?: string;
    onChange?: (path: string) => void;
}

function stripBasePath(basePath: string, fullPath: string): string {
    if (!basePath || basePath === '/') return fullPath;
    if (fullPath.startsWith(basePath)) {
        const stripped = fullPath.slice(basePath.length);
        return stripped === '' ? '/' : stripped;
    }
    return fullPath;
}

function prependBasePath(basePath: string, internalPath: string): string {
    if (!basePath || basePath === '/') return internalPath;
    if (internalPath === '/') return basePath;
    return basePath + internalPath;
}

export function PathProvider({ path, children, basePath = '/', externalPath, onChange }: PathProviderProps) {
    const initialState = useMemo(() =>
        path ? { path: path, history: [], location: 0 } : defaultState,
        [path]
    );

    const [state, dispatch] = useReducer(reducer, initialState);
    const isExternalSyncRef = useRef(false);
    const prevPathRef = useRef(state.path);

    // Sync from external router → internal state
    useEffect(() => {
        if (externalPath === undefined) return;
        const internalPath = stripBasePath(basePath, externalPath);
        if (internalPath !== state.path) {
            isExternalSyncRef.current = true;
            dispatch(createSyncAction(internalPath) as Action<any>);
        }
    }, [externalPath, basePath]);

    // Sync from internal navigation → external router
    useEffect(() => {
        if (isExternalSyncRef.current) {
            isExternalSyncRef.current = false;
            prevPathRef.current = state.path;
            return;
        }
        if (onChange && state.path !== prevPathRef.current) {
            prevPathRef.current = state.path;
            onChange(prependBasePath(basePath, state.path));
        }
    }, [state.path, onChange, basePath]);

    // Memoize context values to prevent unnecessary re-renders
    const pathContextValue = useMemo(() => state, [state.path, state.history, state.location]);
    const dispatchContextValue = useMemo(() => dispatch, [dispatch]);
    const routeContextValue = useMemo(() => {
        // Parse the current path to extract query, hash, etc.
        const match = matchPath('*', state.path);
        return {
            routePath: '*',
            data: {},
            query: match.query,
            hash: match.hash,
            path: match.path
        };
    }, [state.path]);

    return (
        <PathContext.Provider value={pathContextValue}>
            <PathDispatchContext.Provider value={dispatchContextValue}>
                <RouteContext.Provider value={routeContextValue}>
                    {children}
                </RouteContext.Provider>
            </PathDispatchContext.Provider>
        </PathContext.Provider>
    );
}
