import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useAsyncData,
  useAsyncMutation,
  useAsyncState,
} from '@standardbeagle/data-router';
import { renderWithDataRouter } from '../test-utils';

function AsyncDataDisplay({
  xpath,
  fetcher,
  config = {},
}: {
  xpath: string;
  fetcher: () => Promise<any>;
  config?: Parameters<typeof useAsyncData>[2];
}) {
  // Default staleTime prevents infinite refetch loops (staleTime=0 means
  // data is immediately stale after fetch, causing continuous refetching).
  const mergedConfig = { staleTime: 60000, ...config };
  const { data, isLoading, isError, isSuccess, isIdle, error, refetch } =
    useAsyncData(xpath, fetcher, mergedConfig);

  return (
    <div>
      {isIdle && <span data-testid="status">idle</span>}
      {isLoading && <span data-testid="status">loading</span>}
      {isSuccess && <span data-testid="status">success</span>}
      {isError && <span data-testid="status">error</span>}
      {data !== undefined && (
        <span data-testid="data">{JSON.stringify(data)}</span>
      )}
      {error && <span data-testid="error">{error.message}</span>}
      <button data-testid="refetch" onClick={() => refetch()}>
        Refetch
      </button>
    </div>
  );
}

function MutationComponent({
  xpath,
  mutationFn,
  config = {},
}: {
  xpath: string;
  mutationFn: (vars: any) => Promise<any>;
  config?: Parameters<typeof useAsyncMutation>[2];
}) {
  const { mutateAsync, isLoading, isError, isSuccess, isIdle, data, error, reset } =
    useAsyncMutation(xpath, mutationFn, config);

  return (
    <div>
      {isIdle && <span data-testid="mut-status">idle</span>}
      {isLoading && <span data-testid="mut-status">loading</span>}
      {isSuccess && <span data-testid="mut-status">success</span>}
      {isError && <span data-testid="mut-status">error</span>}
      {data !== undefined && (
        <span data-testid="mut-data">{JSON.stringify(data)}</span>
      )}
      {error && <span data-testid="mut-error">{error.message}</span>}
      <button
        data-testid="mutate"
        onClick={() => mutateAsync({ name: 'Updated' }).catch(() => {})}
      >
        Mutate
      </button>
      <button data-testid="reset" onClick={() => reset()}>
        Reset
      </button>
    </div>
  );
}

function AsyncStateDisplay({ xpath }: { xpath: string }) {
  const { isLoading, isError, isSuccess, isIdle, error, lastUpdated } =
    useAsyncState(xpath);

  return (
    <div>
      {isIdle && <span data-testid="async-state-status">idle</span>}
      {isLoading && <span data-testid="async-state-status">loading</span>}
      {isSuccess && <span data-testid="async-state-status">success</span>}
      {isError && <span data-testid="async-state-status">error</span>}
      {error && <span data-testid="async-state-error">{error.message}</span>}
      {lastUpdated !== undefined && (
        <span data-testid="last-updated">{lastUpdated}</span>
      )}
    </div>
  );
}

const sampleData = {
  users: [
    { id: 1, name: 'Alice', email: 'alice@test.com' },
    { id: 2, name: 'Bob', email: 'bob@test.com' },
  ],
  config: { version: '1.0' },
};

