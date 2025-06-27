import { useContext } from 'react';
import { DataContext, DataRouteContext } from '../provider';
import { getDataAtXPath } from '../state/xpath-utils';

export function useData(): Record<string, any> {
    const dataState = useContext(DataContext);
    if (!dataState) {
        throw new Error('useData must be used within a DataProvider');
    }
    return dataState.data;
}

export function useTargetData(): any {
    const routeContext = useContext(DataRouteContext);
    if (!routeContext) {
        throw new Error('useTargetData must be used within a DataProvider');
    }
    return routeContext.targetData;
}

export function useDataAtXPath(xpath: string): any {
    const dataState = useContext(DataContext);
    if (!dataState) {
        throw new Error('useDataAtXPath must be used within a DataProvider');
    }
    return getDataAtXPath(dataState.data, xpath);
}