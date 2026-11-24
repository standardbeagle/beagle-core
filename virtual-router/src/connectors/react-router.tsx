import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PathProvider } from '../provider';
import type { ConnectorProps } from './types';
import { buildPath } from './types';

export function ReactRouterConnector({ basePath = '/', children, path }: ConnectorProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleChange = useCallback((newPath: string) => {
        navigate(newPath);
    }, [navigate]);

    return (
        <PathProvider
            path={path ?? '/'}
            basePath={basePath}
            externalPath={buildPath(location.pathname, location.search, location.hash)}
            onChange={handleChange}
        >
            {children}
        </PathProvider>
    );
}
