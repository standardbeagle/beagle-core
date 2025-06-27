import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PathProvider, Routes, Route, Link, useSearchParams, useParams, usePath } from './index';

// Test component for query string extraction
function QueryStringTestComponent() {
  const { search, hash, query } = useSearchParams();
  const params = useParams();
  const path = usePath();

  return (
    <div>
      <div data-testid="path">{path}</div>
      <div data-testid="query">{query}</div>
      <div data-testid="hash">{hash}</div>
      <div data-testid="search-params">{JSON.stringify(Object.fromEntries(search))}</div>
      <div data-testid="route-params">{JSON.stringify(params)}</div>
    </div>
  );
}

test('Simple query string parsing', () => {
  render(
    <PathProvider path="/search?q=test&category=books">
      <Routes>
        <Route path="/search">
          <QueryStringTestComponent />
        </Route>
      </Routes>
    </PathProvider>
  );

  expect(screen.getByTestId('path').textContent).toBe('/search');
  expect(screen.getByTestId('query').textContent).toBe('q=test&category=books');
  expect(JSON.parse(screen.getByTestId('search-params').textContent!)).toEqual({
    q: 'test',
    category: 'books'
  });
});

test('Query string with special characters and encoding', () => {
  render(
    <PathProvider path="/search?q=hello%20world&special=%26%3D%3F&unicode=caf%C3%A9">
      <Routes>
        <Route path="/search">
          <QueryStringTestComponent />
        </Route>
      </Routes>
    </PathProvider>
  );

  const searchParams = JSON.parse(screen.getByTestId('search-params').textContent!);
  expect(searchParams).toEqual({
    q: 'hello world',      // URL decoded
    special: '&=?',        // Special characters decoded
    unicode: 'café'        // Unicode character decoded
  });
});

test('Query string with array-like parameters', () => {
  function ArrayParamsTest() {
    const { search } = useSearchParams();
    return (
      <div>
        <QueryStringTestComponent />
        <div data-testid="tags-array">{JSON.stringify(search.getAll('tags'))}</div>
      </div>
    );
  }

  render(
    <PathProvider path="/filter?tags=javascript&tags=react&tags=typescript">
      <Routes>
        <Route path="/filter">
          <ArrayParamsTest />
        </Route>
      </Routes>
    </PathProvider>
  );

  expect(JSON.parse(screen.getByTestId('tags-array').textContent!)).toEqual(['javascript', 'react', 'typescript']);
});

test('Empty and malformed query strings', () => {
  const testCases = [
    '/search?',           // Empty query
    '/search?=value',     // Missing key
    '/search?key=',       // Empty value
    '/search?key',        // No value
    '/search?a=1&',       // Trailing ampersand
    '/search?a=1&&b=2',   // Double ampersand
  ];

  testCases.forEach((path) => {
    const { unmount } = render(
      <PathProvider path={path}>
        <Routes>
          <Route path="/search">
            <QueryStringTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );

    // Should not crash and should handle gracefully
    expect(screen.getByTestId('search-params')).toBeTruthy();
    unmount();
  });
});

test('Hash fragments with query parameters', () => {
  render(
    <PathProvider path="/page?param=value#section">
      <Routes>
        <Route path="/page">
          <QueryStringTestComponent />
        </Route>
      </Routes>
    </PathProvider>
  );

  expect(screen.getByTestId('query').textContent).toBe('param=value');
  expect(screen.getByTestId('hash').textContent).toBe('section');
  expect(JSON.parse(screen.getByTestId('search-params').textContent!)).toEqual({
    param: 'value'
  });
});

test('Complex query string with nested objects and arrays', () => {
  render(
    <PathProvider path="/api?filter[name]=john&filter[age]=30&sort[]=name&sort[]=date&nested[deep][value]=test">
      <Routes>
        <Route path="/api">
          <QueryStringTestComponent />
        </Route>
      </Routes>
    </PathProvider>
  );

  const searchParams = JSON.parse(screen.getByTestId('search-params').textContent!);
  expect(searchParams).toMatchObject({
    'filter[name]': 'john',
    'filter[age]': '30',
    'nested[deep][value]': 'test'
  });
});

test('Route parameters combined with query parameters', () => {
  render(
    <PathProvider path="/users/123/posts?sort=date&limit=10">
      <Routes>
        <Route path="/users/:userId/posts">
          <QueryStringTestComponent />
        </Route>
      </Routes>
    </PathProvider>
  );

  expect(JSON.parse(screen.getByTestId('route-params').textContent!)).toEqual({
    userId: '123'
  });
  expect(JSON.parse(screen.getByTestId('search-params').textContent!)).toEqual({
    sort: 'date',
    limit: '10'
  });
});

