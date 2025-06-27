import { describe, it, expect, beforeEach } from 'vitest';
import { reducer, defaultState } from './reducer';
import { asyncStart, asyncSuccess, asyncError, asyncCancel, generateRequestId } from './actions';
import { DataContext } from '../types';

describe('Async Reducer', () => {
    let initialState: DataContext;
    
    beforeEach(() => {
        initialState = {
            ...defaultState,
            data: {
                users: [
                    { id: 1, name: 'John', profile: { email: 'john@example.com' } },
                    { id: 2, name: 'Jane', profile: { email: 'jane@example.com' } }
                ]
            }
        };
    });

    describe('ASYNC_START', () => {
        it('should set loading state and add to pending operations', () => {
            const requestId = generateRequestId();
            const action = asyncStart('/users[0]', requestId, 'fetch');
            
            const newState = reducer(initialState, action);
            
            expect(newState.asyncStates['/users[0]']).toEqual({
                status: 'loading',
                timestamp: expect.any(Number),
                requestId
            });
            expect(newState.pendingOperations.has(requestId)).toBe(true);
        });

        it('should apply optimistic updates when provided', () => {
            const requestId = generateRequestId();
            const optimisticData = { id: 1, name: 'Updated John', profile: { email: 'john@example.com' } };
            const action = asyncStart('/users[0]', requestId, 'mutate', 'normal', optimisticData);
            
            const newState = reducer(initialState, action);
            
            expect(newState.data.users[0]).toEqual(optimisticData);
            expect(newState.optimisticUpdates).toHaveProperty(`${requestId}_/users[0]`);
        });

        it('should store original data for rollback', () => {
            const requestId = generateRequestId();
            const optimisticData = { id: 1, name: 'Updated John', profile: { email: 'john@example.com' } };
            const action = asyncStart('/users[0]', requestId, 'mutate', 'normal', optimisticData);
            
            const newState = reducer(initialState, action);
            
            const optimisticUpdate = newState.optimisticUpdates[`${requestId}_/users[0]`];
            expect(optimisticUpdate.originalData).toEqual(initialState.data);
        });
    });

    describe('ASYNC_SUCCESS', () => {
        it('should update data and remove from pending operations', () => {
            const requestId = generateRequestId();
            const startAction = asyncStart('/users[0]', requestId, 'fetch');
            const stateAfterStart = reducer(initialState, startAction);
            
            const successData = { id: 1, name: 'Updated John', profile: { email: 'updated@example.com' } };
            const successAction = asyncSuccess('/users[0]', requestId, successData);
            const newState = reducer(stateAfterStart, successAction);
            
            expect(newState.data.users[0]).toEqual(successData);
            expect(newState.asyncStates['/users[0]'].status).toBe('success');
            expect(newState.pendingOperations.has(requestId)).toBe(false);
        });

        it('should clean up optimistic updates', () => {
            const requestId = generateRequestId();
            const optimisticData = { id: 1, name: 'Optimistic John', profile: { email: 'john@example.com' } };
            const startAction = asyncStart('/users[0]', requestId, 'mutate', 'normal', optimisticData);
            const stateAfterStart = reducer(initialState, startAction);
            
            const successData = { id: 1, name: 'Real John', profile: { email: 'real@example.com' } };
            const successAction = asyncSuccess('/users[0]', requestId, successData);
            const newState = reducer(stateAfterStart, successAction);
            
            expect(newState.optimisticUpdates).not.toHaveProperty(`${requestId}_/users[0]`);
        });
    });

    describe('ASYNC_ERROR', () => {
        it('should set error state and remove from pending operations', () => {
            const requestId = generateRequestId();
            const startAction = asyncStart('/users[0]', requestId, 'fetch');
            const stateAfterStart = reducer(initialState, startAction);
            
            const error = new Error('Network error');
            const errorAction = asyncError('/users[0]', requestId, error, false);
            const newState = reducer(stateAfterStart, errorAction);
            
            expect(newState.asyncStates['/users[0]'].status).toBe('error');
            expect(newState.asyncStates['/users[0]'].error).toBe(error);
            expect(newState.pendingOperations.has(requestId)).toBe(false);
        });

        it('should rollback optimistic updates when shouldRollback is true', () => {
            const requestId = generateRequestId();
            const optimisticData = { id: 1, name: 'Optimistic John', profile: { email: 'john@example.com' } };
            const startAction = asyncStart('/users[0]', requestId, 'mutate', 'normal', optimisticData);
            const stateAfterStart = reducer(initialState, startAction);
            
            const error = new Error('Network error');
            const errorAction = asyncError('/users[0]', requestId, error, true);
            const newState = reducer(stateAfterStart, errorAction);
            
            expect(newState.data).toEqual(initialState.data);
            expect(newState.optimisticUpdates).not.toHaveProperty(`${requestId}_/users[0]`);
        });

        it('should not rollback when shouldRollback is false', () => {
            const requestId = generateRequestId();
            const optimisticData = { id: 1, name: 'Optimistic John', profile: { email: 'john@example.com' } };
            const startAction = asyncStart('/users[0]', requestId, 'mutate', 'normal', optimisticData);
            const stateAfterStart = reducer(initialState, startAction);
            
            const error = new Error('Network error');
            const errorAction = asyncError('/users[0]', requestId, error, false);
            const newState = reducer(stateAfterStart, errorAction);
            
            expect(newState.data.users[0]).toEqual(optimisticData);
        });
    });

    describe('ASYNC_CANCEL', () => {
        it('should cancel operation and rollback optimistic updates', () => {
            const requestId = generateRequestId();
            const optimisticData = { id: 1, name: 'Optimistic John', profile: { email: 'john@example.com' } };
            const startAction = asyncStart('/users[0]', requestId, 'mutate', 'normal', optimisticData);
            const stateAfterStart = reducer(initialState, startAction);
            
            const cancelAction = asyncCancel('/users[0]', requestId);
            const newState = reducer(stateAfterStart, cancelAction);
            
            expect(newState.data).toEqual(initialState.data);
            expect(newState.asyncStates['/users[0]'].status).toBe('idle');
            expect(newState.pendingOperations.has(requestId)).toBe(false);
            expect(newState.optimisticUpdates).not.toHaveProperty(`${requestId}_/users[0]`);
        });
    });

    describe('XPath handling', () => {
        it('should handle relative XPaths correctly', () => {
            const stateWithXPath = { ...initialState, xpath: '/users' };
            const requestId = generateRequestId();
            const action = asyncStart('[0]', requestId, 'fetch');
            
            const newState = reducer(stateWithXPath, action);
            
            expect(newState.asyncStates['/users/[0]']).toBeDefined();
        });

        it('should handle absolute XPaths correctly', () => {
            const stateWithXPath = { ...initialState, xpath: '/users' };
            const requestId = generateRequestId();
            const action = asyncStart('/settings', requestId, 'fetch');
            
            const newState = reducer(stateWithXPath, action);
            
            expect(newState.asyncStates['/settings']).toBeDefined();
        });
    });

    describe('Multiple concurrent operations', () => {
        it('should handle multiple operations on different paths', () => {
            const requestId1 = generateRequestId();
            const requestId2 = generateRequestId();
            
            const action1 = asyncStart('/users[0]', requestId1, 'fetch');
            const stateAfterFirst = reducer(initialState, action1);
            
            const action2 = asyncStart('/users[1]', requestId2, 'fetch');
            const stateAfterSecond = reducer(stateAfterFirst, action2);
            
            expect(stateAfterSecond.asyncStates['/users[0]'].status).toBe('loading');
            expect(stateAfterSecond.asyncStates['/users[1]'].status).toBe('loading');
            expect(stateAfterSecond.pendingOperations.size).toBe(2);
        });

        it('should handle operations on the same path', () => {
            const requestId1 = generateRequestId();
            const requestId2 = generateRequestId();
            
            const action1 = asyncStart('/users[0]', requestId1, 'fetch');
            const stateAfterFirst = reducer(initialState, action1);
            
            const action2 = asyncStart('/users[0]', requestId2, 'mutate');
            const stateAfterSecond = reducer(stateAfterFirst, action2);
            
            expect(stateAfterSecond.asyncStates['/users[0]'].requestId).toBe(requestId2);
            expect(stateAfterSecond.pendingOperations.has(requestId1)).toBe(true);
            expect(stateAfterSecond.pendingOperations.has(requestId2)).toBe(true);
        });
    });
});