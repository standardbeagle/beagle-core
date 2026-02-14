import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useDataManipulation,
  useData,
  useDataAtXPath,
  useTargetData,
  useNavigate,
} from '@standardbeagle/data-router';
import { renderWithDataRouter } from '../test-utils';

function DataDisplay() {
  const data = useData();
  return <span data-testid="data">{JSON.stringify(data)}</span>;
}

function DataAtPath({ xpath }: { xpath: string }) {
  const data = useDataAtXPath(xpath);
  return <span data-testid={`data-${xpath}`}>{JSON.stringify(data)}</span>;
}

function SetDataButton({ xpath, value, label }: { xpath: string; value: any; label: string }) {
  const { setData } = useDataManipulation();
  return (
    <button data-testid={`set-${label}`} onClick={() => setData(xpath, value)}>
      {label}
    </button>
  );
}

function MergeDataButton({ xpath, value, label }: { xpath: string; value: any; label: string }) {
  const { mergeData } = useDataManipulation();
  return (
    <button data-testid={`merge-${label}`} onClick={() => mergeData(xpath, value)}>
      {label}
    </button>
  );
}

function ReplaceDataButton({ xpath, value, label }: { xpath: string; value: any; label: string }) {
  const { replaceData } = useDataManipulation();
  return (
    <button data-testid={`replace-${label}`} onClick={() => replaceData(xpath, value)}>
      {label}
    </button>
  );
}

function AppendDataButton({ xpath, value, label }: { xpath: string; value: any; label: string }) {
  const { appendData } = useDataManipulation();
  return (
    <button data-testid={`append-${label}`} onClick={() => appendData(xpath, value)}>
      {label}
    </button>
  );
}

function DeleteDataButton({ xpath, label }: { xpath: string; label: string }) {
  const { deleteData } = useDataManipulation();
  return (
    <button data-testid={`delete-${label}`} onClick={() => deleteData(xpath)}>
      {label}
    </button>
  );
}

function NavigateButton({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button data-testid={`nav-${label}`} onClick={() => navigate(to)}>
      {label}
    </button>
  );
}

const sampleData = {
  users: {
    profile: { name: 'Alice', age: 30 },
    settings: { theme: 'dark', lang: 'en' },
  },
  items: [
    { id: 1, title: 'First' },
    { id: 2, title: 'Second' },
  ],
  config: { version: '1.0' },
};

