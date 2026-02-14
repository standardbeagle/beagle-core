import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { DataProvider } from '../provider';
import { useAsyncData } from './useAsyncData';

const TestProvider = ({ children }: { children: ReactNode }) => (
    <DataProvider initialData={{ users: [] }}>{children}</DataProvider>
);

describe('useAsyncData', () => {
    let mockFetcher: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockFetcher = vi.fn();
        vi.clearAllMocks();
    });

    it('should start in idle state', () => {
        mockFetcher.mockResolvedValue({ id: 1, name: 'John' });
        
        const { result } = renderHook(
            () => useAsyncData('/users[0]', mockFetcher, { enabled: false }),
            { wrapper: TestProvider }
        );

        expect(result.current.isIdle).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeUndefined();
        expect(result.current.error).toBeUndefined();
    });

    it('should fetch data when enabled', async () => {
        const userData = { id: 1, name: 'John' };
        mockFetcher.mockResolvedValue(userData);
        
        const { result } = renderHook(
            () => useAsyncData('/users[0]', mockFetcher),
            { wrapper: TestProvider }
        );

        expect(result.current.isLoading).toBe(true);
        
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(userData);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeUndefined();
        expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors', async () => {
        const error = new Error('Network error');
        mockFetcher.mockRejectedValue(error);

        const { result } = renderHook(
            () => useAsyncData('/users[0]', mockFetcher, { retryCount: 0 }),
            { wrapper: TestProvider }
        );

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBe(error);
        expect(result.current.data).toBeUndefined();
        expect(result.current.isLoading).toBe(false);
    });

    it('should retry on failure', async () => {
        mockFetcher
            .mockRejectedValueOnce(new Error('First failure'))
            .mockRejectedValueOnce(new Error('Second failure'))
            .mockResolvedValue({ id: 1, name: 'John' });

        const { result } = renderHook(
            () => useAsyncData('/users[0]', mockFetcher, { retryCount: 2, retryDelay: 10 }),
            { wrapper: TestProvider }
        );

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        }, { timeout: 3000 });

        expect(mockFetcher).toHaveBeenCalledTimes(3);
        expect(result.current.data).toEqual({ id: 1, name: 'John' });
    });

    it('should support manual refetch', async () => {
        const userData = { id: 1, name: 'John' };
        mockFetcher.mockResolvedValue(userData);
        
        const { result } = renderHook(
            () => useAsyncData('/users[0]', mockFetcher, { enabled: false }),
            { wrapper: TestProvider }
        );

        expect(mockFetcher).not.toHaveBeenCalled();
        
        await act(async () => {
            await result.current.refetch();
        });

        expect(mockFetcher).toHaveBeenCalledTimes(1);
        expect(result.current.data).toEqual(userData);
        expect(result.current.isSuccess).toBe(true);
    });

    it('should support cancellation', async () => {
        mockFetcher.mockImplementation(() =>
            new Promise((resolve) => setTimeout(() => resolve({ id: 1 }), 1000))
        );

        const { result } = renderHook(
            () => useAsyncData('/users[0]', mockFetcher),
            { wrapper: TestProvider }
        );

        expect(result.current.isLoading).toBe(true);

        act(() => {
            result.current.invalidate();
        });

        await waitFor(() => {
            expect(result.current.isIdle).toBe(true);
        });
    });

    it('should call onSuccess callback', async () => {
        const userData = { id: 1, name: 'John' };
        const onSuccess = vi.fn();
        mockFetcher.mockResolvedValue(userData);
        
        renderHook(
            () => useAsyncData('/users[0]', mockFetcher, { onSuccess }),
            { wrapper: TestProvider }
        );

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledWith(userData);
        });
    });

    it('should call onError callback', async () => {
        const error = new Error('Network error');
        const onError = vi.fn();
        mockFetcher.mockRejectedValue(error);
        
        renderHook(
            () => useAsyncData('/users[0]', mockFetcher, { onError, retryCount: 0 }),
            { wrapper: TestProvider }
        );

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(error);
        });
    });

    it('should respect staleTime configuration', async () => {
        const userData = { id: 1, name: 'John' };
        mockFetcher.mockResolvedValue(userData);
        
        const { result, rerender } = renderHook(
            () => useAsyncData('/users[0]', mockFetcher, { staleTime: 1000 }),
            { wrapper: TestProvider }
        );

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockFetcher).toHaveBeenCalledTimes(1);
        
        // Rerender immediately - should not refetch due to staleTime
        rerender();
        expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    it('should support invalidation', async () => {
        const userData = { id: 1, name: 'John' };
        mockFetcher.mockResolvedValue(userData);
        
        const { result } = renderHook(
            () => useAsyncData('/users[0]', mockFetcher),
            { wrapper: TestProvider }
        );

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        act(() => {
            result.current.invalidate();
        });

        await waitFor(() => {
            expect(result.current.isIdle).toBe(true);
        });
    });

    it('should handle relative XPaths correctly', async () => {
        const userData = { id: 1, name: 'John' };
        mockFetcher.mockResolvedValue(userData);
        
        const CustomProvider = ({ children }: { children: ReactNode }) => (
            <DataProvider initialData={{}} initialXPath="/users">{children}</DataProvider>
        );
        
        const { result } = renderHook(
            () => useAsyncData('[0]', mockFetcher),
            { wrapper: CustomProvider }
        );

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(userData);
    });

    it('should handle disabled state correctly', () => {
        mockFetcher.mockResolvedValue({ id: 1, name: 'John' });
        
        const { result } = renderHook(
            () => useAsyncData('/users[0]', mockFetcher, { enabled: false }),
            { wrapper: TestProvider }
        );

        expect(result.current.isIdle).toBe(true);
        expect(mockFetcher).not.toHaveBeenCalled();
    });
});