describe('Data Router: Async Data Fetching', () => {
  let mockFetcher: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetcher = vi.fn();
    vi.clearAllMocks();
  });

  describe('useAsyncData lifecycle', () => {
    it('shows loading state while fetching', async () => {
      let resolvePromise: (value: any) => void;
      mockFetcher.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          }),
      );

      renderWithDataRouter(
        <AsyncDataDisplay xpath="/users" fetcher={mockFetcher} />,
        { initialData: sampleData },
      );

      expect(screen.getByTestId('status')).toHaveTextContent('loading');

      await act(async () => {
        resolvePromise!([{ id: 3, name: 'Charlie' }]);
      });

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });
    });

    it('renders fetched data on success', async () => {
      const fetchedUsers = [{ id: 10, name: 'NewUser' }];
      mockFetcher.mockResolvedValue(fetchedUsers);

      renderWithDataRouter(
        <AsyncDataDisplay xpath="/users" fetcher={mockFetcher} />,
        { initialData: sampleData },
      );

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      expect(screen.getByTestId('data')).toHaveTextContent(
        JSON.stringify(fetchedUsers),
      );
    });

    it('shows error state on fetch failure', async () => {
      mockFetcher.mockRejectedValue(new Error('Network failure'));

      renderWithDataRouter(
        <AsyncDataDisplay
          xpath="/users"
          fetcher={mockFetcher}
          config={{ retryCount: 0 }}
        />,
        { initialData: sampleData },
      );

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('error');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Network failure');
    });

    it('does not fetch when disabled', () => {
      mockFetcher.mockResolvedValue([]);

      renderWithDataRouter(
        <AsyncDataDisplay
          xpath="/users"
          fetcher={mockFetcher}
          config={{ enabled: false }}
        />,
        { initialData: sampleData },
      );

      expect(screen.getByTestId('status')).toHaveTextContent('idle');
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    it('supports manual refetch', async () => {
      const user = userEvent.setup();
      const firstResult = [{ id: 1 }];
      const secondResult = [{ id: 2 }];
      mockFetcher
        .mockResolvedValueOnce(firstResult)
        .mockResolvedValueOnce(secondResult);

      renderWithDataRouter(
        <AsyncDataDisplay xpath="/users" fetcher={mockFetcher} />,
        { initialData: sampleData },
      );

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      expect(screen.getByTestId('data')).toHaveTextContent(
        JSON.stringify(firstResult),
      );

      await user.click(screen.getByTestId('refetch'));

      await waitFor(() => {
        expect(mockFetcher).toHaveBeenCalledTimes(2);
      });

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent(
          JSON.stringify(secondResult),
        );
      });
    });
  });

  describe('useAsyncData retry behavior', () => {
    it('retries the configured number of times then succeeds', async () => {
      mockFetcher
        .mockRejectedValueOnce(new Error('fail-1'))
        .mockRejectedValueOnce(new Error('fail-2'))
        .mockResolvedValue({ recovered: true });

      renderWithDataRouter(
        <AsyncDataDisplay
          xpath="/config"
          fetcher={mockFetcher}
          config={{ retryCount: 2, retryDelay: 10 }}
        />,
        { initialData: sampleData },
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('status')).toHaveTextContent('success');
        },
        { timeout: 5000 },
      );

      expect(mockFetcher).toHaveBeenCalledTimes(3);
      expect(screen.getByTestId('data')).toHaveTextContent(
        JSON.stringify({ recovered: true }),
      );
    });

    it('shows error after all retries exhausted', async () => {
      mockFetcher.mockRejectedValue(new Error('persistent failure'));

      renderWithDataRouter(
        <AsyncDataDisplay
          xpath="/config"
          fetcher={mockFetcher}
          config={{ retryCount: 1, retryDelay: 10 }}
        />,
        { initialData: sampleData },
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('status')).toHaveTextContent('error');
        },
        { timeout: 5000 },
      );

      expect(mockFetcher).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('error')).toHaveTextContent(
        'persistent failure',
      );
    });
  });

  describe('useAsyncData stale-while-revalidate', () => {
    it('keeps existing data visible while revalidating', async () => {
      const user = userEvent.setup();
      let callCount = 0;
      mockFetcher.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve({ version: 'v1' });
        return new Promise((resolve) =>
          setTimeout(() => resolve({ version: 'v2' }), 50),
        );
      });

      renderWithDataRouter(
        <AsyncDataDisplay
          xpath="/config"
          fetcher={mockFetcher}
          config={{ staleTime: 0 }}
        />,
        { initialData: sampleData },
      );

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      expect(screen.getByTestId('data')).toHaveTextContent(
        JSON.stringify({ version: 'v1' }),
      );

      await user.click(screen.getByTestId('refetch'));

      // During revalidation, previous data remains visible
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('loading');
      });
      expect(screen.getByTestId('data')).toHaveTextContent('v1');

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      expect(screen.getByTestId('data')).toHaveTextContent(
        JSON.stringify({ version: 'v2' }),
      );
    });
  });

  describe('useAsyncData callbacks', () => {
    it('calls onSuccess with fetched data', async () => {
      const onSuccess = vi.fn();
      const result = { fetched: true };
      mockFetcher.mockResolvedValue(result);

      renderWithDataRouter(
        <AsyncDataDisplay
          xpath="/config"
          fetcher={mockFetcher}
          config={{ onSuccess }}
        />,
        { initialData: sampleData },
      );

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(result);
      });
    });

    it('calls onError when fetch fails', async () => {
      const onError = vi.fn();
      const error = new Error('callback error');
      mockFetcher.mockRejectedValue(error);

      renderWithDataRouter(
        <AsyncDataDisplay
          xpath="/config"
          fetcher={mockFetcher}
          config={{ onError, retryCount: 0 }}
        />,
        { initialData: sampleData },
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
      });
    });
  });
});

