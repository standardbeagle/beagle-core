
import { NavContext, RouteContextData, Action } from '../types.ts';
import { handleActions } from 'redux-actions';
import { combinePaths } from './combinePaths.ts';

export const defaultState: NavContext = { path: '/', history: [], location: 0 };
export const defaultRoute: RouteContextData = { path: '*', data: {}, hash: '', query: '' };

export const reducer = handleActions({
    NAVIGATE: (state: NavContext, action: Action<any>): NavContext => {
        let { history, location } = state;
        
        if (location > 0) {
            history = history.slice(location)
        }
        return {
            path: combinePaths(state.path, action.payload),
            history: [action.payload, ...history],
            location: 0,
        }
    },
    BACK: (state: NavContext, action: Action<number>): NavContext => {
        const location = state.location + action.payload;
        const newPath = state.history.at(location);
        if (!newPath)
            return state;
        return {
            path: newPath,
            history: state.history,
            location
        }
    },
    FORWARD: (state: NavContext, action: Action<number>): NavContext => {
        const location = state.location - action.payload;
        const newPath = state.history.at(location);
        if (!newPath)
            return state;
        return {
            path: newPath,
            history: state.history,
            location
        }
    }
},
    defaultState
)

