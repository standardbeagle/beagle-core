import { test, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useContext } from 'react';
import { PathProvider, PathContext, PathDispatchContext, RouteContext } from './provider';
import { defaultState, defaultRoute } from './state/reducer';
import { navigate } from './state/actions';

// Test component to access context values
function TestComponent() {
  const pathState = useContext(PathContext);
  const dispatch = useContext(PathDispatchContext);
  const routeData = useContext(RouteContext);

  return (
    <div>
      <div data-testid="path">{pathState.path}</div>
      <div data-testid="history">{JSON.stringify(pathState.history)}</div>
      <div data-testid="location">{pathState.location}</div>
      <div data-testid="dispatch">{dispatch ? 'dispatch-exists' : 'no-dispatch'}</div>
      <div data-testid="route">{JSON.stringify(routeData)}</div>
    </div>
  );
}

test('PathProvider should provide default context values when no path prop', () => {
  render(
    <PathProvider path="">
      <TestComponent />
    </PathProvider>
  );

  expect(screen.getByTestId('path').textContent).toBe('/');
  expect(screen.getByTestId('history').textContent).toBe('[]');
  expect(screen.getByTestId('location').textContent).toBe('0');
  expect(screen.getByTestId('dispatch').textContent).toBe('dispatch-exists');
  expect(JSON.parse(screen.getByTestId('route').textContent!)).toEqual(defaultRoute);
});

test('PathProvider should use provided path prop', () => {
  render(
    <PathProvider path="/custom/path">
      <TestComponent />
    </PathProvider>
  );

  expect(screen.getByTestId('path').textContent).toBe('/custom/path');
  expect(screen.getByTestId('history').textContent).toBe('[]');
  expect(screen.getByTestId('location').textContent).toBe('0');
});

test('PathProvider should provide working dispatch function', () => {
  let capturedDispatch: any = null;

  function CaptureDispatch() {
    const dispatch = useContext(PathDispatchContext);
    capturedDispatch = dispatch;
    return null;
  }

  render(
    <PathProvider path="/">
      <CaptureDispatch />
    </PathProvider>
  );

  expect(capturedDispatch).toBeTruthy();
  expect(typeof capturedDispatch).toBe('function');
});

test('PathProvider should handle multiple children', () => {
  render(
    <PathProvider path="/test">
      <div data-testid="child1">Child 1</div>
      <div data-testid="child2">Child 2</div>
      <TestComponent />
    </PathProvider>
  );

  expect(screen.getByTestId('child1')).toBeTruthy();
  expect(screen.getByTestId('child2')).toBeTruthy();
  expect(screen.getByTestId('path').textContent).toBe('/test');
});

test('PathProvider should provide isolated context for nested providers', () => {
  render(
    <PathProvider path="/outer">
      <div data-testid="outer">
        <TestComponent />
      </div>
      <PathProvider path="/inner">
        <div data-testid="inner">
          <TestComponent />
        </div>
      </PathProvider>
    </PathProvider>
  );

  const outerPath = screen.getAllByTestId('path')[0];
  const innerPath = screen.getAllByTestId('path')[1];

  expect(outerPath.textContent).toBe('/outer');
  expect(innerPath.textContent).toBe('/inner');
});

test('PathProvider should handle empty string path as default', () => {
  render(
    <PathProvider path="">
      <TestComponent />
    </PathProvider>
  );

  expect(screen.getByTestId('path').textContent).toBe('/');
});

test('PathProvider should memoize context values to prevent unnecessary re-renders', () => {
  const renderSpy = vi.fn();

  function SpyComponent() {
    const pathState = useContext(PathContext);
    renderSpy(pathState);
    return <div>{pathState.path}</div>;
  }

  const { rerender } = render(
    <PathProvider path="/test">
      <SpyComponent />
    </PathProvider>
  );

  expect(renderSpy).toHaveBeenCalledTimes(1);

  // Re-render with same props
  rerender(
    <PathProvider path="/test">
      <SpyComponent />
    </PathProvider>
  );

  // Note: PathProvider now memoizes context values, so this should not cause additional renders
  expect(renderSpy).toHaveBeenCalledTimes(1);
});

test('Context default values should match expected defaults', () => {
  // Test accessing contexts outside of provider
  function OutsideProvider() {
    const pathState = useContext(PathContext);
    const dispatch = useContext(PathDispatchContext);
    const routeData = useContext(RouteContext);

    return (
      <div>
        <div data-testid="default-path">{JSON.stringify(pathState)}</div>
        <div data-testid="default-dispatch">{String(dispatch)}</div>
        <div data-testid="default-route">{JSON.stringify(routeData)}</div>
      </div>
    );
  }

  render(<OutsideProvider />);

  expect(JSON.parse(screen.getByTestId('default-path').textContent!)).toEqual(defaultState);
  expect(screen.getByTestId('default-dispatch').textContent).toBe('null');
  expect(JSON.parse(screen.getByTestId('default-route').textContent!)).toEqual(defaultRoute);
});

