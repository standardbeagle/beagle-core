import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useData,
  useTargetData,
  useDataAtXPath,
  useNavigate,
  useXPath,
} from '@standardbeagle/data-router';
import { renderWithDataRouter } from '../test-utils';

function FullDataDisplay() {
  const data = useData();
  return <span data-testid="full-data">{JSON.stringify(data)}</span>;
}

function TargetDataDisplay() {
  const targetData = useTargetData();
  return <span data-testid="target-data">{JSON.stringify(targetData)}</span>;
}

function DataAtXPathDisplay({ xpath }: { xpath: string }) {
  const data = useDataAtXPath(xpath);
  return <span data-testid={`data-at-${xpath}`}>{JSON.stringify(data)}</span>;
}

function NavigateButton({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button data-testid={`nav-${label}`} onClick={() => navigate(to)}>
      {label}
    </button>
  );
}

function XPathDisplay() {
  const xpath = useXPath();
  return <span data-testid="xpath">{xpath}</span>;
}

const sampleData = {
  users: {
    profile: {
      name: 'Alice',
      age: 30,
    },
    settings: {
      theme: 'dark',
    },
  },
  items: [
    { id: 1, title: 'First' },
    { id: 2, title: 'Second' },
    { id: 3, title: 'Third' },
  ],
  config: {
    version: '1.0',
  },
};

