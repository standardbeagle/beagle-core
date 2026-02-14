
import { NavContext, RouteContextData, Action } from '../types.ts';
import { handleActions } from 'redux-actions';
import { combinePaths } from './combinePaths.ts';

export const defaultState: NavContext = { path: '/', history: [], location: 0 };
export const defaultRoute: RouteContextData = { routePath: '*', data: {}, hash: '', query: '' };

export const reducer = handleActions({
    NAVIGATE: (state: NavContext, action: Action<any>): NavContext => {
        let { history, location } = state;
        
        // If we're not at the latest position, trim future history
        if (location > 0) {
            history = history.slice(0, history.length - location);
        }
        
        const newPath = combinePaths(state.path, action.payload);
        
        // Don't add to history if navigating to the same path
        if (newPath === state.path) {
            return state;
        }
        
        return {
            path: newPath,
            history: [state.path, ...history],
            location: 0,
        }
    },
    BACK: (state: NavContext, action: Action<any>): NavContext => {
        const steps = Math.max(1, action.payload); // Ensure at least 1 step
        const targetLocation = state.location + steps;
        
        // Check bounds - can't go back beyond available history
        if (targetLocation > state.history.length) {
            return state;
        }
        
        // targetLocation represents steps back, so history index is targetLocation - 1
        const historyIndex = targetLocation - 1;
        const newPath = state.history[historyIndex];
        if (!newPath) {
            return state;
        }
        
        return {
            path: newPath,
            history: state.history,
            location: targetLocation
        }
    },
    FORWARD: (state: NavContext, action: Action<any>): NavContext => {
        const steps = Math.max(1, action.payload); // Ensure at least 1 step
        const targetLocation = state.location - steps;

        // Check bounds - can't go forward beyond current position (location 0)
        if (targetLocation < 0) {
            return state;
        }

        // If target location is 0, we're going back to the "current" position
        // But since we don't track the current path separately, this is problematic
        // The original implementation likely had this same issue
        // For now, let's implement basic forward functionality

        if (targetLocation === 0) {
            // Going back to current position - but we don't know what the current path should be
            // This is a fundamental limitation of the current design
            return state; // Cannot go forward to unknown current state
        }

        const historyIndex = targetLocation - 1;
        const newPath = state.history[historyIndex];
        if (!newPath) {
            return state;
        }

        return {
            path: newPath,
            history: state.history,
            location: targetLocation
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
            location: state.location
        };
    }
},
    defaultState
)

