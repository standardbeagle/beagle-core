import { useContext } from 'react';
import { DataDispatchContext } from '../provider';
import { DataManipulationHook, DataOperationType } from '../types';
import { dataOperation } from '../state/actions';

export function useDataManipulation(): DataManipulationHook {
    const dispatch = useContext(DataDispatchContext);
    if (!dispatch) {
        throw new Error('useDataManipulation must be used within a DataProvider');
    }
    
    return {
        setData: (xpath: string, data: any, operation: DataOperationType = 'replace') => {
            dispatch(dataOperation(xpath, operation, data));
        },
        mergeData: (xpath: string, data: any) => {
            dispatch(dataOperation(xpath, 'merge', data));
        },
        replaceData: (xpath: string, data: any) => {
            dispatch(dataOperation(xpath, 'replace', data));
        },
        appendData: (xpath: string, data: any) => {
            dispatch(dataOperation(xpath, 'append', data));
        },
        deleteData: (xpath: string) => {
            dispatch(dataOperation(xpath, 'delete', null));
        }
    };
}