import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import {
  Routes,
  Route,
  usePath,
  useNavigate,
  useNavigation,
  useHistory,
} from '@standardbeagle/virtual-router';
import {
  useXPath,
  useNavigate as useDataNavigate,
  useNavigation as useDataNavigation,
  useHistory as useDataHistory,
  useTargetData,
  useDataManipulation,
} from '@standardbeagle/data-router';
import { renderWithBothRouters } from '../test-utils';

function VirtualPathDisplay() {
  const path = usePath();
  return <span data-testid="vr-path">{path}</span>;
}

function DataXPathDisplay() {
  const xpath = useXPath();
  return <span data-testid="dr-xpath">{xpath}</span>;
}

function VirtualNavigateButton({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button data-testid={`vr-nav-${label}`} onClick={() => navigate(to)}>
      {label}
    </button>
  );
}

function DataNavigateButton({ to, label }: { to: string; label: string }) {
  const navigate = useDataNavigate();
  return (
    <button data-testid={`dr-nav-${label}`} onClick={() => navigate(to)}>
      {label}
    </button>
  );
}

function VirtualNavigationControls() {
  const nav = useNavigation();
  return (
    <div>
      <span data-testid="vr-nav-path">{nav.path}</span>
      <span data-testid="vr-has-back">{String(nav.hasBack)}</span>
      <span data-testid="vr-has-forward">{String(nav.hasForward)}</span>
      <button data-testid="vr-go-back" onClick={() => nav.back()}>
        VR Back
      </button>
      <button data-testid="vr-go-forward" onClick={() => nav.forward()}>
        VR Forward
      </button>
    </div>
  );
}

function DataNavigationControls() {
  const nav = useDataNavigation();
  return (
    <div>
      <span data-testid="dr-nav-xpath">{nav.xpath}</span>
      <span data-testid="dr-has-back">{String(nav.hasBack)}</span>
      <span data-testid="dr-has-forward">{String(nav.hasForward)}</span>
      <button data-testid="dr-go-back" onClick={() => nav.back()}>
        DR Back
      </button>
      <button data-testid="dr-go-forward" onClick={() => nav.forward()}>
        DR Forward
      </button>
    </div>
  );
}

function VirtualHistoryDisplay() {
  const history = useHistory();
  return <span data-testid="vr-history">{JSON.stringify(history)}</span>;
}

function DataHistoryDisplay() {
  const history = useDataHistory();
  return <span data-testid="dr-history">{JSON.stringify(history)}</span>;
}

function VirtualRenderCounter() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  const _path = usePath();
  return <span data-testid="vr-render-count">{renderCount.current}</span>;
}

function DataRenderCounter() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  const _xpath = useXPath();
  return <span data-testid="dr-render-count">{renderCount.current}</span>;
}

const contactsData = {
  contacts: [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
  ],
  settings: {
    theme: 'light',
    pageSize: 10,
  },
};

