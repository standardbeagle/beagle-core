import { useCallback } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { PathProvider } from '../provider';
import type { ConnectorProps } from './types';
import { buildPath } from './types';

export function TanStackRouterConnector({ basePath = '/', children, path }: ConnectorProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleChange = useCallback((newPath: string) => {
        navigate({ to: newPath });
    }, [navigate]);

    return (
        <PathProvider
            path={path ?? '/'}
            basePath={basePath}
            externalPath={buildPath(location.pathname, location.searchStr, location.hash)}
            onChange={handleChange}
        >
            {children}
        </PathProvider>
    );
}
