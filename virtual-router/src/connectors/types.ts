import type { ReactNode } from 'react';

export interface ConnectorProps {
    basePath: string;
    children: ReactNode;
    path?: string;
}

export function stripBasePath(basePath: string, fullPath: string): string {
    if (!basePath || basePath === '/') return fullPath;
    if (fullPath.startsWith(basePath)) {
        const stripped = fullPath.slice(basePath.length);
        return stripped === '' ? '/' : stripped;
    }
    return fullPath;
}

export function prependBasePath(basePath: string, internalPath: string): string {
    if (!basePath || basePath === '/') return internalPath;
    if (internalPath === '/') return basePath;
    return basePath + internalPath;
}
