import { useReducer, createContext, useMemo, ReactNode, Dispatch} from 'react';
import { reducer } from './state/reducer';
import { RouteContextData, Action } from './types';
import { defaultState, defaultRoute } from './state/reducer';
import { matchPath } from './state/matchPath';

export const PathContext = createContext(defaultState);
export const PathDispatchContext = createContext<Dispatch<Action<any>> | null>(null);
export const RouteContext = createContext<RouteContextData>(defaultRoute);

interface PathProviderProps {
    path: string;
    children: ReactNode;
}

export function PathProvider({ path, children }: PathProviderProps) {
    const initialState = useMemo(() => 
        path ? { path: path, history: [], location: 0 } : defaultState,
        [path]
    );
    
    const [state, dispatch] = useReducer(reducer, initialState);

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