describe('Data Router: Async Mutations', () => {
  let mockMutationFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockMutationFn = vi.fn();
    vi.clearAllMocks();
  });

  describe('useAsyncMutation lifecycle', () => {
    it('starts in idle state', () => {
      mockMutationFn.mockResolvedValue({});

      renderWithDataRouter(
        <MutationComponent xpath="/users[0]" mutationFn={mockMutationFn} />,
        { initialData: sampleData },
      );

      expect(screen.getByTestId('mut-status')).toHaveTextContent('idle');
    });

    it('transitions to loading on mutate', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: any) => void;
      mockMutationFn.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          }),
      );

      renderWithDataRouter(
        <MutationComponent xpath="/users[0]" mutationFn={mockMutationFn} />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('mutate'));

      await waitFor(() => {
        expect(screen.getByTestId('mut-status')).toHaveTextContent('loading');
      });

      await act(async () => {
        resolvePromise!({ id: 1, name: 'Updated' });
      });

      await waitFor(() => {
        expect(screen.getByTestId('mut-status')).toHaveTextContent('success');
      });
    });

    it('updates data on successful mutation', async () => {
      const user = userEvent.setup();
      const updated = { id: 1, name: 'Updated', email: 'updated@test.com' };
      mockMutationFn.mockResolvedValue(updated);

      renderWithDataRouter(
        <MutationComponent xpath="/users[0]" mutationFn={mockMutationFn} />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('mutate'));

      await waitFor(() => {
        expect(screen.getByTestId('mut-status')).toHaveTextContent('success');
      });

      expect(screen.getByTestId('mut-data')).toHaveTextContent(
        JSON.stringify(updated),
      );
    });

    it('shows error on mutation failure', async () => {
      const user = userEvent.setup();
      mockMutationFn.mockRejectedValue(new Error('Mutation failed'));

      renderWithDataRouter(
        <MutationComponent xpath="/users[0]" mutationFn={mockMutationFn} />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('mutate'));

      await waitFor(() => {
        expect(screen.getByTestId('mut-status')).toHaveTextContent('error');
      });

      expect(screen.getByTestId('mut-error')).toHaveTextContent(
        'Mutation failed',
      );
    });

    it('resets mutation state', async () => {
      const user = userEvent.setup();
      mockMutationFn.mockRejectedValue(new Error('fail'));

      renderWithDataRouter(
        <MutationComponent xpath="/users[0]" mutationFn={mockMutationFn} />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('mutate'));

      await waitFor(() => {
        expect(screen.getByTestId('mut-status')).toHaveTextContent('error');
      });

      await user.click(screen.getByTestId('reset'));

      await waitFor(() => {
        expect(screen.getByTestId('mut-status')).toHaveTextContent('idle');
      });
    });
  });

  describe('useAsyncMutation retry', () => {
    it('retries on failure before reporting error', async () => {
      const user = userEvent.setup();
      mockMutationFn
        .mockRejectedValueOnce(new Error('transient'))
        .mockResolvedValue({ id: 1, name: 'Updated' });

      renderWithDataRouter(
        <MutationComponent
          xpath="/users[0]"
          mutationFn={mockMutationFn}
          config={{ retryCount: 1, retryDelay: 10 }}
        />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('mutate'));

      await waitFor(
        () => {
          expect(screen.getByTestId('mut-status')).toHaveTextContent('success');
        },
        { timeout: 5000 },
      );

      expect(mockMutationFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('useAsyncMutation callbacks', () => {
    it('calls onSuccess and onSettled on success', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const onSettled = vi.fn();
      const result = { id: 1, name: 'Done' };
      mockMutationFn.mockResolvedValue(result);

      renderWithDataRouter(
        <MutationComponent
          xpath="/users[0]"
          mutationFn={mockMutationFn}
          config={{ onSuccess, onSettled }}
        />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('mutate'));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(result, { name: 'Updated' });
      });

      expect(onSettled).toHaveBeenCalledWith(
        result,
        undefined,
        { name: 'Updated' },
      );
    });

    it('calls onError and onSettled on failure', async () => {
      const user = userEvent.setup();
      const onError = vi.fn();
      const onSettled = vi.fn();
      const error = new Error('cb-fail');
      mockMutationFn.mockRejectedValue(error);

      renderWithDataRouter(
        <MutationComponent
          xpath="/users[0]"
          mutationFn={mockMutationFn}
          config={{ onError, onSettled, retryCount: 0 }}
        />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('mutate'));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error, { name: 'Updated' });
      });

      expect(onSettled).toHaveBeenCalledWith(
        undefined,
        error,
        { name: 'Updated' },
      );
    });
  });
});

