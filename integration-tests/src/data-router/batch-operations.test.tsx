import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, useCallback } from 'react';
import {
  useAsyncBatch,
  useAsyncParallel,
  useAsyncSequential,
  useAsyncMutation,
  useInvalidation,
  useAutoInvalidation,
  useAsyncState,
  useDataAtXPath,
} from '@standardbeagle/data-router';
import type { BatchOperation, BatchResult } from '@standardbeagle/data-router';
import { renderWithDataRouter } from '../test-utils';

/**
 * BatchComponent stores execute() results in React state so the component
 * re-renders and we can verify the outcome. The hook's internal refs
 * (statusRef, resultsRef) do not trigger re-renders on their own.
 */
function BatchComponent({
  operations,
  config = {},
}: {
  operations: BatchOperation[];
  config?: Parameters<typeof useAsyncBatch>[1];
}) {
  const { execute } = useAsyncBatch(operations, config);
  const [outcome, setOutcome] = useState<{
    status: string;
    results: BatchResult[];
  }>({ status: 'idle', results: [] });

  const handleExecute = useCallback(async () => {
    setOutcome((prev) => ({ ...prev, status: 'loading' }));
    try {
      const results = await execute();
      setOutcome({ status: 'done', results });
    } catch {
      setOutcome((prev) => ({ ...prev, status: 'error' }));
    }
  }, [execute]);

  return (
    <div>
      <span data-testid="batch-status">{outcome.status}</span>
      <span data-testid="batch-results">{JSON.stringify(outcome.results)}</span>
      <button data-testid="batch-execute" onClick={handleExecute}>
        Execute
      </button>
    </div>
  );
}

function ParallelComponent({
  operations,
}: {
  operations: Array<{ xpath: string; fetcher: () => Promise<any> }>;
}) {
  const { execute } = useAsyncParallel(operations);
  const [outcome, setOutcome] = useState<{
    status: string;
    results: BatchResult[];
  }>({ status: 'idle', results: [] });

  const handleExecute = useCallback(async () => {
    setOutcome((prev) => ({ ...prev, status: 'loading' }));
    try {
      const results = await execute();
      setOutcome({ status: 'done', results });
    } catch {
      setOutcome((prev) => ({ ...prev, status: 'error' }));
    }
  }, [execute]);

  return (
    <div>
      <span data-testid="par-status">{outcome.status}</span>
      <span data-testid="par-results">{JSON.stringify(outcome.results)}</span>
      <button data-testid="par-execute" onClick={handleExecute}>
        Execute
      </button>
    </div>
  );
}

function SequentialComponent({
  operations,
}: {
  operations: Array<{ xpath: string; fetcher: () => Promise<any> }>;
}) {
  const { execute } = useAsyncSequential(operations);
  const [outcome, setOutcome] = useState<{
    status: string;
    results: BatchResult[];
  }>({ status: 'idle', results: [] });

  const handleExecute = useCallback(async () => {
    setOutcome((prev) => ({ ...prev, status: 'loading' }));
    try {
      const results = await execute();
      setOutcome({ status: 'done', results });
    } catch {
      setOutcome((prev) => ({ ...prev, status: 'error' }));
    }
  }, [execute]);

  return (
    <div>
      <span data-testid="seq-status">{outcome.status}</span>
      <span data-testid="seq-results">{JSON.stringify(outcome.results)}</span>
      <button data-testid="seq-execute" onClick={handleExecute}>
        Execute
      </button>
    </div>
  );
}

function AsyncStateTracker({ xpaths }: { xpaths: string[] }) {
  return (
    <div>
      {xpaths.map((xpath) => (
        <AsyncStateItem key={xpath} xpath={xpath} />
      ))}
    </div>
  );
}

function AsyncStateItem({ xpath }: { xpath: string }) {
  const { isLoading, isSuccess, isError } = useAsyncState(xpath);
  const status = isLoading ? 'loading' : isSuccess ? 'success' : isError ? 'error' : 'idle';
  return <span data-testid={`state-${xpath}`}>{status}</span>;
}

