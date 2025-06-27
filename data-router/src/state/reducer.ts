import { DataContext, Action } from '../types';
import { handleActions } from 'redux-actions';
import { combineXPaths, setDataAtXPath } from './xpath-utils';

export const defaultState: DataContext = { 
    data: {}, 
    xpath: '/', 
    history: [], 
    location: 0,
    asyncStates: {},
    pendingOperations: new Set(),
    commandQueue: {
        pending: [],
        executing: new Map(),
        maxConcurrent: 3
    },
    optimisticUpdates: {}
};

export const reducer = handleActions({
    NAVIGATE: (state: DataContext, action: Action<any>): DataContext => {
        let { history, location } = state;
        
        if (location > 0) {
            history = history.slice(0, history.length - location);
        }
        
        const newXPath = combineXPaths(state.xpath, action.payload);
        
        if (newXPath === state.xpath) {
            return state;
        }
        
        return {
            ...state,
            xpath: newXPath,
            history: [state.xpath, ...history],
            location: 0,
        };
    },
    
    BACK: (state: DataContext, action: Action<any>): DataContext => {
        const steps = Math.max(1, action.payload);
        const targetLocation = state.location + steps;
        
        if (targetLocation > state.history.length) {
            return state;
        }
        
        const historyIndex = targetLocation - 1;
        const newXPath = state.history[historyIndex];
        if (!newXPath) {
            return state;
        }
        
        return {
            ...state,
            xpath: newXPath,
            location: targetLocation
        };
    },
    
    FORWARD: (state: DataContext, action: Action<any>): DataContext => {
        const steps = Math.max(1, action.payload);
        const targetLocation = state.location - steps;
        
        if (targetLocation < 0) {
            return state;
        }
        
        if (targetLocation === 0) {
            // Need to reconstruct the "current" path from history
            // This implementation assumes forward means going to what would be the next in sequence
            return state;
        }
        
        const historyIndex = targetLocation - 1;
        const newXPath = state.history[historyIndex];
        if (!newXPath) {
            return state;
        }
        
        return {
            ...state,
            xpath: newXPath,
            location: targetLocation
        };
    },
    
    DATA_OPERATION: (state: DataContext, action: Action<any>): DataContext => {
        const { xpath, operation, data } = action.payload;
        const absoluteXPath = combineXPaths(state.xpath, xpath);
        
        const newData = setDataAtXPath(state.data, absoluteXPath, data, operation);
        
        return {
            ...state,
            data: newData
        };
    },

    ASYNC_START: (state: DataContext, action: Action<any>): DataContext => {
        const { xpath, requestId, optimisticData } = action.payload;
        const absoluteXPath = combineXPaths(state.xpath, xpath);
        
        let newData = state.data;
        let newOptimisticUpdates = state.optimisticUpdates;
        
        if (optimisticData !== undefined) {
            const optimisticId = `${requestId}_${absoluteXPath}`;
            newOptimisticUpdates = {
                ...state.optimisticUpdates,
                [optimisticId]: {
                    id: optimisticId,
                    xpath: absoluteXPath,
                    originalData: state.data,
                    optimisticData,
                    rollbackOnError: true
                }
            };
            newData = setDataAtXPath(state.data, absoluteXPath, optimisticData, 'replace');
        }
        
        return {
            ...state,
            data: newData,
            asyncStates: {
                ...state.asyncStates,
                [absoluteXPath]: {
                    status: 'loading',
                    timestamp: Date.now(),
                    requestId
                }
            },
            pendingOperations: new Set([...state.pendingOperations, requestId]),
            optimisticUpdates: newOptimisticUpdates
        };
    },

    ASYNC_SUCCESS: (state: DataContext, action: Action<any>): DataContext => {
        const { xpath, requestId, data, timestamp } = action.payload;
        const absoluteXPath = combineXPaths(state.xpath, xpath);
        
        const newData = setDataAtXPath(state.data, absoluteXPath, data, 'replace');
        const newPendingOperations = new Set(state.pendingOperations);
        newPendingOperations.delete(requestId);
        
        const optimisticId = `${requestId}_${absoluteXPath}`;
        const newOptimisticUpdates = { ...state.optimisticUpdates };
        delete newOptimisticUpdates[optimisticId];
        
        return {
            ...state,
            data: newData,
            asyncStates: {
                ...state.asyncStates,
                [absoluteXPath]: {
                    status: 'success',
                    timestamp,
                    requestId
                }
            },
            pendingOperations: newPendingOperations,
            optimisticUpdates: newOptimisticUpdates
        };
    },

    ASYNC_ERROR: (state: DataContext, action: Action<any>): DataContext => {
        const { xpath, requestId, error, shouldRollback } = action.payload;
        const absoluteXPath = combineXPaths(state.xpath, xpath);
        
        const optimisticId = `${requestId}_${absoluteXPath}`;
        const optimisticUpdate = state.optimisticUpdates[optimisticId];
        
        let newData = state.data;
        const newOptimisticUpdates = { ...state.optimisticUpdates };
        
        if (shouldRollback && optimisticUpdate) {
            newData = optimisticUpdate.originalData;
            delete newOptimisticUpdates[optimisticId];
        }
        
        const newPendingOperations = new Set(state.pendingOperations);
        newPendingOperations.delete(requestId);
        
        return {
            ...state,
            data: newData,
            asyncStates: {
                ...state.asyncStates,
                [absoluteXPath]: {
                    status: 'error',
                    error,
                    timestamp: Date.now(),
                    requestId
                }
            },
            pendingOperations: newPendingOperations,
            optimisticUpdates: newOptimisticUpdates
        };
    },

    ASYNC_CANCEL: (state: DataContext, action: Action<any>): DataContext => {
        const { xpath, requestId } = action.payload;
        const absoluteXPath = combineXPaths(state.xpath, xpath);
        
        const optimisticId = `${requestId}_${absoluteXPath}`;
        const optimisticUpdate = state.optimisticUpdates[optimisticId];
        
        let newData = state.data;
        const newOptimisticUpdates = { ...state.optimisticUpdates };
        
        if (optimisticUpdate) {
            newData = optimisticUpdate.originalData;
            delete newOptimisticUpdates[optimisticId];
        }
        
        const newPendingOperations = new Set(state.pendingOperations);
        newPendingOperations.delete(requestId);
        
        return {
            ...state,
            data: newData,
            asyncStates: {
                ...state.asyncStates,
                [absoluteXPath]: {
                    status: 'idle',
                    timestamp: Date.now(),
                    requestId
                }
            },
            pendingOperations: newPendingOperations,
            optimisticUpdates: newOptimisticUpdates
        };
    },

    COMMAND_QUEUE_UPDATE: (state: DataContext, action: Action<any>): DataContext => {
        const { operation, command, commandId } = action.payload;
        
        switch (operation) {
            case 'add':
                if (!command) return state;
                return {
                    ...state,
                    commandQueue: {
                        ...state.commandQueue,
                        pending: [...state.commandQueue.pending, command]
                    }
                };
                
            case 'execute':
                if (!command) return state;
                const newExecuting = new Map(state.commandQueue.executing);
                newExecuting.set(command.id, command);
                
                return {
                    ...state,
                    commandQueue: {
                        ...state.commandQueue,
                        pending: state.commandQueue.pending.filter(c => c.id !== command.id),
                        executing: newExecuting
                    }
                };
                
            case 'remove':
                if (!commandId) return state;
                const updatedExecuting = new Map(state.commandQueue.executing);
                updatedExecuting.delete(commandId);
                
                return {
                    ...state,
                    commandQueue: {
                        ...state.commandQueue,
                        executing: updatedExecuting
                    }
                };
                
            default:
                return state;
        }
    }
}, defaultState);