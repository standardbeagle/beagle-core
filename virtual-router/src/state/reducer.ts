
import { NavContext, RouteContextData, Action } from '../types.ts';
import { handleActions } from 'redux-actions';
import { combinePaths } from './combinePaths.ts';

export const defaultState: NavContext = { path: '/', history: [], location: 0 };
export const defaultRoute: RouteContextData = { routePath: '*', data: {}, hash: '', query: '' };

export const reducer = handleActions({
    NAVIGATE: (state: NavContext, action: Action<any>): NavContext => {
        const newPath = combinePaths(state.path, action.payload);
        
        if (newPath === state.path) {
            return state;
        }

        const history = state.location > 0 && !state.future?.length
            ? state.history.slice(0, Math.max(0, state.location - 1))
            : state.history;
        
        return {
            path: newPath,
            history: [state.path, ...history],
            location: 0,
        }
    },
    BACK: (state: NavContext, action: Action<any>): NavContext => {
        const steps = Math.max(1, action.payload); // Ensure at least 1 step
        const past = state.history.slice(0, steps);
        
        if (past.length < steps) {
            return state;
        }
        
        const newPath = past[past.length - 1];
        if (!newPath) {
            return state;
        }

        const intermediateFuture = past.slice(0, -1).reverse();
        
        return {
            path: newPath,
            history: state.history.slice(steps),
            location: state.location + steps,
            future: [...intermediateFuture, state.path, ...(state.future ?? [])],
        }
    },
    FORWARD: (state: NavContext, action: Action<any>): NavContext => {
        const steps = Math.max(1, action.payload); // Ensure at least 1 step
        const future = state.future ?? [];
        const next = future.slice(0, steps);
        
        if (next.length < steps) {
            return state;
        }
        
        const newPath = next[next.length - 1];
        if (!newPath) {
            return state;
        }

        const remainingFuture = future.slice(steps);
        return {
            path: newPath,
            history: [...next.slice(0, -1).reverse(), state.path, ...state.history],
            location: Math.max(0, state.location - steps),
            ...(remainingFuture.length ? { future: remainingFuture } : {}),
        }
    },
    SYNC: (state: NavContext, action: Action<any>): NavContext => {
        const newPath = action.payload;
        if (newPath === state.path) {
            return state;
        }
        return {
            path: newPath,
            history: state.history,
            location: state.location,
            ...(state.future?.length ? { future: state.future } : {}),
        };
    }
},
    defaultState
)
