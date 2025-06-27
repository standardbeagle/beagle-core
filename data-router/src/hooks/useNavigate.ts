import { useContext } from 'react';
import { DataContext, DataDispatchContext } from '../provider';
import { NavigationObject } from '../types';
import { navigate, back, forward } from '../state/actions';

export function useNavigate(): (xpath: string) => void {
    const dispatch = useContext(DataDispatchContext);
    if (!dispatch) {
        throw new Error('useNavigate must be used within a DataProvider');
    }
    return (xpath: string) => dispatch(navigate(xpath));
}

export function useNavigation(): NavigationObject {
    const dispatch = useContext(DataDispatchContext);
    const dataState = useContext(DataContext);
    
    if (!dispatch || !dataState) {
        throw new Error('useNavigation must be used within a DataProvider');
    }
    
    return {
        navigate: (xpath: string) => dispatch(navigate(xpath)),
        back: (count: number = 1) => dispatch(back(count)),
        forward: (count: number = 1) => dispatch(forward(count)),
        hasBack: dataState.location < dataState.history.length,
        hasForward: dataState.location > 0,
        xpath: dataState.xpath,
        history: dataState.history,
        location: dataState.location,
    };
}

export function useHistory(): readonly string[] {
    const dataState = useContext(DataContext);
    if (!dataState) {
        throw new Error('useHistory must be used within a DataProvider');
    }
    return dataState.history;
}