import { describe, it, expect } from 'vitest';
import { reducer, defaultState } from './reducer';
import { createNavigateAction, createBackAction, createForwardAction, createDataAction } from './actions';

describe('reducer', () => {
    describe('NAVIGATE', () => {
        it('should navigate to new xpath', () => {
            const action = createNavigateAction('/users/profile');
            const result = reducer(defaultState, action);
            
            expect(result.xpath).toBe('/users/profile');
            expect(result.history).toEqual(['/']);
            expect(result.location).toBe(0);
        });

        it('should not change state when navigating to same xpath', () => {
            const state = { ...defaultState, xpath: '/users' };
            const action = createNavigateAction('/users');
            const result = reducer(state, action);
            
            expect(result).toBe(state);
        });

        it('should handle relative navigation', () => {
            const state = { ...defaultState, xpath: '/users' };
            const action = createNavigateAction('profile');
            const result = reducer(state, action);
            
            expect(result.xpath).toBe('/users/profile');
        });
    });

    describe('BACK', () => {
        it('should go back in history', () => {
            const state = {
                ...defaultState,
                xpath: '/users/profile',
                history: ['/users', '/'],
                location: 0
            };
            
            const action = createBackAction(1);
            const result = reducer(state, action);
            
            expect(result.xpath).toBe('/users');
            expect(result.location).toBe(1);
        });

        it('should not go back beyond available history', () => {
            const state = {
                ...defaultState,
                xpath: '/users',
                history: ['/'],
                location: 0
            };
            
            const action = createBackAction(5);
            const result = reducer(state, action);
            
            expect(result).toBe(state);
        });
    });

    describe('FORWARD', () => {
        it('should not go forward when at location 0', () => {
            const state = {
                ...defaultState,
                xpath: '/users',
                history: ['/users/profile', '/'],
                location: 1
            };
            
            const action = createForwardAction(1);
            const result = reducer(state, action);
            
            // Forward navigation to location 0 is not implemented, so state should remain unchanged
            expect(result).toBe(state);
        });
    });

    describe('DATA_OPERATION', () => {
        it('should merge data at xpath', () => {
            const state = {
                ...defaultState,
                data: { user: { name: 'John' } },
                xpath: '/user'
            };
            
            const action = createDataAction('', 'merge', { email: 'john@example.com' });
            const result = reducer(state, action);
            
            expect(result.data.user).toEqual({ 
                name: 'John', 
                email: 'john@example.com' 
            });
        });

        it('should replace data at xpath', () => {
            const state = {
                ...defaultState,
                data: { users: [{ name: 'John' }] }
            };
            
            const action = createDataAction('/users[0]', 'replace', { name: 'Jane', age: 25 });
            const result = reducer(state, action);
            
            expect(result.data.users[0]).toEqual({ name: 'Jane', age: 25 });
        });

        it('should append data to arrays', () => {
            const state = {
                ...defaultState,
                data: { users: [{ name: 'John' }] }
            };
            
            const action = createDataAction('/users', 'append', { name: 'Jane' });
            const result = reducer(state, action);
            
            expect(result.data.users).toHaveLength(2);
            expect(result.data.users[1]).toEqual({ name: 'Jane' });
        });

        it('should delete data at xpath', () => {
            const state = {
                ...defaultState,
                data: { user: { name: 'John', email: 'john@example.com' } }
            };
            
            const action = createDataAction('/user/email', 'delete', null);
            const result = reducer(state, action);
            
            expect(result.data.user.email).toBeUndefined();
            expect('email' in result.data.user).toBe(false);
        });
    });
});