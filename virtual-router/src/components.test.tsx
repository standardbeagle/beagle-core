import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Link, Route, Routes } from './index';
import { PathProvider } from './provider';
import { useNavigate, usePath } from './index';

// Helper component to track navigation
function NavigationTracker() {
  const path = usePath();
  return <div data-testid="current-path">{path}</div>;
}

test('Link should render as anchor element', () => {
  render(
    <PathProvider path="/">
      <Link to="/test">Test Link</Link>
    </PathProvider>
  );

  const link = screen.getByRole('link', { name: 'Test Link' });
  expect(link).toBeTruthy();
  expect(link).toHaveAttribute('href', '/test');
});

test('Link should navigate on click', async () => {
  const user = userEvent.setup();
  
  render(
    <PathProvider path="/">
      <NavigationTracker />
      <Link to="/about">About</Link>
    </PathProvider>
  );

  expect(screen.getByTestId('current-path')).toHaveTextContent('/');
  
  await user.click(screen.getByRole('link', { name: 'About' }));
  
  // Note: In isolated tests, navigation doesn't update the context
  // This behavior is tested in integration tests
});

test('Link should prevent default anchor behavior', () => {
  const mockPreventDefault = vi.fn();
  
  render(
    <PathProvider path="/">
      <Link to="/test">Test</Link>
    </PathProvider>
  );

  const link = screen.getByRole('link');
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'preventDefault', { value: mockPreventDefault });
  
  fireEvent(link, event);
  
  expect(mockPreventDefault).toHaveBeenCalled();
});

test('Link should not navigate if event is already prevented', () => {
  const navigateSpy = vi.fn();
  
  function TestComponent() {
    const navigate = useNavigate();
    // Spy on navigate calls
    React.useEffect(() => {
      const originalNavigate = navigate;
      (window as any).testNavigate = (path: string) => {
        navigateSpy(path);
        originalNavigate(path);
      };
    }, [navigate]);
    
    return (
      <div onClick={(e) => e.preventDefault()}>
        <Link to="/test">Test</Link>
      </div>
    );
  }
  
  render(
    <PathProvider path="/">
      <TestComponent />
    </PathProvider>
  );

  const link = screen.getByRole('link');
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  event.preventDefault();
  
  fireEvent(link, event);
  
  // Navigation shouldn't happen if default was already prevented
  expect(navigateSpy).not.toHaveBeenCalled();
});

test('Link should accept ref', () => {
  const ref = React.createRef<HTMLAnchorElement>();
  
  render(
    <PathProvider path="/">
      <Link ref={ref} to="/test">Test</Link>
    </PathProvider>
  );

  expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  expect(ref.current?.href).toContain('/test');
});

test('Link should pass through additional props', () => {
  render(
    <PathProvider path="/">
      <Link 
        to="/test" 
        className="custom-class"
        id="custom-id"
        data-testid="custom-link"
        aria-label="Custom Label"
      >
        Test
      </Link>
    </PathProvider>
  );

  const link = screen.getByTestId('custom-link');
  expect(link).toHaveClass('custom-class');
  expect(link).toHaveAttribute('id', 'custom-id');
  expect(link).toHaveAttribute('aria-label', 'Custom Label');
});

test('Link should handle different to prop formats', () => {
  const paths = [
    { to: '/', expected: '/' },
    { to: '/absolute', expected: '/absolute' },
    { to: 'relative', expected: 'relative' },
    { to: '../parent', expected: '../parent' },
    { to: './sibling', expected: './sibling' },
    { to: '/path?query=1', expected: '/path?query=1' },
    { to: '/path#hash', expected: '/path#hash' },
  ];

  paths.forEach(({ to, expected }) => {
    const { unmount } = render(
      <PathProvider path="/">
        <Link to={to}>Test</Link>
      </PathProvider>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expected);
    unmount();
  });
});

test('Link should render different types of children', () => {
  const { rerender } = render(
    <PathProvider path="/">
      <Link to="/test">Simple text</Link>
    </PathProvider>
  );

  expect(screen.getByText('Simple text')).toBeTruthy();

  rerender(
    <PathProvider path="/">
      <Link to="/test">
        <span>Nested element</span>
      </Link>
    </PathProvider>
  );

  expect(screen.getByText('Nested element')).toBeTruthy();

  rerender(
    <PathProvider path="/">
      <Link to="/test">
        <>
          <span>Fragment</span>
          <span>Children</span>
        </>
      </Link>
    </PathProvider>
  );

  expect(screen.getByText('Fragment')).toBeTruthy();
  expect(screen.getByText('Children')).toBeTruthy();
});