describe('Data Router: CRUD Operations', () => {
  describe('setData (replace)', () => {
    it('replaces data at a top-level xpath', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <SetDataButton xpath="/config" value={{ version: '2.0', debug: true }} label="config" />
          <DataAtPath xpath="/config" />
        </div>,
        { initialData: sampleData },
      );

      expect(JSON.parse(screen.getByTestId('data-/config').textContent!)).toEqual({ version: '1.0' });
      await user.click(screen.getByTestId('set-config'));
      expect(JSON.parse(screen.getByTestId('data-/config').textContent!)).toEqual({ version: '2.0', debug: true });
    });

    it('replaces data at a nested xpath', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <SetDataButton xpath="/users/profile" value={{ name: 'Bob', age: 25 }} label="profile" />
          <DataAtPath xpath="/users/profile" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('set-profile'));
      expect(JSON.parse(screen.getByTestId('data-/users/profile').textContent!)).toEqual({ name: 'Bob', age: 25 });
    });

    it('replaces a scalar value at a leaf xpath', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <SetDataButton xpath="/users/profile/name" value="Charlie" label="name" />
          <DataAtPath xpath="/users/profile/name" />
        </div>,
        { initialData: sampleData },
      );

      expect(screen.getByTestId('data-/users/profile/name')).toHaveTextContent('"Alice"');
      await user.click(screen.getByTestId('set-name'));
      expect(screen.getByTestId('data-/users/profile/name')).toHaveTextContent('"Charlie"');
    });
  });

  describe('mergeData', () => {
    it('merges partial data into an existing object', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <MergeDataButton xpath="/users/profile" value={{ email: 'alice@test.com' }} label="profile" />
          <DataAtPath xpath="/users/profile" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('merge-profile'));
      const result = JSON.parse(screen.getByTestId('data-/users/profile').textContent!);
      expect(result).toEqual({ name: 'Alice', age: 30, email: 'alice@test.com' });
    });

    it('overwrites existing fields during merge', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <MergeDataButton xpath="/users/settings" value={{ theme: 'light' }} label="settings" />
          <DataAtPath xpath="/users/settings" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('merge-settings'));
      const result = JSON.parse(screen.getByTestId('data-/users/settings').textContent!);
      expect(result).toEqual({ theme: 'light', lang: 'en' });
    });
  });

  describe('replaceData', () => {
    it('replaces data entirely at an xpath', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <ReplaceDataButton xpath="/users/profile" value={{ name: 'Dana' }} label="profile" />
          <DataAtPath xpath="/users/profile" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('replace-profile'));
      const result = JSON.parse(screen.getByTestId('data-/users/profile').textContent!);
      expect(result).toEqual({ name: 'Dana' });
    });

    it('replaces complex nested structure', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <ReplaceDataButton xpath="/users" value={{ admin: { role: 'superuser' } }} label="users" />
          <DataAtPath xpath="/users" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('replace-users'));
      const result = JSON.parse(screen.getByTestId('data-/users').textContent!);
      expect(result).toEqual({ admin: { role: 'superuser' } });
    });
  });

  describe('appendData', () => {
    it('appends an item to an existing array', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <AppendDataButton xpath="/items" value={{ id: 3, title: 'Third' }} label="item" />
          <DataAtPath xpath="/items" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('append-item'));
      const result = JSON.parse(screen.getByTestId('data-/items').textContent!);
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual({ id: 3, title: 'Third' });
    });

    it('creates an array when appending to a non-existent path', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <AppendDataButton xpath="/tags" value="important" label="tag" />
          <DataAtPath xpath="/tags" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('append-tag'));
      const result = JSON.parse(screen.getByTestId('data-/tags').textContent!);
      expect(result).toEqual(['important']);
    });

    it('appends multiple items sequentially', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <AppendDataButton xpath="/items" value={{ id: 3, title: 'Third' }} label="item3" />
          <AppendDataButton xpath="/items" value={{ id: 4, title: 'Fourth' }} label="item4" />
          <DataAtPath xpath="/items" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('append-item3'));
      await user.click(screen.getByTestId('append-item4'));
      const result = JSON.parse(screen.getByTestId('data-/items').textContent!);
      expect(result).toHaveLength(4);
      expect(result[2]).toEqual({ id: 3, title: 'Third' });
      expect(result[3]).toEqual({ id: 4, title: 'Fourth' });
    });
  });

  describe('deleteData', () => {
    it('removes data at an xpath', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <DeleteDataButton xpath="/config" label="config" />
          <DataDisplay />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('delete-config'));
      const result = JSON.parse(screen.getByTestId('data').textContent!);
      expect(result.config).toBeUndefined();
      expect(result.users).toBeDefined();
      expect(result.items).toBeDefined();
    });

    it('removes a nested property', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <DeleteDataButton xpath="/users/settings" label="settings" />
          <DataAtPath xpath="/users" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('delete-settings'));
      const result = JSON.parse(screen.getByTestId('data-/users').textContent!);
      expect(result.settings).toBeUndefined();
      expect(result.profile).toEqual({ name: 'Alice', age: 30 });
    });

    it('removes a leaf value', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <DeleteDataButton xpath="/users/profile/age" label="age" />
          <DataAtPath xpath="/users/profile" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('delete-age'));
      const result = JSON.parse(screen.getByTestId('data-/users/profile').textContent!);
      expect(result).toEqual({ name: 'Alice' });
    });
  });

  describe('Chained operations', () => {
    it('set then merge then delete in sequence', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <SetDataButton xpath="/workspace" value={{ name: 'Project A' }} label="create" />
          <MergeDataButton xpath="/workspace" value={{ status: 'active' }} label="activate" />
          <DeleteDataButton xpath="/workspace" label="remove" />
          <DataDisplay />
        </div>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('set-create'));
      let data = JSON.parse(screen.getByTestId('data').textContent!);
      expect(data.workspace).toEqual({ name: 'Project A' });

      await user.click(screen.getByTestId('merge-activate'));
      data = JSON.parse(screen.getByTestId('data').textContent!);
      expect(data.workspace).toEqual({ name: 'Project A', status: 'active' });

      await user.click(screen.getByTestId('delete-remove'));
      data = JSON.parse(screen.getByTestId('data').textContent!);
      expect(data.workspace).toBeUndefined();
    });

    it('append then replace then delete on array path', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <AppendDataButton xpath="/logs" value="entry-1" label="log1" />
          <AppendDataButton xpath="/logs" value="entry-2" label="log2" />
          <ReplaceDataButton xpath="/logs" value={['replaced']} label="replace-logs" />
          <DeleteDataButton xpath="/logs" label="clear-logs" />
          <DataDisplay />
        </div>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('append-log1'));
      await user.click(screen.getByTestId('append-log2'));
      let data = JSON.parse(screen.getByTestId('data').textContent!);
      expect(data.logs).toEqual(['entry-1', 'entry-2']);

      await user.click(screen.getByTestId('replace-replace-logs'));
      data = JSON.parse(screen.getByTestId('data').textContent!);
      expect(data.logs).toEqual(['replaced']);

      await user.click(screen.getByTestId('delete-clear-logs'));
      data = JSON.parse(screen.getByTestId('data').textContent!);
      expect(data.logs).toBeUndefined();
    });
  });

  describe('Operations on nested paths', () => {
    it('sets data on a deeply nested path that does not yet exist', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <SetDataButton xpath="/a/b/c" value="deep" label="deep" />
          <DataDisplay />
        </div>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('set-deep'));
      const data = JSON.parse(screen.getByTestId('data').textContent!);
      expect(data.a.b.c).toBe('deep');
    });

    it('merges into a nested object without affecting siblings', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <MergeDataButton xpath="/users/profile" value={{ nickname: 'Ali' }} label="nickname" />
          <DataAtPath xpath="/users/profile" />
          <DataAtPath xpath="/users/settings" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('merge-nickname'));
      const profile = JSON.parse(screen.getByTestId('data-/users/profile').textContent!);
      expect(profile).toEqual({ name: 'Alice', age: 30, nickname: 'Ali' });

      const settings = JSON.parse(screen.getByTestId('data-/users/settings').textContent!);
      expect(settings).toEqual({ theme: 'dark', lang: 'en' });
    });

    it('deletes a nested path without affecting parent siblings', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <DeleteDataButton xpath="/users/profile/name" label="name" />
          <DataAtPath xpath="/users/profile" />
          <DataAtPath xpath="/users/settings" />
          <DataAtPath xpath="/config" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('delete-name'));
      const profile = JSON.parse(screen.getByTestId('data-/users/profile').textContent!);
      expect(profile).toEqual({ age: 30 });

      const settings = JSON.parse(screen.getByTestId('data-/users/settings').textContent!);
      expect(settings).toEqual({ theme: 'dark', lang: 'en' });

      const config = JSON.parse(screen.getByTestId('data-/config').textContent!);
      expect(config).toEqual({ version: '1.0' });
    });
  });

  describe('Data reactivity', () => {
    it('components re-render when data at their xpath changes', async () => {
      const user = userEvent.setup();
      const renderCount = vi.fn();

      function TrackedDataDisplay({ xpath }: { xpath: string }) {
        const data = useDataAtXPath(xpath);
        renderCount(xpath);
        return <span data-testid={`tracked-${xpath}`}>{JSON.stringify(data)}</span>;
      }

      renderWithDataRouter(
        <div>
          <SetDataButton xpath="/users/profile/name" value="Updated" label="update" />
          <TrackedDataDisplay xpath="/users/profile" />
        </div>,
        { initialData: sampleData },
      );

      renderCount.mockClear();
      await user.click(screen.getByTestId('set-update'));

      const result = JSON.parse(screen.getByTestId('tracked-/users/profile').textContent!);
      expect(result.name).toBe('Updated');
    });

    it('useTargetData reflects CRUD changes at current xpath', async () => {
      const user = userEvent.setup();

      function TargetDisplay() {
        const data = useTargetData();
        return <span data-testid="target">{JSON.stringify(data)}</span>;
      }

      renderWithDataRouter(
        <div>
          <NavigateButton to="/users/profile" label="profile" />
          <MergeDataButton xpath="/users/profile" value={{ title: 'Dr.' }} label="title" />
          <TargetDisplay />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('nav-profile'));
      let target = JSON.parse(screen.getByTestId('target').textContent!);
      expect(target).toEqual({ name: 'Alice', age: 30 });

      await user.click(screen.getByTestId('merge-title'));
      target = JSON.parse(screen.getByTestId('target').textContent!);
      expect(target).toEqual({ name: 'Alice', age: 30, title: 'Dr.' });
    });

    it('multiple data displays update independently', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <SetDataButton xpath="/config/version" value="3.0" label="version" />
          <DataAtPath xpath="/config" />
          <DataAtPath xpath="/users/profile" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('set-version'));

      const config = JSON.parse(screen.getByTestId('data-/config').textContent!);
      expect(config.version).toBe('3.0');

      const profile = JSON.parse(screen.getByTestId('data-/users/profile').textContent!);
      expect(profile).toEqual({ name: 'Alice', age: 30 });
    });
  });
});
