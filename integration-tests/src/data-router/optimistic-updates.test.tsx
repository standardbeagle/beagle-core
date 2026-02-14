import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useAsyncMutation,
  useOptimisticUpdates,
  useOptimisticList,
  useOptimisticObject,
  useDataAtXPath,
} from '@standardbeagle/data-router';
import { renderWithDataRouter } from '../test-utils';

function OptimisticMutationComponent({
  xpath,
  mutationFn,
  optimisticUpdate,
}: {
  xpath: string;
  mutationFn: (vars: any) => Promise<any>;
  optimisticUpdate: (current: any, vars: any) => any;
}) {
  const { mutateAsync, isLoading, isSuccess, isError, data, error } =
    useAsyncMutation(xpath, mutationFn, {
      optimisticUpdate,
      rollbackOnError: true,
    });

  return (
    <div>
      {isLoading && <span data-testid="opt-status">loading</span>}
      {isSuccess && <span data-testid="opt-status">success</span>}
      {isError && <span data-testid="opt-status">error</span>}
      {!isLoading && !isSuccess && !isError && (
        <span data-testid="opt-status">idle</span>
      )}
      {data !== undefined && (
        <span data-testid="opt-data">{JSON.stringify(data)}</span>
      )}
      {error && <span data-testid="opt-error">{error.message}</span>}
      <button
        data-testid="opt-mutate"
        onClick={() =>
          mutateAsync({ name: 'Optimistic' }).catch(() => {})
        }
      >
        Mutate
      </button>
    </div>
  );
}

function OptimisticUpdatesComponent({ xpath }: { xpath: string }) {
  const { apply, rollback, commit, hasOptimisticUpdates, optimisticUpdateIds } =
    useOptimisticUpdates(xpath);
  const data = useDataAtXPath(xpath);

  return (
    <div>
      <span data-testid="ou-data">{JSON.stringify(data)}</span>
      <span data-testid="ou-has-updates">
        {hasOptimisticUpdates ? 'yes' : 'no'}
      </span>
      <span data-testid="ou-ids">{JSON.stringify(optimisticUpdateIds)}</span>
      <button
        data-testid="ou-apply"
        onClick={() => {
          const id = apply({ name: 'OptimisticValue', version: 2 });
          // Store the ID for later use
          (window as any).__lastUpdateId = id;
        }}
      >
        Apply
      </button>
      <button
        data-testid="ou-rollback"
        onClick={() => {
          const id = (window as any).__lastUpdateId;
          if (id) rollback(id);
        }}
      >
        Rollback
      </button>
      <button
        data-testid="ou-commit"
        onClick={() => {
          const id = (window as any).__lastUpdateId;
          if (id) commit(id);
        }}
      >
        Commit
      </button>
    </div>
  );
}

function OptimisticListComponent({ xpath }: { xpath: string }) {
  const { addItem, removeItem, moveItem, hasOptimisticUpdates } =
    useOptimisticList<{ id: number; name: string }>(xpath);
  const data = useDataAtXPath(xpath);

  return (
    <div>
      <span data-testid="list-data">{JSON.stringify(data)}</span>
      <span data-testid="list-has-updates">
        {hasOptimisticUpdates ? 'yes' : 'no'}
      </span>
      <button
        data-testid="list-add"
        onClick={() => addItem({ id: 99, name: 'NewItem' })}
      >
        Add
      </button>
      <button
        data-testid="list-add-at-0"
        onClick={() => addItem({ id: 100, name: 'First' }, 0)}
      >
        Add at 0
      </button>
      <button data-testid="list-remove-0" onClick={() => removeItem(0)}>
        Remove 0
      </button>
      <button data-testid="list-move" onClick={() => moveItem(0, 2)}>
        Move 0-to-2
      </button>
    </div>
  );
}

function OptimisticObjectComponent({ xpath }: { xpath: string }) {
  const {
    updateProperty,
    updateProperties,
    removeProperty,
    mergeObject,
    hasOptimisticUpdates,
  } = useOptimisticObject<Record<string, any>>(xpath);
  const data = useDataAtXPath(xpath);

  return (
    <div>
      <span data-testid="obj-data">{JSON.stringify(data)}</span>
      <span data-testid="obj-has-updates">
        {hasOptimisticUpdates ? 'yes' : 'no'}
      </span>
      <button
        data-testid="obj-update-prop"
        onClick={() => updateProperty('name', 'Updated')}
      >
        Update Name
      </button>
      <button
        data-testid="obj-update-multi"
        onClick={() => updateProperties({ name: 'Multi', age: 25 })}
      >
        Update Multiple
      </button>
      <button
        data-testid="obj-remove-prop"
        onClick={() => removeProperty('email')}
      >
        Remove Email
      </button>
      <button
        data-testid="obj-merge"
        onClick={() => mergeObject({ settings: { theme: 'dark' } })}
      >
        Merge
      </button>
    </div>
  );
}

