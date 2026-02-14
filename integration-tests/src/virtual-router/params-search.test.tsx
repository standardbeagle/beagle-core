import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Routes,
  Route,
  useParams,
  useSearchParams,
  useNavigate,
} from '@standardbeagle/virtual-router';
import { renderWithVirtualRouter } from '../test-utils';

function ParamDisplay() {
  const params = useParams();
  return <span data-testid="params">{JSON.stringify(params)}</span>;
}

function SearchDisplay() {
  const { search, hash, query } = useSearchParams();
  return (
    <div>
      <span data-testid="query">{query}</span>
      <span data-testid="hash">{hash}</span>
      <span data-testid="search-entries">
        {JSON.stringify(Object.fromEntries(search.entries()))}
      </span>
    </div>
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

describe('Virtual Router: Params and Search', () => {
  describe('useParams', () => {
    it('extracts :id style parameter from a matched route', () => {
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

    it('extracts multiple dynamic segments', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="org/:orgId/team/:teamId">
            <ParamDisplay />
          </Route>
        </Routes>,
        { initialPath: '/org/acme/team/frontend' },
      );
      const params = JSON.parse(screen.getByTestId('params').textContent!);
      expect(params).toEqual({ orgId: 'acme', teamId: 'frontend' });
    });

    it('updates params on navigation to a different dynamic route', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/users/99" label="user99" />
          <Routes>
            <Route path="users/:id">
              <ParamDisplay />
            </Route>
          </Routes>
        </div>,
        { initialPath: '/users/1' },
      );

      expect(screen.getByTestId('params')).toHaveTextContent('{"id":"1"}');

      await user.click(screen.getByTestId('nav-user99'));

      expect(screen.getByTestId('params')).toHaveTextContent('{"id":"99"}');
    });

    it('decodes URL-encoded parameter values', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="search/:term">
            <ParamDisplay />
          </Route>
        </Routes>,
        { initialPath: '/search/hello%20world' },
      );
      const params = JSON.parse(screen.getByTestId('params').textContent!);
      expect(params.term).toBe('hello world');
    });

    it('extracts params in nested routes', () => {
      renderWithVirtualRouter(
        <Routes>
          <Route path="projects/*">
            <Routes>
              <Route path=":projectId">
                <ParamDisplay />
              </Route>
            </Routes>
          </Route>
        </Routes>,
        { initialPath: '/projects/alpha' },
      );
      const params = JSON.parse(screen.getByTestId('params').textContent!);
      expect(params.projectId).toBe('alpha');
    });
  });

  describe('useSearchParams', () => {
    it('returns query string parameters', () => {
      renderWithVirtualRouter(
        <SearchDisplay />,
        { initialPath: '/page?foo=bar&baz=qux' },
      );
      expect(screen.getByTestId('query')).toHaveTextContent('foo=bar&baz=qux');
      const entries = JSON.parse(screen.getByTestId('search-entries').textContent!);
      expect(entries.foo).toBe('bar');
      expect(entries.baz).toBe('qux');
    });

    it('returns hash fragment', () => {
      renderWithVirtualRouter(
        <SearchDisplay />,
        { initialPath: '/page#section1' },
      );
      expect(screen.getByTestId('hash')).toHaveTextContent('section1');
    });

    it('returns both query and hash when present', () => {
      renderWithVirtualRouter(
        <SearchDisplay />,
        { initialPath: '/page?key=value#anchor' },
      );
      expect(screen.getByTestId('query')).toHaveTextContent('key=value');
      expect(screen.getByTestId('hash')).toHaveTextContent('anchor');
    });

    it('preserves query parameters after navigation', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/other?color=blue" label="other" />
          <SearchDisplay />
        </div>,
        { initialPath: '/start' },
      );

      await user.click(screen.getByTestId('nav-other'));

      expect(screen.getByTestId('query')).toHaveTextContent('color=blue');
      const entries = JSON.parse(screen.getByTestId('search-entries').textContent!);
      expect(entries.color).toBe('blue');
    });

    it('updates search params when navigating with new query', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <NavigateButton to="/page?a=1" label="first" />
          <NavigateButton to="/page?b=2" label="second" />
          <SearchDisplay />
        </div>,
        { initialPath: '/page' },
      );

      await user.click(screen.getByTestId('nav-first'));
      expect(screen.getByTestId('query')).toHaveTextContent('a=1');

      await user.click(screen.getByTestId('nav-second'));
      expect(screen.getByTestId('query')).toHaveTextContent('b=2');
      const entries = JSON.parse(screen.getByTestId('search-entries').textContent!);
      expect(entries.b).toBe('2');
      expect(entries.a).toBeUndefined();
    });

    it('returns empty values when no query or hash present', () => {
      renderWithVirtualRouter(
        <SearchDisplay />,
        { initialPath: '/plain' },
      );
      expect(screen.getByTestId('query')).toHaveTextContent('');
      expect(screen.getByTestId('hash')).toHaveTextContent('');
    });
  });
});
