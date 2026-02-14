import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Routes,
  Route,
  PathProvider,
  RouterErrorBoundary,
  ErrorProvider,
  useRouteError,
  useRouteErrors,
  useNavigate,
  usePath,
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

function ThrowingComponent({ message }: { message: string }) {
  throw new Error(message);
}

function RouteErrorDisplay() {
  const error = useRouteError();
  return (
    <span data-testid="route-error">
      {error ? error.message : 'no-error'}
    </span>
  );
}

function RouteErrorsDisplay() {
  const ctx = useRouteErrors();
  if (!ctx) return <span data-testid="route-errors">no-context</span>;
  return (
    <span data-testid="route-errors">
      {ctx.errors.length === 0
        ? 'no-errors'
        : ctx.errors.map((e) => e.message).join(',')}
    </span>
  );
}

function AddErrorButton({
  message,
  label,
}: {
  message: string;
  label: string;
}) {
  const ctx = useRouteErrors();
  return (
    <button
      data-testid={`add-error-${label}`}
      onClick={() =>
        ctx?.addError({ message, timestamp: Date.now() })
      }
    >
      {label}
    </button>
  );
}

function ClearErrorsButton() {
  const ctx = useRouteErrors();
  return (
    <button data-testid="clear-errors" onClick={() => ctx?.clearErrors()}>
      Clear
    </button>
  );
}

describe('Virtual Router: Error Boundaries', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('RouterErrorBoundary', () => {
    it('renders children when no error occurs', () => {
      renderWithVirtualRouter(
        <RouterErrorBoundary>
          <span data-testid="child">OK</span>
        </RouterErrorBoundary>,
      );
      expect(screen.getByTestId('child')).toHaveTextContent('OK');
    });

    it('renders default fallback when a child throws', () => {
      renderWithVirtualRouter(
        <RouterErrorBoundary>
          <ThrowingComponent message="test crash" />
        </RouterErrorBoundary>,
      );
      expect(
        screen.getByText('Something went wrong with routing'),
      ).toBeInTheDocument();
    });

    it('renders custom fallback when a child throws', () => {
      renderWithVirtualRouter(
        <RouterErrorBoundary
          fallback={<span data-testid="fallback">Custom Error</span>}
        >
          <ThrowingComponent message="test crash" />
        </RouterErrorBoundary>,
      );
      expect(screen.getByTestId('fallback')).toHaveTextContent('Custom Error');
    });

    it('calls onError callback with error details', () => {
      const onError = vi.fn();
      renderWithVirtualRouter(
        <RouterErrorBoundary onError={onError}>
          <ThrowingComponent message="callback test" />
        </RouterErrorBoundary>,
      );
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(onError.mock.calls[0][0].message).toBe('callback test');
    });

    it('catches errors from route components', () => {
      renderWithVirtualRouter(
        <RouterErrorBoundary
          fallback={<span data-testid="fallback">Route Error</span>}
        >
          <Routes>
            <Route path="bad">
              <ThrowingComponent message="route error" />
            </Route>
          </Routes>
        </RouterErrorBoundary>,
        { initialPath: '/bad' },
      );
      expect(screen.getByTestId('fallback')).toHaveTextContent('Route Error');
    });

    it('isolates errors to the boundary that wraps them', () => {
      renderWithVirtualRouter(
        <div>
          <RouterErrorBoundary
            fallback={<span data-testid="fallback-a">Error A</span>}
          >
            <ThrowingComponent message="a fails" />
          </RouterErrorBoundary>
          <RouterErrorBoundary>
            <span data-testid="safe-b">B is fine</span>
          </RouterErrorBoundary>
        </div>,
      );
      expect(screen.getByTestId('fallback-a')).toHaveTextContent('Error A');
      expect(screen.getByTestId('safe-b')).toHaveTextContent('B is fine');
    });
  });

  describe('ErrorProvider and useRouteError', () => {
    it('returns null when no errors are present', () => {
      renderWithVirtualRouter(
        <ErrorProvider>
          <RouteErrorDisplay />
        </ErrorProvider>,
      );
      expect(screen.getByTestId('route-error')).toHaveTextContent('no-error');
    });

    it('returns null when used outside ErrorProvider', () => {
      renderWithVirtualRouter(<RouteErrorDisplay />);
      expect(screen.getByTestId('route-error')).toHaveTextContent('no-error');
    });

    it('returns the first error after one is added', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <ErrorProvider>
          <AddErrorButton message="first error" label="add" />
          <RouteErrorDisplay />
        </ErrorProvider>,
      );

      await user.click(screen.getByTestId('add-error-add'));
      expect(screen.getByTestId('route-error')).toHaveTextContent(
        'first error',
      );
    });
  });

  describe('useRouteErrors', () => {
    it('returns null when used outside ErrorProvider', () => {
      renderWithVirtualRouter(<RouteErrorsDisplay />);
      expect(screen.getByTestId('route-errors')).toHaveTextContent(
        'no-context',
      );
    });

    it('tracks multiple errors', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <ErrorProvider>
          <AddErrorButton message="err-1" label="first" />
          <AddErrorButton message="err-2" label="second" />
          <RouteErrorsDisplay />
        </ErrorProvider>,
      );

      await user.click(screen.getByTestId('add-error-first'));
      await user.click(screen.getByTestId('add-error-second'));
      expect(screen.getByTestId('route-errors')).toHaveTextContent(
        'err-1,err-2',
      );
    });

    it('clears all errors', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <ErrorProvider>
          <AddErrorButton message="to-clear" label="add" />
          <ClearErrorsButton />
          <RouteErrorsDisplay />
        </ErrorProvider>,
      );

      await user.click(screen.getByTestId('add-error-add'));
      expect(screen.getByTestId('route-errors')).toHaveTextContent('to-clear');

      await user.click(screen.getByTestId('clear-errors'));
      expect(screen.getByTestId('route-errors')).toHaveTextContent('no-errors');
    });
  });

  describe('ErrorProvider scoping', () => {
    it('scopes errors to their own ErrorProvider', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <ErrorProvider>
            <AddErrorButton message="scope-a" label="a" />
            <RouteErrorsDisplay />
          </ErrorProvider>
          <ErrorProvider>
            <RouteErrorDisplay />
          </ErrorProvider>
        </div>,
      );

      await user.click(screen.getByTestId('add-error-a'));
      expect(screen.getByTestId('route-errors')).toHaveTextContent('scope-a');
      expect(screen.getByTestId('route-error')).toHaveTextContent('no-error');
    });
  });

  describe('Recovery from error state', () => {
    it('sibling routes remain functional after error boundary catches', async () => {
      const user = userEvent.setup();

      function ConditionalThrower() {
        const path = usePath();
        if (path === '/crash') {
          throw new Error('boom');
        }
        return <span data-testid="content">Safe at {path}</span>;
      }

      render(
        <PathProvider path="/">
          <NavigateButton to="/crash" label="crash" />
          <NavigateButton to="/safe" label="safe" />
          <PathDisplay />
          <RouterErrorBoundary
            fallback={<span data-testid="fallback">Crashed</span>}
          >
            <Routes>
              <Route path="*">
                <ConditionalThrower />
              </Route>
            </Routes>
          </RouterErrorBoundary>
        </PathProvider>,
      );

      expect(screen.getByTestId('content')).toHaveTextContent('Safe at /');

      await user.click(screen.getByTestId('nav-crash'));
      expect(screen.getByTestId('fallback')).toHaveTextContent('Crashed');

      // Navigation controls still work outside the error boundary
      expect(screen.getByTestId('path')).toHaveTextContent('/crash');
    });
  });
});
