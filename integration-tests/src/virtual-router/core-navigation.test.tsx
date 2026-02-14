import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Routes,
  Route,
  Link,
  usePath,
  useNavigate,
  useNavigation,
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

function NavigationControls() {
  const nav = useNavigation();
  return (
    <div>
      <span data-testid="nav-path">{nav.path}</span>
      <span data-testid="has-back">{String(nav.hasBack)}</span>
      <span data-testid="has-forward">{String(nav.hasForward)}</span>
      <button data-testid="go-back" onClick={() => nav.back()}>
        Back
      </button>
      <button data-testid="go-forward" onClick={() => nav.forward()}>
        Forward
      </button>
    </div>
  );
}

function ParamDisplay() {
  const params = useParams();
  return <span data-testid="params">{JSON.stringify(params)}</span>;
}

describe('Virtual Router: Core Navigation', () => {
  describe('PathProvider', () => {
    it('renders children and provides routing context', () => {
      renderWithVirtualRouter(<PathDisplay />, { initialPath: '/hello' });
      expect(screen.getByTestId('path')).toHaveTextContent('/hello');
    });

    it('defaults to root path', () => {
      renderWithVirtualRouter(<PathDisplay />);
      expect(screen.getByTestId('path')).toHaveTextContent('/');
    });
  });

  describe('Routes and Route', () => {
    it('renders the correct route based on path', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="home">
            <span data-testid="route-content">Home Page</span>
          </Route>
          <Route path="about">
            <span data-testid="route-content">About Page</span>
          </Route>
        </Routes>,
        { initialPath: '/home' },
      );
      expect(screen.getByTestId('route-content')).toHaveTextContent('Home Page');
    });

    it('does not render non-matching routes', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="home">
            <span data-testid="home">Home</span>
          </Route>
          <Route path="about">
            <span data-testid="about">About</span>
          </Route>
        </Routes>,
        { initialPath: '/about' },
      );
      expect(screen.queryByTestId('home')).not.toBeInTheDocument();
      expect(screen.getByTestId('about')).toHaveTextContent('About');
    });

    it('renders route with dynamic parameters', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="users/:id">
            <ParamDisplay />
          </Route>
        </Routes>,
        { initialPath: '/users/42' },
      );
      expect(screen.getByTestId('params')).toHaveTextContent('{"id":"42"}');
    });
  });

  describe('Link component', () => {
    it('triggers navigation and re-renders matched route', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <Link to="/about" data-testid="link-about">
            Go About
          </Link>
          <PathDisplay />
          <Routes>
            <Route path="/">
              <span data-testid="page">Home</span>
            </Route>
            <Route path="about">
              <span data-testid="page">About</span>
            </Route>
          </Routes>
        </div>,
      );

      expect(screen.getByTestId('path')).toHaveTextContent('/');
      expect(screen.getByTestId('page')).toHaveTextContent('Home');

      await user.click(screen.getByTestId('link-about'));

      expect(screen.getByTestId('path')).toHaveTextContent('/about');
      expect(screen.getByTestId('page')).toHaveTextContent('About');
    });
  });

  describe('useNavigate hook', () => {
    it('navigates programmatically to an absolute path', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/dashboard" label="dashboard" />
          <PathDisplay />
          <Routes>
            <Route path="/">
              <span data-testid="page">Home</span>
            </Route>
            <Route path="dashboard">
              <span data-testid="page">Dashboard</span>
            </Route>
          </Routes>
        </div>,
      );

      expect(screen.getByTestId('path')).toHaveTextContent('/');

      await user.click(screen.getByTestId('nav-dashboard'));

      expect(screen.getByTestId('path')).toHaveTextContent('/dashboard');
      expect(screen.getByTestId('page')).toHaveTextContent('Dashboard');
    });

    it('navigates through multiple paths sequentially', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/a" label="a" />
          <NavigateButton to="/b" label="b" />
          <NavigateButton to="/c" label="c" />
          <PathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-a'));
      expect(screen.getByTestId('path')).toHaveTextContent('/a');

      await user.click(screen.getByTestId('nav-b'));
      expect(screen.getByTestId('path')).toHaveTextContent('/b');

      await user.click(screen.getByTestId('nav-c'));
      expect(screen.getByTestId('path')).toHaveTextContent('/c');
    });
  });

  describe('useNavigation hook', () => {
    it('provides hasBack=false and hasForward=false initially', () => {
      renderWithVirtualRouter(<NavigationControls />);
      expect(screen.getByTestId('has-back')).toHaveTextContent('false');
      expect(screen.getByTestId('has-forward')).toHaveTextContent('false');
    });

    it('provides hasBack=true after navigation', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
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
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/page2" label="page2" />
          <NavigationControls />
        </div>,
      );

      await user.click(screen.getByTestId('nav-page2'));
      await user.click(screen.getByTestId('go-back'));

      expect(screen.getByTestId('nav-path')).toHaveTextContent('/');
      expect(screen.getByTestId('has-back')).toHaveTextContent('false');
      expect(screen.getByTestId('has-forward')).toHaveTextContent('true');
    });
  });

  describe('History navigation', () => {
    it('navigates back to the previous path', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/first" label="first" />
          <NavigateButton to="/second" label="second" />
          <NavigationControls />
          <PathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-first'));
      await user.click(screen.getByTestId('nav-second'));
      expect(screen.getByTestId('path')).toHaveTextContent('/second');

      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('path')).toHaveTextContent('/first');
    });

    it('navigates back through entire history to the start', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/a" label="a" />
          <NavigateButton to="/b" label="b" />
          <NavigateButton to="/c" label="c" />
          <NavigationControls />
          <PathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-a'));
      await user.click(screen.getByTestId('nav-b'));
      await user.click(screen.getByTestId('nav-c'));
      expect(screen.getByTestId('path')).toHaveTextContent('/c');

      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('path')).toHaveTextContent('/b');

      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('path')).toHaveTextContent('/a');

      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('path')).toHaveTextContent('/');
      expect(screen.getByTestId('has-back')).toHaveTextContent('false');
    });

    it('does not go back beyond the start of history', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/page" label="page" />
          <NavigationControls />
          <PathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-page'));
      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('path')).toHaveTextContent('/');

      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('path')).toHaveTextContent('/');
      expect(screen.getByTestId('has-back')).toHaveTextContent('false');
    });

    it('navigates forward after going back', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/a" label="a" />
          <NavigateButton to="/b" label="b" />
          <NavigateButton to="/c" label="c" />
          <NavigationControls />
          <PathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-a'));
      await user.click(screen.getByTestId('nav-b'));
      await user.click(screen.getByTestId('nav-c'));

      await user.click(screen.getByTestId('go-back'));
      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('path')).toHaveTextContent('/a');

      await user.click(screen.getByTestId('go-forward'));
      expect(screen.getByTestId('path')).toHaveTextContent('/b');
    });

    it('trims future history when navigating from a back position', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/a" label="a" />
          <NavigateButton to="/b" label="b" />
          <NavigateButton to="/new" label="new" />
          <NavigationControls />
          <PathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('nav-a'));
      await user.click(screen.getByTestId('nav-b'));

      await user.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('path')).toHaveTextContent('/a');

      await user.click(screen.getByTestId('nav-new'));
      expect(screen.getByTestId('path')).toHaveTextContent('/new');
      expect(screen.getByTestId('has-forward')).toHaveTextContent('false');
    });
  });

  describe('Nested routes', () => {
    it('renders correctly with parent/child path segments', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="users/*">
            <div data-testid="users-layout">
              Users Layout
              <Routes>
                <Route path="list">
                  <span data-testid="users-list">User List</span>
                </Route>
                <Route path=":id">
                  <ParamDisplay />
                </Route>
              </Routes>
            </div>
          </Route>
        </Routes>,
        { initialPath: '/users/list' },
      );

      expect(screen.getByTestId('users-layout')).toBeInTheDocument();
      expect(screen.getByTestId('users-list')).toHaveTextContent('User List');
    });

    it('renders nested route with dynamic parameter', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="users/*">
            <div data-testid="users-layout">
              <Routes>
                <Route path=":id">
                  <ParamDisplay />
                </Route>
              </Routes>
            </div>
          </Route>
        </Routes>,
        { initialPath: '/users/99' },
      );

      expect(screen.getByTestId('users-layout')).toBeInTheDocument();
      expect(screen.getByTestId('params')).toHaveTextContent('{"id":"99"}');
    });
  });

  describe('Wildcard routes', () => {
    it('matches any path with wildcard route', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="*">
            <span data-testid="catch-all">Catch All</span>
          </Route>
        </Routes>,
        { initialPath: '/anything/goes/here' },
      );

      expect(screen.getByTestId('catch-all')).toHaveTextContent('Catch All');
    });

    it('matches wildcard after a fixed prefix', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="docs/*">
            <span data-testid="docs">Docs Section</span>
          </Route>
        </Routes>,
        { initialPath: '/docs/getting-started' },
      );

      expect(screen.getByTestId('docs')).toHaveTextContent('Docs Section');
    });

    it('does not match wildcard route when prefix differs', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="docs/*">
            <span data-testid="docs">Docs</span>
          </Route>
          <Route path="blog/*">
            <span data-testid="blog">Blog</span>
          </Route>
        </Routes>,
        { initialPath: '/blog/post-1' },
      );

      expect(screen.queryByTestId('docs')).not.toBeInTheDocument();
      expect(screen.getByTestId('blog')).toHaveTextContent('Blog');
    });
  });
});
