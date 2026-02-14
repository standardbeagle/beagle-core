import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PathProvider } from '../provider';
import type { ConnectorProps } from './types';

export function NextRouterConnector({ basePath, children, path }: ConnectorProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleChange = useCallback((newPath: string) => {
        router.push(newPath);
    }, [router]);

    return (
        <PathProvider
            path={path ?? '/'}
            basePath={basePath}
            externalPath={pathname}
            onChange={handleChange}
        >
            {children}
        </PathProvider>
    );
}
