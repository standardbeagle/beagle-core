export const combinePaths = (current: string, newPath: string): string => {
    // Handle empty or undefined paths
    if (!newPath || newPath === '') {
        return current || '/';
    }
    
    // If new path is absolute, return it directly (after normalizing)
    if (newPath.startsWith('/')) {
        return normalizePath(newPath);
    }
    
    // Extract base path (remove query params and hash)
    const [currentBase] = (current || '/').split(/[?#]/);
    return mergePaths(currentBase, newPath);
}

export const mergePaths = (current: string, newPath: string): string => {
    // Handle empty inputs
    if (!newPath || newPath === '') {
        return normalizePath(current || '/');
    }
    
    if (!current || current === '') {
        return normalizePath('/' + newPath);
    }
    
    // Split paths and filter out empty segments
    const currentSegments = current.split('/').filter(s => s !== '');
    const newSegments = newPath.split('/').filter(s => s !== '');
    
    const resultSegments: string[] = [...currentSegments];
    
    for (const segment of newSegments) {
        if (segment === '..') {
            // Go up one level (but not above root)
            if (resultSegments.length > 0) {
                resultSegments.pop();
            }
        } else if (segment === '.') {
            // Current directory - do nothing
            continue;
        } else if (segment !== '') {
            // Regular segment - add it
            resultSegments.push(segment);
        }
    }
    
    // Always return a path starting with /
    return '/' + resultSegments.join('/');
}

// Helper function to normalize paths
const normalizePath = (path: string): string => {
    if (!path || path === '') {
        return '/';
    }
    
    // Ensure path starts with /
    if (!path.startsWith('/')) {
        path = '/' + path;
    }
    
    // Remove duplicate slashes
    path = path.replace(/\/+/g, '/');
    
    // Remove trailing slash unless it's the root
    if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    
    return path;
}