describe('Cross-Router: Independent Operation', () => {
  describe('Both providers coexisting', () => {
    it('renders both PathProvider and DataProvider in the same tree', () => {
      renderWithBothRouters(
        <div>
          <VirtualPathDisplay />
          <DataXPathDisplay />
        </div>,
        { initialPath: '/home', initialData: contactsData },
      );

      expect(screen.getByTestId('vr-path')).toHaveTextContent('/home');
      expect(screen.getByTestId('dr-xpath')).toHaveTextContent('/');
    });

    it('provides independent initial states', () => {
      renderWithBothRouters(
        <div>
          <VirtualPathDisplay />
          <DataXPathDisplay />
          <VirtualHistoryDisplay />
          <DataHistoryDisplay />
        </div>,
        { initialPath: '/start', initialData: { key: 'value' } },
      );

      expect(screen.getByTestId('vr-path')).toHaveTextContent('/start');
      expect(screen.getByTestId('dr-xpath')).toHaveTextContent('/');
      expect(screen.getByTestId('vr-history')).toHaveTextContent('[]');
      expect(screen.getByTestId('dr-history')).toHaveTextContent('[]');
    });
  });

  describe('Virtual-router navigation does not affect data-router', () => {
    it('keeps data-router xpath stable when virtual-router navigates', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(
        <div>
          <VirtualNavigateButton to="/about" label="about" />
          <VirtualNavigateButton to="/settings" label="settings" />
          <VirtualPathDisplay />
          <DataXPathDisplay />
        </div>,
        { initialData: contactsData },
      );

      expect(screen.getByTestId('dr-xpath')).toHaveTextContent('/');

      await user.click(screen.getByTestId('vr-nav-about'));
      expect(screen.getByTestId('vr-path')).toHaveTextContent('/about');
      expect(screen.getByTestId('dr-xpath')).toHaveTextContent('/');

      await user.click(screen.getByTestId('vr-nav-settings'));
      expect(screen.getByTestId('vr-path')).toHaveTextContent('/settings');
      expect(screen.getByTestId('dr-xpath')).toHaveTextContent('/');
    });

    it('keeps data-router history unchanged during virtual-router navigation', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(
        <div>
          <VirtualNavigateButton to="/page1" label="page1" />
          <VirtualNavigateButton to="/page2" label="page2" />
          <DataHistoryDisplay />
        </div>,
        { initialData: contactsData },
      );

      const historyBefore = screen.getByTestId('dr-history').textContent;

      await user.click(screen.getByTestId('vr-nav-page1'));
      expect(screen.getByTestId('dr-history')).toHaveTextContent(historyBefore!);

      await user.click(screen.getByTestId('vr-nav-page2'));
      expect(screen.getByTestId('dr-history')).toHaveTextContent(historyBefore!);
    });

    it('keeps data-router target data unchanged during virtual-router navigation', async () => {
      const user = userEvent.setup();

      function TargetDataDisplay() {
        const data = useTargetData();
        return <span data-testid="dr-target">{JSON.stringify(data)}</span>;
      }

      renderWithBothRouters(
        <div>
          <VirtualNavigateButton to="/contacts" label="contacts" />
          <TargetDataDisplay />
        </div>,
        { initialData: contactsData },
      );

      const dataBefore = screen.getByTestId('dr-target').textContent;

      await user.click(screen.getByTestId('vr-nav-contacts'));

      expect(screen.getByTestId('dr-target')).toHaveTextContent(dataBefore!);
    });

    it('keeps data-router navigation state stable during virtual-router back/forward', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(
        <div>
          <VirtualNavigateButton to="/a" label="a" />
          <VirtualNavigateButton to="/b" label="b" />
          <VirtualNavigationControls />
          <DataNavigationControls />
        </div>,
        { initialData: contactsData },
      );

      await user.click(screen.getByTestId('vr-nav-a'));
      await user.click(screen.getByTestId('vr-nav-b'));

      expect(screen.getByTestId('dr-nav-xpath')).toHaveTextContent('/');
      expect(screen.getByTestId('dr-has-back')).toHaveTextContent('false');
      expect(screen.getByTestId('dr-has-forward')).toHaveTextContent('false');

      await user.click(screen.getByTestId('vr-go-back'));
      expect(screen.getByTestId('vr-nav-path')).toHaveTextContent('/a');
      expect(screen.getByTestId('dr-nav-xpath')).toHaveTextContent('/');
      expect(screen.getByTestId('dr-has-back')).toHaveTextContent('false');
    });
  });

  describe('Data-router navigation does not affect virtual-router', () => {
    it('keeps virtual-router path stable when data-router navigates', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(
        <div>
          <DataNavigateButton to="/contacts" label="contacts" />
          <DataNavigateButton to="/settings" label="settings" />
          <VirtualPathDisplay />
          <DataXPathDisplay />
        </div>,
        { initialPath: '/home', initialData: contactsData },
      );

      expect(screen.getByTestId('vr-path')).toHaveTextContent('/home');

      await user.click(screen.getByTestId('dr-nav-contacts'));
      expect(screen.getByTestId('dr-xpath')).toHaveTextContent('/contacts');
      expect(screen.getByTestId('vr-path')).toHaveTextContent('/home');

      await user.click(screen.getByTestId('dr-nav-settings'));
      expect(screen.getByTestId('dr-xpath')).toHaveTextContent('/settings');
      expect(screen.getByTestId('vr-path')).toHaveTextContent('/home');
    });

    it('keeps virtual-router history unchanged during data-router navigation', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(
        <div>
          <DataNavigateButton to="/contacts" label="contacts" />
          <DataNavigateButton to="/contacts[0]" label="first" />
          <VirtualHistoryDisplay />
        </div>,
        { initialPath: '/home', initialData: contactsData },
      );

      const historyBefore = screen.getByTestId('vr-history').textContent;

      await user.click(screen.getByTestId('dr-nav-contacts'));
      expect(screen.getByTestId('vr-history')).toHaveTextContent(historyBefore!);

      await user.click(screen.getByTestId('dr-nav-first'));
      expect(screen.getByTestId('vr-history')).toHaveTextContent(historyBefore!);
    });

    it('keeps virtual-router routes rendering correctly during data-router navigation', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(
        <div>
          <DataNavigateButton to="/contacts" label="contacts" />
          <Routes>
            <Route path="home">
              <span data-testid="page">Home Page</span>
            </Route>
          </Routes>
          <DataXPathDisplay />
        </div>,
        { initialPath: '/home', initialData: contactsData },
      );

      expect(screen.getByTestId('page')).toHaveTextContent('Home Page');

      await user.click(screen.getByTestId('dr-nav-contacts'));
      expect(screen.getByTestId('dr-xpath')).toHaveTextContent('/contacts');
      expect(screen.getByTestId('page')).toHaveTextContent('Home Page');
    });

    it('keeps virtual-router navigation state stable during data-router back/forward', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(
        <div>
          <DataNavigateButton to="/contacts" label="contacts" />
          <DataNavigateButton to="/settings" label="settings" />
          <VirtualNavigationControls />
          <DataNavigationControls />
        </div>,
        { initialPath: '/home', initialData: contactsData },
      );

      await user.click(screen.getByTestId('dr-nav-contacts'));
      await user.click(screen.getByTestId('dr-nav-settings'));

      expect(screen.getByTestId('vr-nav-path')).toHaveTextContent('/home');
      expect(screen.getByTestId('vr-has-back')).toHaveTextContent('false');
      expect(screen.getByTestId('vr-has-forward')).toHaveTextContent('false');

      await user.click(screen.getByTestId('dr-go-back'));
      expect(screen.getByTestId('dr-nav-xpath')).toHaveTextContent('/contacts');
      expect(screen.getByTestId('vr-nav-path')).toHaveTextContent('/home');
      expect(screen.getByTestId('vr-has-back')).toHaveTextContent('false');
    });
  });

  describe('Both routers handle their own history independently', () => {
    it('maintains separate history stacks', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(
        <div>
          <VirtualNavigateButton to="/page-a" label="page-a" />
          <VirtualNavigateButton to="/page-b" label="page-b" />
          <DataNavigateButton to="/contacts" label="contacts" />
          <DataNavigateButton to="/settings" label="settings" />
          <VirtualNavigationControls />
          <DataNavigationControls />
        </div>,
        { initialData: contactsData },
      );

      await user.click(screen.getByTestId('vr-nav-page-a'));
      await user.click(screen.getByTestId('dr-nav-contacts'));
      await user.click(screen.getByTestId('vr-nav-page-b'));
      await user.click(screen.getByTestId('dr-nav-settings'));

      expect(screen.getByTestId('vr-nav-path')).toHaveTextContent('/page-b');
      expect(screen.getByTestId('dr-nav-xpath')).toHaveTextContent('/settings');

      await user.click(screen.getByTestId('vr-go-back'));
      expect(screen.getByTestId('vr-nav-path')).toHaveTextContent('/page-a');
      expect(screen.getByTestId('dr-nav-xpath')).toHaveTextContent('/settings');

      await user.click(screen.getByTestId('dr-go-back'));
      expect(screen.getByTestId('vr-nav-path')).toHaveTextContent('/page-a');
      expect(screen.getByTestId('dr-nav-xpath')).toHaveTextContent('/contacts');
    });

    it('forward navigation in one router does not affect the other', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(
        <div>
          <VirtualNavigateButton to="/x" label="x" />
          <VirtualNavigateButton to="/y" label="y" />
          <VirtualNavigateButton to="/z" label="z" />
          <DataNavigateButton to="/alpha" label="alpha" />
          <DataNavigateButton to="/beta" label="beta" />
          <DataNavigateButton to="/gamma" label="gamma" />
          <VirtualNavigationControls />
          <DataNavigationControls />
        </div>,
        { initialData: contactsData },
      );

      await user.click(screen.getByTestId('vr-nav-x'));
      await user.click(screen.getByTestId('vr-nav-y'));
      await user.click(screen.getByTestId('vr-nav-z'));
      await user.click(screen.getByTestId('dr-nav-alpha'));
      await user.click(screen.getByTestId('dr-nav-beta'));
      await user.click(screen.getByTestId('dr-nav-gamma'));

      // Go back 2 steps in each so forward goes to a non-zero location
      await user.click(screen.getByTestId('vr-go-back'));
      await user.click(screen.getByTestId('vr-go-back'));
      await user.click(screen.getByTestId('dr-go-back'));
      await user.click(screen.getByTestId('dr-go-back'));

      expect(screen.getByTestId('vr-nav-path')).toHaveTextContent('/x');
      expect(screen.getByTestId('dr-nav-xpath')).toHaveTextContent('/alpha');
      expect(screen.getByTestId('vr-has-forward')).toHaveTextContent('true');
      expect(screen.getByTestId('dr-has-forward')).toHaveTextContent('true');

      // Forward in VR only - should not affect DR
      await user.click(screen.getByTestId('vr-go-forward'));
      expect(screen.getByTestId('vr-nav-path')).toHaveTextContent('/y');
      expect(screen.getByTestId('dr-nav-xpath')).toHaveTextContent('/alpha');
    });

    it('navigating from back position in one router does not trim the other history', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(
        <div>
          <VirtualNavigateButton to="/p1" label="p1" />
          <VirtualNavigateButton to="/p2" label="p2" />
          <VirtualNavigateButton to="/p3" label="p3" />
          <DataNavigateButton to="/d1" label="d1" />
          <DataNavigateButton to="/d2" label="d2" />
          <VirtualNavigationControls />
          <DataNavigationControls />
        </div>,
        { initialData: contactsData },
      );

      await user.click(screen.getByTestId('vr-nav-p1'));
      await user.click(screen.getByTestId('vr-nav-p2'));
      await user.click(screen.getByTestId('dr-nav-d1'));
      await user.click(screen.getByTestId('dr-nav-d2'));

      await user.click(screen.getByTestId('vr-go-back'));
      await user.click(screen.getByTestId('vr-nav-p3'));

      expect(screen.getByTestId('vr-nav-path')).toHaveTextContent('/p3');
      expect(screen.getByTestId('vr-has-forward')).toHaveTextContent('false');

      expect(screen.getByTestId('dr-nav-xpath')).toHaveTextContent('/d2');
      expect(screen.getByTestId('dr-has-back')).toHaveTextContent('true');
    });
  });

  describe('Re-render isolation', () => {
    it('data-router navigation does not re-render virtual-router consumers', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(
        <div>
          <DataNavigateButton to="/contacts" label="contacts" />
          <DataNavigateButton to="/settings" label="settings" />
          <VirtualRenderCounter />
          <DataRenderCounter />
        </div>,
        { initialData: contactsData },
      );

      const vrCountBefore = Number(screen.getByTestId('vr-render-count').textContent);

      await user.click(screen.getByTestId('dr-nav-contacts'));
      await user.click(screen.getByTestId('dr-nav-settings'));

      const vrCountAfter = Number(screen.getByTestId('vr-render-count').textContent);
      expect(vrCountAfter).toBe(vrCountBefore);
    });

    it('virtual-router navigation does not re-render data-router consumers', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(
        <div>
          <VirtualNavigateButton to="/about" label="about" />
          <VirtualNavigateButton to="/contact" label="contact" />
          <VirtualRenderCounter />
          <DataRenderCounter />
        </div>,
        { initialData: contactsData },
      );

      const drCountBefore = Number(screen.getByTestId('dr-render-count').textContent);

      await user.click(screen.getByTestId('vr-nav-about'));
      await user.click(screen.getByTestId('vr-nav-contact'));

      const drCountAfter = Number(screen.getByTestId('dr-render-count').textContent);
      expect(drCountAfter).toBe(drCountBefore);
    });

    it('both routers maintain state during the other operations', async () => {
      const user = userEvent.setup();

      function DataDisplay() {
        const data = useTargetData();
        return <span data-testid="dr-data">{JSON.stringify(data)}</span>;
      }

      renderWithBothRouters(
        <div>
          <VirtualNavigateButton to="/page-a" label="page-a" />
          <VirtualNavigateButton to="/page-b" label="page-b" />
          <DataNavigateButton to="/contacts" label="contacts" />
          <VirtualPathDisplay />
          <DataDisplay />
          <Routes>
            <Route path="/">
              <span data-testid="vr-page">Home</span>
            </Route>
            <Route path="page-a">
              <span data-testid="vr-page">Page A</span>
            </Route>
            <Route path="page-b">
              <span data-testid="vr-page">Page B</span>
            </Route>
          </Routes>
        </div>,
        { initialData: contactsData },
      );

      expect(screen.getByTestId('vr-page')).toHaveTextContent('Home');

      await user.click(screen.getByTestId('vr-nav-page-a'));
      expect(screen.getByTestId('vr-page')).toHaveTextContent('Page A');

      await user.click(screen.getByTestId('dr-nav-contacts'));
      const drData = JSON.parse(screen.getByTestId('dr-data').textContent!);
      expect(drData).toEqual(contactsData.contacts);
      expect(screen.getByTestId('vr-page')).toHaveTextContent('Page A');

      await user.click(screen.getByTestId('vr-nav-page-b'));
      expect(screen.getByTestId('vr-page')).toHaveTextContent('Page B');
      const drDataAfter = JSON.parse(screen.getByTestId('dr-data').textContent!);
      expect(drDataAfter).toEqual(contactsData.contacts);
    });
  });

  describe('Data manipulation isolation', () => {
    it('data-router data changes do not affect virtual-router state', async () => {
      const user = userEvent.setup();

      function DataModifier() {
        const { mergeData } = useDataManipulation();
        return (
          <button
            data-testid="dr-modify"
            onClick={() => mergeData('/settings', { theme: 'dark' })}
          >
            Change Theme
          </button>
        );
      }

      renderWithBothRouters(
        <div>
          <DataModifier />
          <VirtualPathDisplay />
          <VirtualNavigationControls />
        </div>,
        { initialPath: '/dashboard', initialData: contactsData },
      );

      expect(screen.getByTestId('vr-path')).toHaveTextContent('/dashboard');

      await user.click(screen.getByTestId('dr-modify'));

      expect(screen.getByTestId('vr-path')).toHaveTextContent('/dashboard');
      expect(screen.getByTestId('vr-has-back')).toHaveTextContent('false');
    });
  });
});
