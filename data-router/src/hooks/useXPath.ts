import { useContext } from 'react';
import { DataContext } from '../provider';

export function useXPath(): string {
    const dataState = useContext(DataContext);
    if (!dataState) {
        throw new Error('useXPath must be used within a DataProvider');
    }
    return dataState.xpath;
}