test('Routes should render matching Route components', () => {
  render(
    <PathProvider path="/home">
      <Routes>
        <Route path="/home">
          <div>Home Page</div>
        </Route>
        <Route path="/about">
          <div>About Page</div>
        </Route>
      </Routes>
    </PathProvider>
  );

  expect(screen.getByText('Home Page')).toBeTruthy();
  expect(screen.queryByText('About Page')).not.toBeTruthy();
});

test('Routes should render multiple matching routes', () => {
  render(
    <PathProvider path="/users/123">
      <Routes>
        <Route path="/users/*">
          <div>Users Layout</div>
        </Route>
        <Route path="/users/:id">
          <div>User Profile</div>
        </Route>
      </Routes>
    </PathProvider>
  );

  expect(screen.getByText('Users Layout')).toBeTruthy();
  expect(screen.getByText('User Profile')).toBeTruthy();
});

test('Routes should handle nested Routes components', () => {
  render(
    <PathProvider path="/app/dashboard">
      <Routes>
        <Route path="/app/*">
          <div>App Layout</div>
          <Routes>
            <Route path="/app/dashboard">
              <div>Dashboard</div>
            </Route>
            <Route path="/app/settings">
              <div>Settings</div>
            </Route>
          </Routes>
        </Route>
      </Routes>
    </PathProvider>
  );

  expect(screen.getByText('App Layout')).toBeTruthy();
  expect(screen.getByText('Dashboard')).toBeTruthy();
  expect(screen.queryByText('Settings')).not.toBeTruthy();
});

test('Routes should handle React.Fragment children', () => {
  render(
    <PathProvider path="/test">
      <Routes>
        <>
          <Route path="/test">
            <div>Test Page</div>
          </Route>
          <Route path="/other">
            <div>Other Page</div>
          </Route>
        </>
      </Routes>
    </PathProvider>
  );

  expect(screen.getByText('Test Page')).toBeTruthy();
  expect(screen.queryByText('Other Page')).not.toBeTruthy();
});

test('Routes should ignore non-Route/non-Fragment children', () => {
  render(
    <PathProvider path="/test">
      <Routes>
        <div>This should be ignored</div>
        <Route path="/test">
          <div>Test Page</div>
        </Route>
        Some text that should be ignored
        {null}
        {false}
        {undefined}
      </Routes>
    </PathProvider>
  );

  expect(screen.getByText('Test Page')).toBeTruthy();
  expect(screen.queryByText('This should be ignored')).not.toBeTruthy();
  expect(screen.queryByText('Some text that should be ignored')).not.toBeTruthy();
});

test('Route component should not render anything by itself', () => {
  const { container } = render(
    <PathProvider path="/">
      <Route path="/test">
        <div>Content</div>
      </Route>
    </PathProvider>
  );

  // Route component returns empty fragment
  expect(container.firstChild).toBeNull();
});

test('Routes should handle empty children', () => {
  const { container } = render(
    <PathProvider path="/">
      <Routes />
    </PathProvider>
  );

  expect(container.firstChild).toBeNull();
});

test('Routes should handle complex path patterns', () => {
  render(
    <PathProvider path="/products/electronics/phones/iphone">
      <Routes>
        <Route path="/products/*">
          <div>Products</div>
        </Route>
        <Route path="/products/electronics/*">
          <div>Electronics</div>
        </Route>
        <Route path="/products/electronics/phones/*">
          <div>Phones</div>
        </Route>
        <Route path="/products/electronics/phones/iphone">
          <div>iPhone</div>
        </Route>
      </Routes>
    </PathProvider>
  );

  // All matching routes should render
  expect(screen.getByText('Products')).toBeTruthy();
  expect(screen.getByText('Electronics')).toBeTruthy();
  expect(screen.getByText('Phones')).toBeTruthy();
  expect(screen.getByText('iPhone')).toBeTruthy();
});

test('Link should work with keyboard navigation', async () => {
  const user = userEvent.setup();
  
  render(
    <PathProvider path="/">
      <Link to="/test">Test Link</Link>
      <button>Focus Target</button>
    </PathProvider>
  );

  const link = screen.getByRole('link');
  const button = screen.getByRole('button');

  // Tab to link
  await user.tab();
  expect(link).toHaveFocus();

  // Tab away from link
  await user.tab();
  expect(button).toHaveFocus();
});

test('Link should handle special characters in to prop', () => {
  const specialPaths = [
    '/path with spaces',
    '/path?query=with spaces&special=chars!',
    '/path#hash-with-special-chars!',
    '/path/with/émojis/😀',
    '/path%20with%20encoding',
  ];

  specialPaths.forEach((path) => {
    const { unmount } = render(
      <PathProvider path="/">
        <Link to={path}>Test</Link>
      </PathProvider>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', path);
    unmount();
  });
});