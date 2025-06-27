import { PathMatch, RouteParams } from "../types.ts";

export const matchPath = (routePath: string, path: string): PathMatch => {
    // Normalize paths - handle empty strings and ensure they start with /
    const normalizedRoutePath = routePath || "/";
    const normalizedPath = path || "/";
    
    const routeSegments = normalizedRoutePath.split('/').filter(s => s !== "");
    const pathSegments = normalizedPath.split('/').filter(s => s !== "");
    
    // Handle root path matching
    if (routeSegments.length === 0 && pathSegments.length === 0) {
        return getMatch(normalizedRoutePath, normalizedPath, true);
    }
    
    // Empty route path only matches empty path
    if (routeSegments.length === 0 && pathSegments.length > 0) {
        return getMatch(normalizedRoutePath, normalizedPath, false);
    }
    
    // Universal wildcard route
    if (routeSegments.length === 1 && routeSegments[0] === "*") {
        return getMatch(normalizedRoutePath, normalizedPath, true);
    }
    
    // Route is longer than path and doesn't end with wildcard
    if (routeSegments.at(-1) !== "*" && routeSegments.length > pathSegments.length) {
        return getMatch(normalizedRoutePath, "", false);
    }
    
    // Path is longer than route and route doesn't end with wildcard
    if (routeSegments.length < pathSegments.length && routeSegments.at(-1) !== "*") {
        return getMatch(normalizedRoutePath, "", false);
    }
    
    const data: RouteParams = {};
    
    for (let i = 0; i < routeSegments.length; ++i) {
        const routeSegment = routeSegments[i];
        const pathSegment = pathSegments[i];
        
        if (!pathSegment && routeSegment !== "*") {
            return getMatch(normalizedRoutePath, "", false);
        }
        
        const [pathSection, query, hash] = splitSegment(pathSegment || "");

        // Handle parameter routes (e.g., :id)
        if (routeSegment.startsWith(':')) {
            const paramName = routeSegment.substring(1);
            if (pathSection && pathSection !== "") {
                // URL decode the parameter value
                try {
                    data[paramName] = decodeURIComponent(pathSection);
                } catch {
                    data[paramName] = pathSection; // Fallback if decoding fails
                }
            } else {
                // Parameter is required but missing
                return getMatch(normalizedRoutePath, "", false);
            }
            continue;
        }
        
        // Handle wildcard routes
        if (routeSegment === "*") {
            const remainder = pathSegments.slice(i).join('/');
            return { 
                isMatch: true, 
                data, 
                remainder: remainder, 
                query, 
                hash, 
                path: pathSegments.join('/'), 
                routePath: normalizedRoutePath
            };
        }
        
        // Exact segment matching
        if (routeSegment !== pathSection) {
            return getMatch(normalizedRoutePath, "", false);
        }
    }

    return getMatch(normalizedRoutePath, normalizedPath, true, data);
}

const getMatch = (routePath: string, path: string, isMatch: boolean, data: RouteParams = {}): PathMatch => {
    const [pathSection, query, hash] = splitSegment(path);
    return { 
        isMatch, 
        remainder: "", 
        data, 
        path: pathSection, 
        query, 
        hash, 
        routePath
    };
}

const splitSegment = (segment: string): [string, string, string] => {
    if (!segment || segment === "") {
        return ["", "", ""];
    }
    
    // Handle special characters and URL encoding
    let pathSection = segment;
    let query = "";
    let hash = "";
    
    // Find hash first (everything after #)
    const hashIndex = segment.indexOf('#');
    if (hashIndex !== -1) {
        hash = segment.substring(hashIndex + 1);
        pathSection = segment.substring(0, hashIndex);
    }
    
    // Find query parameters (everything after ?)
    const queryIndex = pathSection.indexOf('?');
    if (queryIndex !== -1) {
        query = pathSection.substring(queryIndex + 1);
        pathSection = pathSection.substring(0, queryIndex);
    }
    
    // URL decode the path section
    try {
        pathSection = decodeURIComponent(pathSection);
    } catch {
        // If decoding fails, use the original value
    }
    
    return [pathSection, query, hash];
};