function InvalidationComponent({ xpath }: { xpath: string }) {
  const { invalidate, invalidateAll, getInvalidationCount } = useInvalidation();
  const data = useDataAtXPath(xpath);

  return (
    <div>
      <span data-testid="inv-data">{JSON.stringify(data)}</span>
      <span data-testid="inv-count">{getInvalidationCount()}</span>
      <button
        data-testid="inv-invalidate"
        onClick={() => invalidate(xpath)}
      >
        Invalidate
      </button>
      <button data-testid="inv-all" onClick={() => invalidateAll()}>
        Invalidate All
      </button>
    </div>
  );
}

function AutoInvalidationComponent({
  fetchXpath,
  dependencies,
}: {
  fetchXpath: string;
  dependencies: string[];
}) {
  const { trigger } = useAutoInvalidation(dependencies, { debounceMs: 10 });
  const data = useDataAtXPath(fetchXpath);

  return (
    <div>
      <span data-testid="auto-data">{JSON.stringify(data)}</span>
      <button data-testid="auto-trigger" onClick={() => trigger()}>
        Trigger
      </button>
    </div>
  );
}

function MutationWithInvalidation({
  xpath,
  mutationFn,
}: {
  xpath: string;
  mutationFn: (vars: any) => Promise<any>;
}) {
  const { mutateAsync, isLoading, isSuccess, isIdle, data } =
    useAsyncMutation(xpath, mutationFn);

  return (
    <div>
      {isIdle && <span data-testid="mi-status">idle</span>}
      {isLoading && <span data-testid="mi-status">loading</span>}
      {isSuccess && <span data-testid="mi-status">success</span>}
      {data !== undefined && (
        <span data-testid="mi-data">{JSON.stringify(data)}</span>
      )}
      <button
        data-testid="mi-mutate"
        onClick={() => mutateAsync({ update: true }).catch(() => {})}
      >
        Mutate
      </button>
    </div>
  );
}

function InvalidateButton({ xpath }: { xpath: string }) {
  const { invalidate, invalidateAll } = useInvalidation();

  return (
    <div>
      <button data-testid="inv-invalidate" onClick={() => invalidate(xpath)}>
        Invalidate
      </button>
      <button data-testid="inv-all" onClick={() => invalidateAll()}>
        Invalidate All
      </button>
    </div>
  );
}

const sampleData = {
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ],
  config: { version: '1.0' },
  items: [
    { id: 10, title: 'Item A' },
    { id: 20, title: 'Item B' },
  ],
};

