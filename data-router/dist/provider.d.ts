import { ReactNode, Dispatch } from 'react';
import { DataRouteContext as DataRouteContextType, Action } from './types';
export declare const DataContext: import("react").Context<import("./types").DataContext>;
export declare const DataDispatchContext: import("react").Context<Dispatch<Action<any>> | null>;
export declare const DataRouteContext: import("react").Context<DataRouteContextType>;
interface DataProviderProps {
    initialData?: Record<string, any>;
    initialXPath?: string;
    children: ReactNode;
}
export declare function DataProvider({ initialData, initialXPath, children }: DataProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
