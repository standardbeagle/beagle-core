import { useReducer, createContext, useMemo, ReactNode, Dispatch } from 'react';
import { reducer, defaultState } from './state/reducer';
import { DataRouteContext as DataRouteContextType, Action } from './types';
import { getDataAtXPath, extractXPathParams } from './state/xpath-utils';

export const DataContext = createContext(defaultState);
export const DataDispatchContext = createContext<Dispatch<Action<any>> | null>(null);
export const DataRouteContext = createContext<DataRouteContextType>({
    xpath: '/',
    data: {},
    targetData: {},
    params: {}
});

interface DataProviderProps {
    initialData?: Record<string, any>;
    initialXPath?: string;
    children: ReactNode;
}

export function DataProvider({ initialData = {}, initialXPath = '/', children }: DataProviderProps) {
    const initialState = useMemo(() => ({
        data: initialData,
        xpath: initialXPath,
        history: [],
        location: 0,
        asyncStates: {},
        pendingOperations: new Set<string>(),
        commandQueue: {
            pending: [],
            executing: new Map<string, any>(),
            maxConcurrent: 3
        },
        optimisticUpdates: {}
    }), [initialData, initialXPath]);
    
    const [state, dispatch] = useReducer(reducer, initialState);

    const dataContextValue = useMemo(() => state, [
        state.data, 
        state.xpath, 
        state.history, 
        state.location, 
        state.asyncStates, 
        state.pendingOperations, 
        state.commandQueue, 
        state.optimisticUpdates
    ]);
    const dispatchContextValue = useMemo(() => dispatch, [dispatch]);
    
    const routeContextValue = useMemo(() => {
        const targetData = getDataAtXPath(state.data, state.xpath);
        const params = extractXPathParams('*', state.xpath);
        
        return {
            xpath: state.xpath,
            data: state.data,
            targetData,
            params
        };
    }, [state.data, state.xpath]);

    return (
        <DataContext.Provider value={dataContextValue}>
            <DataDispatchContext.Provider value={dispatchContextValue}>
                <DataRouteContext.Provider value={routeContextValue}>
                    {children}
                </DataRouteContext.Provider>
            </DataDispatchContext.Provider>
        </DataContext.Provider>
    );
}