describe('Data Router: Batch Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAsyncBatch', () => {
    it('starts in idle state before execution', () => {
      const operations: BatchOperation[] = [
        { xpath: '/users', fetcher: vi.fn().mockResolvedValue([]) },
      ];

      renderWithDataRouter(
        <BatchComponent operations={operations} />,
        { initialData: sampleData },
      );

      expect(screen.getByTestId('batch-status')).toHaveTextContent('idle');
    });

    it('executes multiple operations and returns results', async () => {
      const user = userEvent.setup();
      const fetcher1 = vi.fn().mockResolvedValue([{ id: 1 }]);
      const fetcher2 = vi.fn().mockResolvedValue({ version: '2.0' });

      const operations: BatchOperation[] = [
        { xpath: '/users', fetcher: fetcher1 },
        { xpath: '/config', fetcher: fetcher2 },
      ];

      renderWithDataRouter(
        <BatchComponent operations={operations} />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('batch-execute'));

      await waitFor(() => {
        expect(screen.getByTestId('batch-status')).toHaveTextContent('done');
      });

      const results = JSON.parse(
        screen.getByTestId('batch-results').textContent!,
      );
      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('success');
      expect(results[0].data).toEqual([{ id: 1 }]);
      expect(results[1].status).toBe('success');
      expect(results[1].data).toEqual({ version: '2.0' });
      expect(fetcher1).toHaveBeenCalledTimes(1);
      expect(fetcher2).toHaveBeenCalledTimes(1);
    });

    it('handles partial failures without failFast', async () => {
      const user = userEvent.setup();
      const fetcher1 = vi.fn().mockResolvedValue([{ id: 1 }]);
      const fetcher2 = vi
        .fn()
        .mockRejectedValue(new Error('batch-item-fail'));

      const operations: BatchOperation[] = [
        { xpath: '/users', fetcher: fetcher1 },
        { xpath: '/config', fetcher: fetcher2 },
      ];

      renderWithDataRouter(
        <BatchComponent
          operations={operations}
          config={{ failFast: false, retryCount: 0 }}
        />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('batch-execute'));

      await waitFor(() => {
        expect(screen.getByTestId('batch-status')).toHaveTextContent('done');
      });

      const results = JSON.parse(
        screen.getByTestId('batch-results').textContent!,
      );
      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('error');
    });

    it('updates per-operation async states in the store', async () => {
      const user = userEvent.setup();
      const fetcher1 = vi.fn().mockResolvedValue([{ id: 1 }]);
      const fetcher2 = vi.fn().mockResolvedValue({ version: '2.0' });

      const operations: BatchOperation[] = [
        { xpath: '/users', fetcher: fetcher1 },
        { xpath: '/config', fetcher: fetcher2 },
      ];

      renderWithDataRouter(
        <div>
          <BatchComponent operations={operations} />
          <AsyncStateTracker xpaths={['/users', '/config']} />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('batch-execute'));

      await waitFor(() => {
        expect(screen.getByTestId('state-/users')).toHaveTextContent('success');
        expect(screen.getByTestId('state-/config')).toHaveTextContent('success');
      });
    });

    it('calls onBatchComplete when all operations succeed', async () => {
      const user = userEvent.setup();
      const onBatchComplete = vi.fn();

      const operations: BatchOperation[] = [
        { xpath: '/users', fetcher: vi.fn().mockResolvedValue([]) },
        { xpath: '/config', fetcher: vi.fn().mockResolvedValue({}) },
      ];

      renderWithDataRouter(
        <BatchComponent
          operations={operations}
          config={{ onBatchComplete }}
        />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('batch-execute'));

      await waitFor(() => {
        expect(onBatchComplete).toHaveBeenCalledTimes(1);
      });

      const callResults = onBatchComplete.mock.calls[0][0];
      expect(callResults).toHaveLength(2);
      expect(callResults.every((r: any) => r.status === 'success')).toBe(true);
    });

    it('calls onBatchError when some operations fail', async () => {
      const user = userEvent.setup();
      const onBatchError = vi.fn();

      const operations: BatchOperation[] = [
        { xpath: '/users', fetcher: vi.fn().mockResolvedValue([]) },
        {
          xpath: '/config',
          fetcher: vi.fn().mockRejectedValue(new Error('fail')),
        },
      ];

      renderWithDataRouter(
        <BatchComponent
          operations={operations}
          config={{ onBatchError, retryCount: 0 }}
        />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('batch-execute'));

      await waitFor(() => {
        expect(onBatchError).toHaveBeenCalledTimes(1);
      });
    });

    it('retries failed operations before reporting', async () => {
      const user = userEvent.setup();
      const fetcher = vi
        .fn()
        .mockRejectedValueOnce(new Error('transient'))
        .mockResolvedValue({ recovered: true });

      const operations: BatchOperation[] = [
        { xpath: '/config', fetcher },
      ];

      renderWithDataRouter(
        <BatchComponent
          operations={operations}
          config={{ retryCount: 1, retryDelay: 10 }}
        />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('batch-execute'));

      await waitFor(
        () => {
          expect(screen.getByTestId('batch-status')).toHaveTextContent('done');
        },
        { timeout: 5000 },
      );

      expect(fetcher).toHaveBeenCalledTimes(2);

      const results = JSON.parse(
        screen.getByTestId('batch-results').textContent!,
      );
      expect(results[0].status).toBe('success');
    });

    it('calls per-operation onSuccess callback', async () => {
      const user = userEvent.setup();
      const opSuccess = vi.fn();

      const operations: BatchOperation[] = [
        {
          xpath: '/config',
          fetcher: vi.fn().mockResolvedValue({ ok: true }),
          onSuccess: opSuccess,
        },
      ];

      renderWithDataRouter(
        <BatchComponent operations={operations} />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('batch-execute'));

      await waitFor(() => {
        expect(opSuccess).toHaveBeenCalledWith({ ok: true });
      });
    });

    it('calls per-operation onError callback', async () => {
      const user = userEvent.setup();
      const opError = vi.fn();

      const operations: BatchOperation[] = [
        {
          xpath: '/config',
          fetcher: vi.fn().mockRejectedValue(new Error('op-error')),
          onError: opError,
        },
      ];

      renderWithDataRouter(
        <BatchComponent
          operations={operations}
          config={{ retryCount: 0 }}
        />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('batch-execute'));

      await waitFor(() => {
        expect(opError).toHaveBeenCalledTimes(1);
      });

      expect(opError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(opError.mock.calls[0][0].message).toBe('op-error');
    });
  });

  describe('useAsyncParallel', () => {
    it('runs all operations concurrently and returns results', async () => {
      const user = userEvent.setup();
      const fetcher1 = vi.fn().mockResolvedValue([{ id: 1 }]);
      const fetcher2 = vi.fn().mockResolvedValue({ version: '2.0' });

      const operations = [
        { xpath: '/users', fetcher: fetcher1 },
        { xpath: '/config', fetcher: fetcher2 },
      ];

      renderWithDataRouter(
        <ParallelComponent operations={operations} />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('par-execute'));

      await waitFor(() => {
        expect(screen.getByTestId('par-status')).toHaveTextContent('done');
      });

      expect(fetcher1).toHaveBeenCalledTimes(1);
      expect(fetcher2).toHaveBeenCalledTimes(1);

      const results = JSON.parse(
        screen.getByTestId('par-results').textContent!,
      );
      expect(results).toHaveLength(2);
      expect(results.every((r: any) => r.status === 'success')).toBe(true);
    });

    it('handles mixed success and failure in parallel', async () => {
      const user = userEvent.setup();

      const operations = [
        { xpath: '/users', fetcher: vi.fn().mockResolvedValue([]) },
        {
          xpath: '/config',
          fetcher: vi.fn().mockRejectedValue(new Error('par-fail')),
        },
      ];

      renderWithDataRouter(
        <ParallelComponent operations={operations} />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('par-execute'));

      await waitFor(() => {
        expect(screen.getByTestId('par-status')).toHaveTextContent('done');
      });

      const results = JSON.parse(
        screen.getByTestId('par-results').textContent!,
      );
      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('error');
    });

    it('updates per-operation async states in parallel', async () => {
      const user = userEvent.setup();

      const operations = [
        { xpath: '/users', fetcher: vi.fn().mockResolvedValue([]) },
        { xpath: '/config', fetcher: vi.fn().mockResolvedValue({}) },
      ];

      renderWithDataRouter(
        <div>
          <ParallelComponent operations={operations} />
          <AsyncStateTracker xpaths={['/users', '/config']} />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('par-execute'));

      await waitFor(() => {
        expect(screen.getByTestId('state-/users')).toHaveTextContent('success');
        expect(screen.getByTestId('state-/config')).toHaveTextContent('success');
      });
    });
  });

  describe('useAsyncSequential', () => {
    it('runs operations in order and returns results', async () => {
      const user = userEvent.setup();
      const fetcher1 = vi.fn().mockResolvedValue([{ id: 1 }]);
      const fetcher2 = vi.fn().mockResolvedValue({ version: '2.0' });

      const operations = [
        { xpath: '/users', fetcher: fetcher1 },
        { xpath: '/config', fetcher: fetcher2 },
      ];

      renderWithDataRouter(
        <SequentialComponent operations={operations} />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('seq-execute'));

      await waitFor(() => {
        expect(screen.getByTestId('seq-status')).toHaveTextContent('done');
      });

      expect(fetcher1).toHaveBeenCalledTimes(1);
      expect(fetcher2).toHaveBeenCalledTimes(1);

      const results = JSON.parse(
        screen.getByTestId('seq-results').textContent!,
      );
      expect(results).toHaveLength(2);
      expect(results.every((r: any) => r.status === 'success')).toBe(true);
    });

    it('handles failure in sequential operations', async () => {
      const user = userEvent.setup();

      const operations = [
        { xpath: '/users', fetcher: vi.fn().mockResolvedValue([]) },
        {
          xpath: '/config',
          fetcher: vi.fn().mockRejectedValue(new Error('seq-fail')),
        },
      ];

      renderWithDataRouter(
        <SequentialComponent operations={operations} />,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('seq-execute'));

      await waitFor(() => {
        expect(screen.getByTestId('seq-status')).toHaveTextContent('done');
      });

      const results = JSON.parse(
        screen.getByTestId('seq-results').textContent!,
      );
      expect(results[1].status).toBe('error');
    });

    it('updates per-operation async states sequentially', async () => {
      const user = userEvent.setup();

      const operations = [
        { xpath: '/users', fetcher: vi.fn().mockResolvedValue([]) },
        { xpath: '/items', fetcher: vi.fn().mockResolvedValue([]) },
      ];

      renderWithDataRouter(
        <div>
          <SequentialComponent operations={operations} />
          <AsyncStateTracker xpaths={['/users', '/items']} />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('seq-execute'));

      await waitFor(() => {
        expect(screen.getByTestId('state-/users')).toHaveTextContent('success');
        expect(screen.getByTestId('state-/items')).toHaveTextContent('success');
      });
    });
  });
});