const sampleData = {
  users: [
    { id: 1, name: 'Alice', email: 'alice@test.com' },
    { id: 2, name: 'Bob', email: 'bob@test.com' },
    { id: 3, name: 'Charlie', email: 'charlie@test.com' },
  ],
  profile: { name: 'Alice', email: 'alice@test.com', settings: { theme: 'light' } },
  config: { version: '1.0' },
};

describe('Data Router: Optimistic Updates via Mutation', () => {
  let mockMutationFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockMutationFn = vi.fn();
    vi.clearAllMocks();
    delete (window as any).__lastUpdateId;
  });

  it('shows optimistic data immediately before mutation completes', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: any) => void;
    mockMutationFn.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    renderWithDataRouter(
      <OptimisticMutationComponent
        xpath="/users[0]"
        mutationFn={mockMutationFn}
        optimisticUpdate={(current, vars) => ({ ...current, ...vars })}
      />,
      { initialData: sampleData },
    );

    expect(screen.getByTestId('opt-data')).toHaveTextContent(
      JSON.stringify(sampleData.users[0]),
    );

    await user.click(screen.getByTestId('opt-mutate'));

    // Optimistic update applied immediately
    await waitFor(() => {
      expect(screen.getByTestId('opt-data')).toHaveTextContent(
        JSON.stringify({ ...sampleData.users[0], name: 'Optimistic' }),
      );
    });

    expect(screen.getByTestId('opt-status')).toHaveTextContent('loading');

    await act(async () => {
      resolvePromise!({ id: 1, name: 'ServerConfirmed', email: 'alice@test.com' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('opt-status')).toHaveTextContent('success');
    });

    expect(screen.getByTestId('opt-data')).toHaveTextContent(
      JSON.stringify({ id: 1, name: 'ServerConfirmed', email: 'alice@test.com' }),
    );
  });

  it('rolls back optimistic data on mutation failure', async () => {
    const user = userEvent.setup();
    mockMutationFn.mockRejectedValue(new Error('Server error'));

    renderWithDataRouter(
      <OptimisticMutationComponent
        xpath="/users[0]"
        mutationFn={mockMutationFn}
        optimisticUpdate={(current, vars) => ({ ...current, ...vars })}
      />,
      { initialData: sampleData },
    );

    const originalDataStr = JSON.stringify(sampleData.users[0]);
    expect(screen.getByTestId('opt-data')).toHaveTextContent(originalDataStr);

    await user.click(screen.getByTestId('opt-mutate'));

    await waitFor(() => {
      expect(screen.getByTestId('opt-status')).toHaveTextContent('error');
    });

    // Data should be rolled back to original
    expect(screen.getByTestId('opt-data')).toHaveTextContent(originalDataStr);
  });
});

describe('Data Router: useOptimisticUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).__lastUpdateId;
  });

  it('applies optimistic data immediately', async () => {
    const user = userEvent.setup();

    renderWithDataRouter(
      <OptimisticUpdatesComponent xpath="/config" />,
      { initialData: sampleData },
    );

    expect(screen.getByTestId('ou-data')).toHaveTextContent(
      JSON.stringify(sampleData.config),
    );
    expect(screen.getByTestId('ou-has-updates')).toHaveTextContent('no');

    await user.click(screen.getByTestId('ou-apply'));

    await waitFor(() => {
      expect(screen.getByTestId('ou-data')).toHaveTextContent(
        JSON.stringify({ name: 'OptimisticValue', version: 2 }),
      );
    });
  });

  it('tracks optimistic update IDs', async () => {
    const user = userEvent.setup();

    renderWithDataRouter(
      <OptimisticUpdatesComponent xpath="/config" />,
      { initialData: sampleData },
    );

    await user.click(screen.getByTestId('ou-apply'));

    await waitFor(() => {
      expect(screen.getByTestId('ou-has-updates')).toHaveTextContent('yes');
    });

    const ids = JSON.parse(screen.getByTestId('ou-ids').textContent!);
    expect(ids.length).toBeGreaterThan(0);
  });

  it('rolls back to original data', async () => {
    const user = userEvent.setup();

    renderWithDataRouter(
      <OptimisticUpdatesComponent xpath="/config" />,
      { initialData: sampleData },
    );

    const original = JSON.stringify(sampleData.config);

    await user.click(screen.getByTestId('ou-apply'));

    await waitFor(() => {
      expect(screen.getByTestId('ou-data')).not.toHaveTextContent(original);
    });

    await user.click(screen.getByTestId('ou-rollback'));

    await waitFor(() => {
      expect(screen.getByTestId('ou-has-updates')).toHaveTextContent('no');
    });
  });

  it('commits optimistic data as final', async () => {
    const user = userEvent.setup();

    renderWithDataRouter(
      <OptimisticUpdatesComponent xpath="/config" />,
      { initialData: sampleData },
    );

    await user.click(screen.getByTestId('ou-apply'));

    await waitFor(() => {
      expect(screen.getByTestId('ou-has-updates')).toHaveTextContent('yes');
    });

    await user.click(screen.getByTestId('ou-commit'));

    await waitFor(() => {
      expect(screen.getByTestId('ou-has-updates')).toHaveTextContent('no');
    });

    // Data should remain as the optimistic value after commit
    expect(screen.getByTestId('ou-data')).toHaveTextContent(
      JSON.stringify({ name: 'OptimisticValue', version: 2 }),
    );
  });
});