test('Navigation preserves query parameters', async () => {
  const user = userEvent.setup();

  function NavigationWithQuery() {
    return (
      <PathProvider path="/search?q=initial">
        <nav>
          <Link to="/search?q=updated&filter=new">Update Query</Link>
          <Link to="/search">Clear Query</Link>
        </nav>
        <Routes>
          <Route path="/search">
            <QueryStringTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<NavigationWithQuery />);

  // Initial state
  expect(JSON.parse(screen.getByTestId('search-params').textContent!)).toEqual({
    q: 'initial'
  });

  // Navigate with new query
  await user.click(screen.getByRole('link', { name: 'Update Query' }));
  expect(JSON.parse(screen.getByTestId('search-params').textContent!)).toEqual({
    q: 'updated',
    filter: 'new'
  });

  // Navigate without query
  await user.click(screen.getByRole('link', { name: 'Clear Query' }));
  expect(JSON.parse(screen.getByTestId('search-params').textContent!)).toEqual({});
});

test('Query parameter edge cases', () => {
  const edgeCases = [
    {
      path: '/test?plus=a+b+c',
      expected: { plus: 'a b c' }  // Plus should decode to space
    },
    {
      path: '/test?encoded=%2B%2D%2A%2F',
      expected: { encoded: '+-*/' }  // Special characters
    },
    {
      path: '/test?bool=true&num=42&empty=',
      expected: { bool: 'true', num: '42', empty: '' }  // Different value types
    },
    {
      path: '/test?japanese=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF',
      expected: { japanese: 'こんにちは' }  // Japanese characters
    }
  ];

  edgeCases.forEach(({ path, expected }) => {
    const { unmount } = render(
      <PathProvider path={path}>
        <Routes>
          <Route path="/test">
            <QueryStringTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );

    expect(JSON.parse(screen.getByTestId('search-params').textContent!)).toEqual(expected);
    unmount();
  });
});

test('useSearchParams hook provides readonly URLSearchParams', () => {
  function SearchParamsMethodTest() {
    const { search } = useSearchParams();
    
    return (
      <div>
        <div data-testid="has-method">{String(typeof search.get === 'function')}</div>
        <div data-testid="has-getall">{String(typeof search.getAll === 'function')}</div>
        <div data-testid="has-keys">{String(typeof search.keys === 'function')}</div>
        <div data-testid="get-value">{search.get('test') || 'null'}</div>
        <div data-testid="entries">{JSON.stringify(Array.from(search.entries()))}</div>
      </div>
    );
  }

  render(
    <PathProvider path="/test?test=value&multi=1&multi=2">
      <Routes>
        <Route path="/test">
          <SearchParamsMethodTest />
        </Route>
      </Routes>
    </PathProvider>
  );

  expect(screen.getByTestId('has-method').textContent).toBe('true');
  expect(screen.getByTestId('has-getall').textContent).toBe('true');
  expect(screen.getByTestId('has-keys').textContent).toBe('true');
  expect(screen.getByTestId('get-value').textContent).toBe('value');
  expect(JSON.parse(screen.getByTestId('entries').textContent!)).toEqual([
    ['test', 'value'],
    ['multi', '1'],
    ['multi', '2']
  ]);
});

test('Query string updates through navigation history', async () => {
  const user = userEvent.setup();

  function QueryHistoryTest() {
    return (
      <PathProvider path="/search">
        <nav>
          <Link to="/search?q=first">First</Link>
          <Link to="/search?q=second">Second</Link>
          <Link to="/search?q=third">Third</Link>
        </nav>
        <Routes>
          <Route path="/search">
            <QueryStringTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<QueryHistoryTest />);

  // Navigate through different query states
  await user.click(screen.getByRole('link', { name: 'First' }));
  expect(JSON.parse(screen.getByTestId('search-params').textContent!)).toEqual({ q: 'first' });

  await user.click(screen.getByRole('link', { name: 'Second' }));
  expect(JSON.parse(screen.getByTestId('search-params').textContent!)).toEqual({ q: 'second' });

  await user.click(screen.getByRole('link', { name: 'Third' }));
  expect(JSON.parse(screen.getByTestId('search-params').textContent!)).toEqual({ q: 'third' });
});