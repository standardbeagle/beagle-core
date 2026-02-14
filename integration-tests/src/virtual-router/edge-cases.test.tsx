import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import {
  Routes,
  Route,
  PathProvider,
  usePath,
  useNavigate,
  useParams,
} from '@standardbeagle/virtual-router';
import { renderWithVirtualRouter } from '../test-utils';

function PathDisplay() {
  const path = usePath();
  return <span data-testid="path">{path}</span>;
}

function NavigateButton({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button data-testid={`nav-${label}`} onClick={() => navigate(to)}>
      {label}
    </button>
  );
}

function ParamDisplay() {
  const params = useParams();
  return <span data-testid="params">{JSON.stringify(params)}</span>;
}

describe('Virtual Router: Edge Cases', () => {
  describe('Empty path handling', () => {
    it('defaults to root path when empty string is provided', () => {
      render(
        <PathProvider path="">
          <PathDisplay />
        </PathProvider>,
      );
      expect(screen.getByTestId('path')).toHaveTextContent('/');
    });

    it('navigating to empty string stays at current path', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="" label="empty" />
          <PathDisplay />
        </div>,
        { initialPath: '/current' },
      );

      await user.click(screen.getByTestId('nav-empty'));
      expect(screen.getByTestId('path')).toHaveTextContent('/current');
    });
  });

  describe('Trailing slash normalization', () => {
    it('normalizes trailing slash on navigation', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/about/" label="about" />
          <PathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-about'));
      expect(screen.getByTestId('path')).toHaveTextContent('/about');
    });

    it('root path slash is preserved', () => {
      renderWithVirtualRouter(<PathDisplay />);
      expect(screen.getByTestId('path')).toHaveTextContent('/');
    });
  });

  describe('Double-slash in paths', () => {
    it('normalizes double slashes in navigation path', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="//users//list" label="double" />
          <PathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-double'));
      expect(screen.getByTestId('path')).toHaveTextContent('/users/list');
    });
  });

  describe('Rapid sequential navigation', () => {
    it('handles multiple rapid navigations correctly', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/a" label="a" />
          <NavigateButton to="/b" label="b" />
          <NavigateButton to="/c" label="c" />
          <NavigateButton to="/d" label="d" />
          <NavigateButton to="/e" label="e" />
          <PathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-a'));
      await user.click(screen.getByTestId('nav-b'));
      await user.click(screen.getByTestId('nav-c'));
      await user.click(screen.getByTestId('nav-d'));
      await user.click(screen.getByTestId('nav-e'));

      expect(screen.getByTestId('path')).toHaveTextContent('/e');
    });

    it('navigating to the same path repeatedly does not break state', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/same" label="same" />
          <PathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-same'));
      await user.click(screen.getByTestId('nav-same'));
      await user.click(screen.getByTestId('nav-same'));

      expect(screen.getByTestId('path')).toHaveTextContent('/same');
    });
  });

  describe('Multiple PathProviders in same tree', () => {
    it('each PathProvider maintains isolated routing state', async () => {
      const user = userEvent.setup();

      function RouterA() {
        return (
          <PathProvider path="/a-start">
            <NavigateButton to="/a-next" label="nav-a" />
            <PathDisplay />
          </PathProvider>
        );
      }

      function RouterB() {
        return (
          <PathProvider path="/b-start">
            <PathDisplayB />
          </PathProvider>
        );
      }

      function PathDisplayB() {
        const path = usePath();
        return <span data-testid="path-b">{path}</span>;
      }

      render(
        <div>
          <RouterA />
          <RouterB />
        </div>,
      );

      expect(screen.getByTestId('path')).toHaveTextContent('/a-start');
      expect(screen.getByTestId('path-b')).toHaveTextContent('/b-start');

      await user.click(screen.getByTestId('nav-nav-a'));

      expect(screen.getByTestId('path')).toHaveTextContent('/a-next');
      expect(screen.getByTestId('path-b')).toHaveTextContent('/b-start');
    });

    it('nested PathProviders create independent scopes', () => {
      function InnerPath() {
        const path = usePath();
        return <span data-testid="inner-path">{path}</span>;
      }

      render(
        <PathProvider path="/outer">
          <PathDisplay />
          <PathProvider path="/inner">
            <InnerPath />
          </PathProvider>
        </PathProvider>,
      );

      expect(screen.getByTestId('path')).toHaveTextContent('/outer');
      expect(screen.getByTestId('inner-path')).toHaveTextContent('/inner');
    });
  });

  describe('Unmounting during navigation', () => {
    it('handles unmounting a routed component gracefully', async () => {
      const user = userEvent.setup();

      function ConditionalRouter() {
        const [show, setShow] = useState(true);
        return (
          <PathProvider path="/start">
            <button
              data-testid="toggle"
              onClick={() => setShow((s) => !s)}
            >
              Toggle
            </button>
            {show && (
              <div data-testid="routed-content">
                <NavigateButton to="/next" label="go" />
                <PathDisplay />
              </div>
            )}
          </PathProvider>
        );
      }

      render(<ConditionalRouter />);

      expect(screen.getByTestId('routed-content')).toBeInTheDocument();

      await user.click(screen.getByTestId('toggle'));
      expect(screen.queryByTestId('routed-content')).not.toBeInTheDocument();

      await user.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('routed-content')).toBeInTheDocument();
    });

    it('unmounting Routes mid-tree does not break sibling Routes', async () => {
      const user = userEvent.setup();

      function App() {
        const [showFirst, setShowFirst] = useState(true);
        return (
          <PathProvider path="/page">
            <button
              data-testid="toggle"
              onClick={() => setShowFirst((s) => !s)}
            >
              Toggle
            </button>
            {showFirst && (
              <Routes>
                <Route path="page">
                  <span data-testid="first-routes">First</span>
                </Route>
              </Routes>
            )}
            <Routes>
              <Route path="page">
                <span data-testid="second-routes">Second</span>
              </Route>
            </Routes>
          </PathProvider>
        );
      }

      render(<App />);

      expect(screen.getByTestId('first-routes')).toBeInTheDocument();
      expect(screen.getByTestId('second-routes')).toBeInTheDocument();

      await user.click(screen.getByTestId('toggle'));
      expect(screen.queryByTestId('first-routes')).not.toBeInTheDocument();
      expect(screen.getByTestId('second-routes')).toBeInTheDocument();
    });
  });

  describe('Deep nesting of Routes components', () => {
    it('renders deeply nested routes correctly', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="a/*">
            <div data-testid="level-a">
              <Routes>
                <Route path="b/*">
                  <div data-testid="level-b">
                    <Routes>
                      <Route path="c">
                        <span data-testid="level-c">Deep Content</span>
                      </Route>
                    </Routes>
                  </div>
                </Route>
              </Routes>
            </div>
          </Route>
        </Routes>,
        { initialPath: '/a/b/c' },
      );

      expect(screen.getByTestId('level-a')).toBeInTheDocument();
      expect(screen.getByTestId('level-b')).toBeInTheDocument();
      expect(screen.getByTestId('level-c')).toHaveTextContent('Deep Content');
    });

    it('passes params through deeply nested routes', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="org/*">
            <Routes>
              <Route path=":orgId/*">
                <Routes>
                  <Route path="team/:teamId">
                    <ParamDisplay />
                  </Route>
                </Routes>
              </Route>
            </Routes>
          </Route>
        </Routes>,
        { initialPath: '/org/acme/team/alpha' },
      );

      const params = JSON.parse(screen.getByTestId('params').textContent!);
      expect(params.teamId).toBe('alpha');
    });

    it('navigates within deeply nested routes', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/a/b/x" label="x" />
          <NavigateButton to="/a/b/y" label="y" />
          <Routes>
            <Route path="a/*">
              <Routes>
                <Route path="b/*">
                  <Routes>
                    <Route path="x">
                      <span data-testid="page">X Page</span>
                    </Route>
                    <Route path="y">
                      <span data-testid="page">Y Page</span>
                    </Route>
                  </Routes>
                </Route>
              </Routes>
            </Route>
          </Routes>
        </div>,
        { initialPath: '/a/b/x' },
      );

      expect(screen.getByTestId('page')).toHaveTextContent('X Page');

      await user.click(screen.getByTestId('nav-y'));
      expect(screen.getByTestId('page')).toHaveTextContent('Y Page');

      await user.click(screen.getByTestId('nav-x'));
      expect(screen.getByTestId('page')).toHaveTextContent('X Page');
    });
  });

  describe('Route matching edge cases', () => {
    it('matches root route correctly', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="/">
            <span data-testid="root">Root</span>
          </Route>
        </Routes>,
      );
      expect(screen.getByTestId('root')).toHaveTextContent('Root');
    });

    it('does not render when no route matches', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="home">
            <span data-testid="home">Home</span>
          </Route>
        </Routes>,
        { initialPath: '/other' },
      );
      expect(screen.queryByTestId('home')).not.toBeInTheDocument();
    });

    it('handles path with only slashes', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="///" label="slashes" />
          <PathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-slashes'));
      expect(screen.getByTestId('path')).toHaveTextContent('/');
    });
  });
});
