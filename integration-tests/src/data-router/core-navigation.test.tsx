import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DataProvider,
  useXPath,
  useNavigate,
  useNavigation,
  useHistory,
  Link,
} from '@standardbeagle/data-router';
import { renderWithDataRouter } from '../test-utils';

function XPathDisplay() {
  const xpath = useXPath();
  return <span data-testid="xpath">{xpath}</span>;
}

function NavigateButton({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button data-testid={`nav-${label}`} onClick={() => navigate(to)}>
      {label}
    </button>
  );
}

function NavigationControls() {
  const nav = useNavigation();
  return (
    <div>
      <span data-testid="nav-xpath">{nav.xpath}</span>
      <span data-testid="has-back">{String(nav.hasBack)}</span>
      <span data-testid="has-forward">{String(nav.hasForward)}</span>
      <span data-testid="nav-location">{nav.location}</span>
      <button data-testid="go-back" onClick={() => nav.back()}>
        Back
      </button>
      <button data-testid="go-forward" onClick={() => nav.forward()}>
        Forward
      </button>
    </div>
  );
}

function HistoryDisplay() {
  const history = useHistory();
  return <span data-testid="history">{JSON.stringify(history)}</span>;
}

describe('Data Router: Core XPath Navigation', () => {
  describe('DataProvider', () => {
    it('renders children with initial data', () => {
      renderWithDataRouter(
        <span data-testid="child">Hello</span>,
        { initialData: { greeting: 'world' } },
      );
      expect(screen.getByTestId('child')).toHaveTextContent('Hello');
    });

    it('provides data context to nested components', () => {
      renderWithDataRouter(<XPathDisplay />, { initialData: { key: 'value' } });
      expect(screen.getByTestId('xpath')).toHaveTextContent('/');
    });

    it('isolates multiple DataProviders with different data', () => {
      render(
        <div>
          <DataProvider initialData={{ source: 'first' }}>
            <XPathDisplay />
            <NavigateButton to="/alpha" label="alpha" />
          </DataProvider>
          <DataProvider initialData={{ source: 'second' }}>
            <div data-testid="second-provider">
              <XPathDisplay />
            </div>
          </DataProvider>
        </div>,
      );

      const xpathElements = screen.getAllByTestId('xpath');
      expect(xpathElements).toHaveLength(2);
      expect(xpathElements[0]).toHaveTextContent('/');
      expect(xpathElements[1]).toHaveTextContent('/');
    });

    it('keeps providers isolated after navigating in one', async () => {
      const user = userEvent.setup();

      function FirstProvider() {
        return (
          <DataProvider initialData={{ source: 'first' }}>
            <NavigateButton to="/moved" label="move" />
            <XPathDisplay />
          </DataProvider>
        );
      }

      function SecondProvider() {
        return (
          <DataProvider initialData={{ source: 'second' }}>
            <span data-testid="second-xpath">
              <XPathDisplay />
            </span>
          </DataProvider>
        );
      }

      render(
        <div>
          <FirstProvider />
          <SecondProvider />
        </div>,
      );

      await user.click(screen.getByTestId('nav-move'));

      const xpathElements = screen.getAllByTestId('xpath');
      expect(xpathElements[0]).toHaveTextContent('/moved');
      expect(xpathElements[1]).toHaveTextContent('/');
    });
  });

  describe('useXPath hook', () => {
    it('returns current xpath location', () => {
      renderWithDataRouter(<XPathDisplay />);
      expect(screen.getByTestId('xpath')).toHaveTextContent('/');
    });

    it('updates after navigation', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/users" label="users" />
          <XPathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-users'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/users');
    });
  });

  describe('useNavigate hook', () => {
    it('navigates to different xpath', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/items" label="items" />
          <XPathDisplay />
        </div>,
      );

      expect(screen.getByTestId('xpath')).toHaveTextContent('/');
      await user.click(screen.getByTestId('nav-items'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/items');
    });

    it('navigates through multiple xpaths sequentially', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/a" label="a" />
          <NavigateButton to="/b" label="b" />
          <NavigateButton to="/c" label="c" />
          <XPathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-a'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/a');

      await user.click(screen.getByTestId('nav-b'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/b');

      await user.click(screen.getByTestId('nav-c'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/c');
    });

    it('does not change state when navigating to the same xpath', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/same" label="same" />
          <XPathDisplay />
          <HistoryDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-same'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/same');
      const historyAfterFirst = screen.getByTestId('history').textContent;

      await user.click(screen.getByTestId('nav-same'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/same');
      expect(screen.getByTestId('history')).toHaveTextContent(historyAfterFirst!);
    });
  });

  describe('useNavigation hook', () => {
    it('provides hasBack=false and hasForward=false initially', () => {
      renderWithDataRouter(<NavigationControls />);
      expect(screen.getByTestId('has-back')).toHaveTextContent('false');
      expect(screen.getByTestId('has-forward')).toHaveTextContent('false');
    });

    it('provides hasBack=true after navigation', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/page2" label="page2" />
          <NavigationControls />
        </div>,
      );

      await user.click(screen.getByTestId('nav-page2'));
      expect(screen.getByTestId('has-back')).toHaveTextContent('true');
      expect(screen.getByTestId('has-forward')).toHaveTextContent('false');
    });

    it('provides hasForward=true after going back', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/page2" label="page2" />
          <NavigationControls />
        </div>,
      );

      await user.click(screen.getByTestId('nav-page2'));
      await user.click(screen.getByTestId('go-back'));

      expect(screen.getByTestId('nav-xpath')).toHaveTextContent('/');
      expect(screen.getByTestId('has-back')).toHaveTextContent('false');
      expect(screen.getByTestId('has-forward')).toHaveTextContent('true');
    });

    it('navigates back to previous xpath', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/first" label="first" />
          <NavigateButton to="/second" label="second" />
          <NavigationControls />
          <XPathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-first'));
      await user.click(screen.getByTestId('nav-second'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/second');

      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/first');
    });

    it('navigates back through entire history to start', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/a" label="a" />
          <NavigateButton to="/b" label="b" />
          <NavigateButton to="/c" label="c" />
          <NavigationControls />
          <XPathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-a'));
      await user.click(screen.getByTestId('nav-b'));
      await user.click(screen.getByTestId('nav-c'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/c');

      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/b');

      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/a');

      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/');
      expect(screen.getByTestId('has-back')).toHaveTextContent('false');
    });

    it('does not go back beyond the start of history', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/page" label="page" />
          <NavigationControls />
          <XPathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-page'));
      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/');

      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/');
      expect(screen.getByTestId('has-back')).toHaveTextContent('false');
    });

    it('navigates forward after going back multiple steps', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/a" label="a" />
          <NavigateButton to="/b" label="b" />
          <NavigateButton to="/c" label="c" />
          <NavigationControls />
          <XPathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-a'));
      await user.click(screen.getByTestId('nav-b'));
      await user.click(screen.getByTestId('nav-c'));

      await user.click(screen.getByTestId('go-back'));
      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/a');
      expect(screen.getByTestId('has-forward')).toHaveTextContent('true');

      await user.click(screen.getByTestId('go-forward'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/b');
    });

    it('trims future history when navigating from a back position', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/a" label="a" />
          <NavigateButton to="/b" label="b" />
          <NavigateButton to="/new" label="new" />
          <NavigationControls />
          <XPathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-a'));
      await user.click(screen.getByTestId('nav-b'));

      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/a');

      await user.click(screen.getByTestId('nav-new'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/new');
      expect(screen.getByTestId('has-forward')).toHaveTextContent('false');
    });
  });

  describe('useHistory hook', () => {
    it('starts with empty history', () => {
      renderWithDataRouter(<HistoryDisplay />);
      expect(screen.getByTestId('history')).toHaveTextContent('[]');
    });

    it('tracks xpath navigation history', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <NavigateButton to="/first" label="first" />
          <NavigateButton to="/second" label="second" />
          <HistoryDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-first'));
      const afterFirst = JSON.parse(screen.getByTestId('history').textContent!);
      expect(afterFirst).toContain('/');

      await user.click(screen.getByTestId('nav-second'));
      const afterSecond = JSON.parse(screen.getByTestId('history').textContent!);
      expect(afterSecond).toContain('/first');
      expect(afterSecond).toContain('/');
    });
  });

  describe('Link component', () => {
    it('navigates to xpath on click', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Link to="/target" data-testid="link-target">
            Go to target
          </Link>
          <XPathDisplay />
        </div>,
      );

      expect(screen.getByTestId('xpath')).toHaveTextContent('/');

      await user.click(screen.getByTestId('link-target'));

      expect(screen.getByTestId('xpath')).toHaveTextContent('/target');
    });

    it('renders as an anchor element', () => {
      renderWithDataRouter(
        <Link to="/somewhere" data-testid="link">
          Click me
        </Link>,
      );

      const link = screen.getByTestId('link');
      expect(link.tagName).toBe('A');
      expect(link).toHaveTextContent('Click me');
    });

    it('prevents default anchor navigation', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Link to="/target" data-testid="link">
            Navigate
          </Link>
          <XPathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('link'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/target');
    });

    it('navigates through multiple links', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Link to="/page1" data-testid="link-page1">Page 1</Link>
          <Link to="/page2" data-testid="link-page2">Page 2</Link>
          <XPathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('link-page1'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/page1');

      await user.click(screen.getByTestId('link-page2'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/page2');
    });
  });
});