describe('Data Router: useOptimisticList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds an item to the end of the list', async () => {
    const user = userEvent.setup();

    renderWithDataRouter(
      <OptimisticListComponent xpath="/users" />,
      { initialData: sampleData },
    );

    expect(JSON.parse(screen.getByTestId('list-data').textContent!)).toHaveLength(3);

    await user.click(screen.getByTestId('list-add'));

    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('list-data').textContent!);
      expect(data).toHaveLength(4);
      expect(data[3]).toEqual({ id: 99, name: 'NewItem' });
    });
  });

  it('adds an item at a specific position', async () => {
    const user = userEvent.setup();

    renderWithDataRouter(
      <OptimisticListComponent xpath="/users" />,
      { initialData: sampleData },
    );

    await user.click(screen.getByTestId('list-add-at-0'));

    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('list-data').textContent!);
      expect(data).toHaveLength(4);
      expect(data[0]).toEqual({ id: 100, name: 'First' });
    });
  });

  it('removes an item by index', async () => {
    const user = userEvent.setup();

    renderWithDataRouter(
      <OptimisticListComponent xpath="/users" />,
      { initialData: sampleData },
    );

    await user.click(screen.getByTestId('list-remove-0'));

    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('list-data').textContent!);
      expect(data).toHaveLength(2);
      expect(data[0]).toEqual(sampleData.users[1]);
    });
  });

  it('reorders items in the list', async () => {
    const user = userEvent.setup();

    renderWithDataRouter(
      <OptimisticListComponent xpath="/users" />,
      { initialData: sampleData },
    );

    await user.click(screen.getByTestId('list-move'));

    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('list-data').textContent!);
      expect(data).toHaveLength(3);
      // After moveItem(0, 2): [Bob, Charlie, Alice]
      expect(data[0]).toEqual(sampleData.users[1]);
      expect(data[1]).toEqual(sampleData.users[2]);
      expect(data[2]).toEqual(sampleData.users[0]);
    });
  });
});

describe('Data Router: useOptimisticObject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a single property', async () => {
    const user = userEvent.setup();

    renderWithDataRouter(
      <OptimisticObjectComponent xpath="/profile" />,
      { initialData: sampleData },
    );

    await user.click(screen.getByTestId('obj-update-prop'));

    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('obj-data').textContent!);
      expect(data.name).toBe('Updated');
      expect(data.email).toBe('alice@test.com');
    });
  });

  it('updates multiple properties at once', async () => {
    const user = userEvent.setup();

    renderWithDataRouter(
      <OptimisticObjectComponent xpath="/profile" />,
      { initialData: sampleData },
    );

    await user.click(screen.getByTestId('obj-update-multi'));

    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('obj-data').textContent!);
      expect(data.name).toBe('Multi');
      expect(data.age).toBe(25);
      expect(data.email).toBe('alice@test.com');
    });
  });

  it('removes a property', async () => {
    const user = userEvent.setup();

    renderWithDataRouter(
      <OptimisticObjectComponent xpath="/profile" />,
      { initialData: sampleData },
    );

    await user.click(screen.getByTestId('obj-remove-prop'));

    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('obj-data').textContent!);
      expect(data.email).toBeUndefined();
      expect(data.name).toBe('Alice');
    });
  });

  it('deep merges nested objects', async () => {
    const user = userEvent.setup();

    renderWithDataRouter(
      <OptimisticObjectComponent xpath="/profile" />,
      { initialData: sampleData },
    );

    await user.click(screen.getByTestId('obj-merge'));

    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('obj-data').textContent!);
      expect(data.settings).toEqual({ theme: 'dark' });
      expect(data.name).toBe('Alice');
    });
  });
});
