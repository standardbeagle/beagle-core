import type { ReactNode } from 'react';

export interface ConnectorProps {
    basePath?: string;
    children: ReactNode;
    path?: string;
}

export function stripBasePath(basePath: string, fullPath: string): string {
    const normalizedBase = normalizeBasePath(basePath);
    const normalizedPath = ensurePathname(fullPath);

    if (normalizedBase === '/') {
        return normalizedPath;
    }

    if (normalizedPath === normalizedBase) {
        return '/';
    }

    if (normalizedPath.startsWith(`${normalizedBase}/`)) {
        return normalizedPath.slice(normalizedBase.length);
    }

    return normalizedPath;
}

export function prependBasePath(basePath: string, internalPath: string): string {
    const normalizedBase = normalizeBasePath(basePath);
    const normalizedPath = ensurePathname(internalPath);

    if (normalizedBase === '/') {
        return normalizedPath;
    }

    if (normalizedPath === '/') {
        return normalizedBase;
    }

    return `${normalizedBase}${normalizedPath}`;
}

export function buildPath(pathname: string, search?: string, hash?: string): string {
    const cleanPathname = ensurePathname(pathname);
    const cleanSearch = search ? (search.startsWith('?') ? search : `?${search}`) : '';
    const cleanHash = hash ? (hash.startsWith('#') ? hash : `#${hash}`) : '';

    return `${cleanPathname}${cleanSearch}${cleanHash}`;
}

export function getBrowserPath(): string {
    if (typeof window === 'undefined') {
        return '/';
    }

    return buildPath(window.location.pathname, window.location.search, window.location.hash);
}

function normalizeBasePath(basePath: string = '/'): string {
    const normalized = ensurePathname(basePath).replace(/\/+$/, '');
    return normalized || '/';
}

function ensurePathname(path: string = '/'): string {
    const pathname = path || '/';
    return pathname.startsWith('/') ? pathname : `/${pathname}`;
}