describe('Data Router: Data Access', () => {
  describe('useData hook', () => {
    it('returns full data tree', () => {
      renderWithDataRouter(<FullDataDisplay />, { initialData: sampleData });
      const displayed = JSON.parse(screen.getByTestId('full-data').textContent!);
      expect(displayed).toEqual(sampleData);
    });

    it('returns empty object when no initial data', () => {
      renderWithDataRouter(<FullDataDisplay />);
      expect(screen.getByTestId('full-data')).toHaveTextContent('{}');
    });

    it('returns full data tree regardless of current xpath', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/users" label="users" />
          <FullDataDisplay />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('nav-users'));
      const displayed = JSON.parse(screen.getByTestId('full-data').textContent!);
      expect(displayed).toEqual(sampleData);
    });
  });

  describe('useTargetData hook', () => {
    it('returns full data at root xpath', () => {
      renderWithDataRouter(<TargetDataDisplay />, { initialData: sampleData });
      const displayed = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(displayed).toEqual(sampleData);
    });

    it('returns data at current xpath after navigation', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/users" label="users" />
          <TargetDataDisplay />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('nav-users'));
      const displayed = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(displayed).toEqual(sampleData.users);
    });

    it('updates when navigating to different xpath', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/users" label="users" />
          <NavigateButton to="/config" label="config" />
          <TargetDataDisplay />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('nav-users'));
      let displayed = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(displayed).toEqual(sampleData.users);

      await user.click(screen.getByTestId('nav-config'));
      displayed = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(displayed).toEqual(sampleData.config);
    });

    it('returns undefined for non-existent xpath', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/nonexistent" label="missing" />
          <TargetDataDisplay />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('nav-missing'));
      expect(screen.getByTestId('target-data')).toHaveTextContent('');
    });
  });

  describe('useDataAtXPath hook', () => {
    it('returns data at arbitrary xpath', () => {
      renderWithDataRouter(
        <DataAtXPathDisplay xpath="/users/profile" />,
        { initialData: sampleData },
      );
      const displayed = JSON.parse(
        screen.getByTestId('data-at-/users/profile').textContent!,
      );
      expect(displayed).toEqual({ name: 'Alice', age: 30 });
    });

    it('returns full data for root xpath', () => {
      renderWithDataRouter(
        <DataAtXPathDisplay xpath="/" />,
        { initialData: sampleData },
      );
      const displayed = JSON.parse(screen.getByTestId('data-at-/').textContent!);
      expect(displayed).toEqual(sampleData);
    });

    it('returns undefined for non-existent xpath', () => {
      renderWithDataRouter(
        <DataAtXPathDisplay xpath="/does/not/exist" />,
        { initialData: sampleData },
      );
      expect(screen.getByTestId('data-at-/does/not/exist')).toHaveTextContent('');
    });
  });

  describe('Nested object navigation', () => {
    it('accesses deeply nested data via xpath /users/profile/name', () => {
      renderWithDataRouter(
        <DataAtXPathDisplay xpath="/users/profile/name" />,
        { initialData: sampleData },
      );
      expect(screen.getByTestId('data-at-/users/profile/name')).toHaveTextContent(
        '"Alice"',
      );
    });

    it('navigates to nested xpath and useTargetData reflects it', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/users/profile" label="profile" />
          <TargetDataDisplay />
          <XPathDisplay />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('nav-profile'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/users/profile');

      const displayed = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(displayed).toEqual({ name: 'Alice', age: 30 });
    });

    it('navigates deeper into nested structure', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/users" label="users" />
          <NavigateButton to="/users/profile" label="profile" />
          <NavigateButton to="/users/profile/name" label="name" />
          <TargetDataDisplay />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('nav-users'));
      let displayed = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(displayed).toEqual(sampleData.users);

      await user.click(screen.getByTestId('nav-profile'));
      displayed = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(displayed).toEqual({ name: 'Alice', age: 30 });

      await user.click(screen.getByTestId('nav-name'));
      expect(screen.getByTestId('target-data')).toHaveTextContent('"Alice"');
    });

    it('accesses sibling paths via useDataAtXPath', () => {
      renderWithDataRouter(
        <div>
          <DataAtXPathDisplay xpath="/users/profile" />
          <DataAtXPathDisplay xpath="/users/settings" />
        </div>,
        { initialData: sampleData },
      );

      const profile = JSON.parse(
        screen.getByTestId('data-at-/users/profile').textContent!,
      );
      expect(profile).toEqual({ name: 'Alice', age: 30 });

      const settings = JSON.parse(
        screen.getByTestId('data-at-/users/settings').textContent!,
      );
      expect(settings).toEqual({ theme: 'dark' });
    });
  });

  describe('Array index navigation', () => {
    it('accesses first array element via /items[0]', () => {
      renderWithDataRouter(
        <DataAtXPathDisplay xpath="/items[0]" />,
        { initialData: sampleData },
      );
      const displayed = JSON.parse(
        screen.getByTestId('data-at-/items[0]').textContent!,
      );
      expect(displayed).toEqual({ id: 1, title: 'First' });
    });

    it('accesses second array element via /items[1]', () => {
      renderWithDataRouter(
        <DataAtXPathDisplay xpath="/items[1]" />,
        { initialData: sampleData },
      );
      const displayed = JSON.parse(
        screen.getByTestId('data-at-/items[1]').textContent!,
      );
      expect(displayed).toEqual({ id: 2, title: 'Second' });
    });

    it('accesses property of array element via /items[0]/title', () => {
      renderWithDataRouter(
        <DataAtXPathDisplay xpath="/items[0]/title" />,
        { initialData: sampleData },
      );
      expect(screen.getByTestId('data-at-/items[0]/title')).toHaveTextContent(
        '"First"',
      );
    });

    it('returns undefined for out-of-bounds array index', () => {
      renderWithDataRouter(
        <DataAtXPathDisplay xpath="/items[99]" />,
        { initialData: sampleData },
      );
      expect(screen.getByTestId('data-at-/items[99]')).toHaveTextContent('');
    });

    it('navigates to array element and useTargetData reflects it', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/items[1]" label="item1" />
          <TargetDataDisplay />
          <XPathDisplay />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('nav-item1'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/items[1]');

      const displayed = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(displayed).toEqual({ id: 2, title: 'Second' });
    });

    it('navigates between array elements', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/items[0]" label="item0" />
          <NavigateButton to="/items[2]" label="item2" />
          <TargetDataDisplay />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('nav-item0'));
      let displayed = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(displayed).toEqual({ id: 1, title: 'First' });

      await user.click(screen.getByTestId('nav-item2'));
      displayed = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(displayed).toEqual({ id: 3, title: 'Third' });
    });

    it('accesses multiple array elements simultaneously via useDataAtXPath', () => {
      renderWithDataRouter(
        <div>
          <DataAtXPathDisplay xpath="/items[0]" />
          <DataAtXPathDisplay xpath="/items[1]" />
          <DataAtXPathDisplay xpath="/items[2]" />
        </div>,
        { initialData: sampleData },
      );

      expect(
        JSON.parse(screen.getByTestId('data-at-/items[0]').textContent!),
      ).toEqual({ id: 1, title: 'First' });
      expect(
        JSON.parse(screen.getByTestId('data-at-/items[1]').textContent!),
      ).toEqual({ id: 2, title: 'Second' });
      expect(
        JSON.parse(screen.getByTestId('data-at-/items[2]').textContent!),
      ).toEqual({ id: 3, title: 'Third' });
    });
  });

  describe('Data updates when navigating', () => {
    it('target data changes when navigating between paths', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/users" label="users" />
          <NavigateButton to="/config" label="config" />
          <NavigateButton to="/" label="root" />
          <TargetDataDisplay />
        </div>,
        { initialData: sampleData },
      );

      const rootData = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(rootData).toEqual(sampleData);

      await user.click(screen.getByTestId('nav-users'));
      const usersData = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(usersData).toEqual(sampleData.users);

      await user.click(screen.getByTestId('nav-config'));
      const configData = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(configData).toEqual(sampleData.config);

      await user.click(screen.getByTestId('nav-root'));
      const backToRoot = JSON.parse(screen.getByTestId('target-data').textContent!);
      expect(backToRoot).toEqual(sampleData);
    });

    it('useDataAtXPath remains stable regardless of navigation', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/config" label="config" />
          <DataAtXPathDisplay xpath="/users/profile/name" />
        </div>,
        { initialData: sampleData },
      );

      expect(screen.getByTestId('data-at-/users/profile/name')).toHaveTextContent(
        '"Alice"',
      );

      await user.click(screen.getByTestId('nav-config'));

      expect(screen.getByTestId('data-at-/users/profile/name')).toHaveTextContent(
        '"Alice"',
      );
    });
  });
});