describe('Data Router: Async State Tracking', () => {
  it('tracks async state for a given xpath', async () => {
    const mockFetcher = vi.fn().mockResolvedValue({ tracked: true });

    renderWithDataRouter(
      <div>
        <AsyncDataDisplay xpath="/config" fetcher={mockFetcher} />
        <AsyncStateDisplay xpath="/config" />
      </div>,
      { initialData: sampleData },
    );

    await waitFor(() => {
      expect(screen.getByTestId('async-state-status')).toHaveTextContent(
        'success',
      );
    });

    expect(screen.getByTestId('last-updated')).toBeTruthy();
  });

  it('shows loading state via useAsyncState during fetch', async () => {
    let resolvePromise: (value: any) => void;
    const mockFetcher = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    renderWithDataRouter(
      <div>
        <AsyncDataDisplay xpath="/config" fetcher={mockFetcher} />
        <AsyncStateDisplay xpath="/config" />
      </div>,
      { initialData: sampleData },
    );

    await waitFor(() => {
      expect(screen.getByTestId('async-state-status')).toHaveTextContent(
        'loading',
      );
    });

    await act(async () => {
      resolvePromise!({ done: true });
    });

    await waitFor(() => {
      expect(screen.getByTestId('async-state-status')).toHaveTextContent(
        'success',
      );
    });
  });

  it('shows error state via useAsyncState on failure', async () => {
    const mockFetcher = vi
      .fn()
      .mockRejectedValue(new Error('state-track-error'));

    renderWithDataRouter(
      <div>
        <AsyncDataDisplay
          xpath="/config"
          fetcher={mockFetcher}
          config={{ retryCount: 0 }}
        />
        <AsyncStateDisplay xpath="/config" />
      </div>,
      { initialData: sampleData },
    );

    await waitFor(() => {
      expect(screen.getByTestId('async-state-status')).toHaveTextContent(
        'error',
      );
    });

    expect(screen.getByTestId('async-state-error')).toHaveTextContent(
      'state-track-error',
    );
  });
});
