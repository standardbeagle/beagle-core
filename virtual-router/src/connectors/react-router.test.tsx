import { test, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useContext } from 'react';
import { PathContext, PathDispatchContext } from '../provider';
import { navigate } from '../state/actions';

// Mock react-router-dom
const mockNavigate = vi.fn();
let mockPathname = '/widgets/dashboard';

vi.mock('react-router-dom', () => ({
    useLocation: () => ({ pathname: mockPathname }),
    useNavigate: () => mockNavigate,
}));

// Import after mock setup
import { ReactRouterConnector } from './react-router';

function TestChild() {
    const pathState = useContext(PathContext);
    const dispatch = useContext(PathDispatchContext);
    return (
        <div>
            <div data-testid="path">{pathState.path}</div>
            <button data-testid="nav-btn" onClick={() => dispatch?.(navigate('/settings'))}>
                Navigate
            </button>
        </div>
    );
}

test('ReactRouterConnector syncs external path to internal', () => {
    render(
        <ReactRouterConnector basePath="/widgets">
            <TestChild />
        </ReactRouterConnector>
    );

    expect(screen.getByTestId('path').textContent).toBe('/dashboard');
});

test('ReactRouterConnector calls navigate on internal navigation', () => {
    mockNavigate.mockClear();
    render(
        <ReactRouterConnector basePath="/widgets">
            <TestChild />
        </ReactRouterConnector>
    );

    act(() => {
        screen.getByTestId('nav-btn').click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/widgets/settings');
});

test('ReactRouterConnector strips basePath correctly', () => {
    mockPathname = '/widgets/users/profile';
    const { unmount } = render(
        <ReactRouterConnector basePath="/widgets">
            <TestChild />
        </ReactRouterConnector>
    );

    expect(screen.getByTestId('path').textContent).toBe('/users/profile');
    unmount();
    mockPathname = '/widgets/dashboard';
});

test('ReactRouterConnector handles root basePath', () => {
    mockPathname = '/dashboard';
    const { unmount } = render(
        <ReactRouterConnector basePath="/">
            <TestChild />
        </ReactRouterConnector>
    );

    expect(screen.getByTestId('path').textContent).toBe('/dashboard');
    unmount();
    mockPathname = '/widgets/dashboard';
});