test('PathProvider should handle special characters in path', () => {
  const specialPaths = [
    '/path with spaces',
    '/path?query=value',
    '/path#hash',
    '/path/with/många/segments',
    '/😀/emoji/path',
  ];

  specialPaths.forEach((path) => {
    const { unmount } = render(
      <PathProvider path={path}>
        <TestComponent />
      </PathProvider>
    );

    expect(screen.getByTestId('path').textContent).toBe(path);
    unmount();
  });
});

test('PathProvider should pass through any children type', () => {
  // Test with different children types
  const { unmount: unmount1 } = render(
    <PathProvider path="/">
      Simple text child
    </PathProvider>
  );
  unmount1();

  const { unmount: unmount2 } = render(
    <PathProvider path="/">
      {null}
    </PathProvider>
  );
  unmount2();

  const { unmount: unmount3 } = render(
    <PathProvider path="/">
      <>
        <div>Fragment child 1</div>
        <div>Fragment child 2</div>
      </>
    </PathProvider>
  );
  unmount3();

  // If we got here without errors, the test passes
  expect(true).toBe(true);
});

// Controlled mode tests
test('Controlled mode: externalPath changes update internal path', () => {
  const { rerender } = render(
    <PathProvider path="/" basePath="/widgets" externalPath="/widgets/dashboard">
      <TestComponent />
    </PathProvider>
  );

  expect(screen.getByTestId('path').textContent).toBe('/dashboard');

  rerender(
    <PathProvider path="/" basePath="/widgets" externalPath="/widgets/settings">
      <TestComponent />
    </PathProvider>
  );

  expect(screen.getByTestId('path').textContent).toBe('/settings');
});

test('Controlled mode: onChange fires on internal navigation', () => {
  const onChange = vi.fn();
  let capturedDispatch: any = null;

  function CaptureAndDisplay() {
    const pathState = useContext(PathContext);
    const dispatch = useContext(PathDispatchContext);
    capturedDispatch = dispatch;
    return <div data-testid="ctrl-path">{pathState.path}</div>;
  }

  render(
    <PathProvider path="/" basePath="/widgets" externalPath="/widgets/" onChange={onChange}>
      <CaptureAndDisplay />
    </PathProvider>
  );

  expect(screen.getByTestId('ctrl-path').textContent).toBe('/');

  act(() => {
    capturedDispatch(navigate('/about'));
  });

  expect(screen.getByTestId('ctrl-path').textContent).toBe('/about');
  expect(onChange).toHaveBeenCalledWith('/widgets/about');
});

test('Controlled mode: basePath stripping works correctly', () => {
  render(
    <PathProvider path="/" basePath="/app/widgets" externalPath="/app/widgets/list">
      <TestComponent />
    </PathProvider>
  );

  expect(screen.getByTestId('path').textContent).toBe('/list');
});

test('Controlled mode: no infinite sync loops', () => {
  const onChange = vi.fn();

  const { rerender } = render(
    <PathProvider path="/" basePath="/widgets" externalPath="/widgets/a" onChange={onChange}>
      <TestComponent />
    </PathProvider>
  );

  // externalPath change should NOT fire onChange (it's an external sync)
  onChange.mockClear();
  rerender(
    <PathProvider path="/" basePath="/widgets" externalPath="/widgets/b" onChange={onChange}>
      <TestComponent />
    </PathProvider>
  );

  expect(screen.getByTestId('path').textContent).toBe('/b');
  expect(onChange).not.toHaveBeenCalled();
});

test('Without externalPath/onChange, PathProvider works as before', () => {
  let capturedDispatch: any = null;

  function CaptureAndDisplay() {
    const pathState = useContext(PathContext);
    const dispatch = useContext(PathDispatchContext);
    capturedDispatch = dispatch;
    return <div data-testid="legacy-path">{pathState.path}</div>;
  }

  render(
    <PathProvider path="/start">
      <CaptureAndDisplay />
    </PathProvider>
  );

  expect(screen.getByTestId('legacy-path').textContent).toBe('/start');

  act(() => {
    capturedDispatch(navigate('/next'));
  });

  expect(screen.getByTestId('legacy-path').textContent).toBe('/next');
});