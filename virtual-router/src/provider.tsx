import { useReducer, DispatchWithoutAction, createContext} from 'react';
import type { ReactNode } from 'react';
import { reducer } from './state/reducer.ts';
import { NavContext, RouteContextData } from './types.ts';
import { defaultState, defaultRoute } from './state/reducer.ts';

export const PathContext = createContext(defaultState);
export const PathDispatchContext = createContext<((x: any) => void) | null>(null);
export const RouteContext = createContext<RouteContextData>(defaultRoute);

export function PathProvider({ path, children }: { path: string, children: ReactNode }) {
    const initialState = !!path ? { path: path, history: [], location: 0 } : defaultState;
    const [state, dispatch] = useReducer(reducer, initialState) as [NavContext, DispatchWithoutAction];

    return (
        <PathContext.Provider value={state}>
            <PathDispatchContext.Provider value={dispatch}>
                <RouteContext.Provider value={defaultRoute}>
                    {children}
                </RouteContext.Provider>
            </PathDispatchContext.Provider>
        </PathContext.Provider>
    );
}
