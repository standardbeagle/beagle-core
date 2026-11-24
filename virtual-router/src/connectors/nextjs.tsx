import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PathProvider } from '../provider';
import type { ConnectorProps } from './types';
import { buildPath } from './types';

export function NextRouterConnector({ basePath = '/', children, path }: ConnectorProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleChange = useCallback((newPath: string) => {
        router.push(newPath);
    }, [router]);

    return (
        <PathProvider
            path={path ?? '/'}
            basePath={basePath}
            externalPath={buildPath(pathname, searchParams.toString())}
            onChange={handleChange}
        >
            {children}
        </PathProvider>
    );
}