describe('Data Router: Cache Invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useInvalidation', () => {
    it('manually invalidates async state back to idle', async () => {
      const user = userEvent.setup();
      const mockMutation = vi.fn().mockResolvedValue({ version: 'updated' });

      renderWithDataRouter(
        <div>
          <MutationWithInvalidation xpath="/config" mutationFn={mockMutation} />
          <InvalidateButton xpath="/config" />
          <AsyncStateItem xpath="/config" />
        </div>,
        { initialData: sampleData },
      );

      // Initially idle
      expect(screen.getByTestId('mi-status')).toHaveTextContent('idle');

      // Perform a mutation to establish async state
      await user.click(screen.getByTestId('mi-mutate'));

      await waitFor(() => {
        expect(screen.getByTestId('mi-status')).toHaveTextContent('success');
      });

      expect(screen.getByTestId('state-/config')).toHaveTextContent('success');

      // Invalidate should reset async state to idle
      await user.click(screen.getByTestId('inv-invalidate'));

      await waitFor(() => {
        expect(screen.getByTestId('state-/config')).toHaveTextContent('idle');
      });
    });

    it('invalidateAll clears all async states', async () => {
      const user = userEvent.setup();
      const mockMutation = vi.fn().mockResolvedValue({ updated: true });

      renderWithDataRouter(
        <div>
          <MutationWithInvalidation xpath="/config" mutationFn={mockMutation} />
          <InvalidateButton xpath="/config" />
          <AsyncStateItem xpath="/config" />
        </div>,
        { initialData: sampleData },
      );

      // Perform mutation to establish async state
      await user.click(screen.getByTestId('mi-mutate'));

      await waitFor(() => {
        expect(screen.getByTestId('state-/config')).toHaveTextContent('success');
      });

      // invalidateAll should clear all states
      await user.click(screen.getByTestId('inv-all'));

      await waitFor(() => {
        expect(screen.getByTestId('state-/config')).toHaveTextContent('idle');
      });
    });
  });

  describe('useAutoInvalidation', () => {
    it('provides a trigger function for invalidation', async () => {
      const user = userEvent.setup();

      renderWithDataRouter(
        <AutoInvalidationComponent
          fetchXpath="/config"
          dependencies={['/config']}
        />,
        { initialData: sampleData },
      );

      expect(screen.getByTestId('auto-data')).toHaveTextContent(
        JSON.stringify(sampleData.config),
      );

      await user.click(screen.getByTestId('auto-trigger'));

      // Data should still be accessible after trigger
      expect(screen.getByTestId('auto-data')).toHaveTextContent('version');
    });
  });
});
