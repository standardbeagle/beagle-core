import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { DataProvider } from '../provider';
import { useAsyncMutation } from './useAsyncMutation';

const TestProvider = ({ children }: { children: ReactNode }) => (
    <DataProvider initialData={{ 
        users: [
            { id: 1, name: 'John', email: 'john@example.com' }
        ]
    }}>
        {children}
    </DataProvider>
);

describe('useAsyncMutation', () => {
    let mockMutationFn: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockMutationFn = vi.fn();
        vi.clearAllMocks();
    });

    it('should start in idle state', () => {
        const { result } = renderHook(
            () => useAsyncMutation('/users[0]', mockMutationFn),
            { wrapper: TestProvider }
        );

        expect(result.current.isIdle).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual({ id: 1, name: 'John', email: 'john@example.com' });
        expect(result.current.error).toBeUndefined();
    });

    it('should execute mutation successfully', async () => {
        const updatedUser = { id: 1, name: 'Jane', email: 'jane@example.com' };
        mockMutationFn.mockResolvedValue(updatedUser);
        
        const { result } = renderHook(
            () => useAsyncMutation('/users[0]', mockMutationFn),
            { wrapper: TestProvider }
        );

        await act(async () => {
            await result.current.mutateAsync({ name: 'Jane' });
        });

        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(updatedUser);
        expect(mockMutationFn).toHaveBeenCalledWith({ name: 'Jane' });
    });

    it('should handle mutation errors', async () => {
        const error = new Error('Update failed');
        mockMutationFn.mockRejectedValue(error);
        
        const { result } = renderHook(
            () => useAsyncMutation('/users[0]', mockMutationFn),
            { wrapper: TestProvider }
        );

        await act(async () => {
            try {
                await result.current.mutateAsync({ name: 'Jane' });
            } catch (e) {
                // Expected error
            }
        });

        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBe(error);
    });

    it('should apply optimistic updates', async () => {
        const updatedUser = { id: 1, name: 'Jane', email: 'jane@example.com' };
        mockMutationFn.mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve(updatedUser), 100))
        );
        
        const { result } = renderHook(
            () => useAsyncMutation('/users[0]', mockMutationFn, {
                optimisticUpdate: (current, variables) => ({
                    ...current,
                    ...variables
                })
            }),
            { wrapper: TestProvider }
        );

        act(() => {
            result.current.mutate({ name: 'Jane' });
        });

        // Should immediately show optimistic update
        expect(result.current.data).toEqual({
            id: 1,
            name: 'Jane',
            email: 'john@example.com'
        });
        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        // Should show final result
        expect(result.current.data).toEqual(updatedUser);
    });

    it('should rollback optimistic updates on error', async () => {
        const error = new Error('Update failed');
        mockMutationFn.mockRejectedValue(error);
        
        const originalData = { id: 1, name: 'John', email: 'john@example.com' };
        
        const { result } = renderHook(
            () => useAsyncMutation('/users[0]', mockMutationFn, {
                optimisticUpdate: (current, variables) => ({
                    ...current,
                    ...variables
                }),
                rollbackOnError: true
            }),
            { wrapper: TestProvider }
        );

        await act(async () => {
            try {
                await result.current.mutateAsync({ name: 'Jane' });
            } catch (e) {
                // Expected error
            }
        });

        // Should rollback to original data
        expect(result.current.data).toEqual(originalData);
        expect(result.current.isError).toBe(true);
    });

    it('should support mutation retry', async () => {
        mockMutationFn
            .mockRejectedValueOnce(new Error('First failure'))
            .mockResolvedValue({ id: 1, name: 'Jane', email: 'jane@example.com' });
        
        const { result } = renderHook(
            () => useAsyncMutation('/users[0]', mockMutationFn, { retryCount: 1 }),
            { wrapper: TestProvider }
        );

        await act(async () => {
            await result.current.mutateAsync({ name: 'Jane' });
        });

        expect(mockMutationFn).toHaveBeenCalledTimes(2);
        expect(result.current.isSuccess).toBe(true);
    });

    it('should call success callback', async () => {
        const updatedUser = { id: 1, name: 'Jane', email: 'jane@example.com' };
        const onSuccess = vi.fn();
        mockMutationFn.mockResolvedValue(updatedUser);
        
        const { result } = renderHook(
            () => useAsyncMutation('/users[0]', mockMutationFn, { onSuccess }),
            { wrapper: TestProvider }
        );

        await act(async () => {
            await result.current.mutateAsync({ name: 'Jane' });
        });

        expect(onSuccess).toHaveBeenCalledWith(updatedUser, { name: 'Jane' });
    });

    it('should call error callback', async () => {
        const error = new Error('Update failed');
        const onError = vi.fn();
        mockMutationFn.mockRejectedValue(error);
        
        const { result } = renderHook(
            () => useAsyncMutation('/users[0]', mockMutationFn, { onError, retryCount: 0 }),
            { wrapper: TestProvider }
        );

        await act(async () => {
            try {
                await result.current.mutateAsync({ name: 'Jane' });
            } catch (e) {
                // Expected error
            }
        });

        expect(onError).toHaveBeenCalledWith(error, { name: 'Jane' });
    });

    it('should call settled callback', async () => {
        const updatedUser = { id: 1, name: 'Jane', email: 'jane@example.com' };
        const onSettled = vi.fn();
        mockMutationFn.mockResolvedValue(updatedUser);
        
        const { result } = renderHook(
            () => useAsyncMutation('/users[0]', mockMutationFn, { onSettled }),
            { wrapper: TestProvider }
        );

        await act(async () => {
            await result.current.mutateAsync({ name: 'Jane' });
        });

        expect(onSettled).toHaveBeenCalledWith(updatedUser, undefined, { name: 'Jane' });
    });

    it('should support invalidation of related data', async () => {
        const updatedUser = { id: 1, name: 'Jane', email: 'jane@example.com' };
        mockMutationFn.mockResolvedValue(updatedUser);
        
        const { result } = renderHook(
            () => useAsyncMutation('/users[0]', mockMutationFn, {
                invalidate: ['/users', '/users[*]']
            }),
            { wrapper: TestProvider }
        );

        await act(async () => {
            await result.current.mutateAsync({ name: 'Jane' });
        });

        expect(result.current.isSuccess).toBe(true);
    });

    it('should support reset functionality', async () => {
        const error = new Error('Update failed');
        mockMutationFn.mockRejectedValue(error);
        
        const { result } = renderHook(
            () => useAsyncMutation('/users[0]', mockMutationFn),
            { wrapper: TestProvider }
        );

        await act(async () => {
            try {
                await result.current.mutateAsync({ name: 'Jane' });
            } catch (e) {
                // Expected error
            }
        });

        expect(result.current.isError).toBe(true);

        act(() => {
            result.current.reset();
        });

        expect(result.current.isIdle).toBe(true);
        expect(result.current.error).toBeUndefined();
    });

    it('should handle fire-and-forget mutations', () => {
        const updatedUser = { id: 1, name: 'Jane', email: 'jane@example.com' };
        mockMutationFn.mockResolvedValue(updatedUser);
        
        const { result } = renderHook(
            () => useAsyncMutation('/users[0]', mockMutationFn),
            { wrapper: TestProvider }
        );

        act(() => {
            result.current.mutate({ name: 'Jane' });
        });

        expect(result.current.isLoading).toBe(true);
        expect(mockMutationFn).toHaveBeenCalledWith({ name: 'Jane' });
    });
});