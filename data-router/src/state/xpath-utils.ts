export interface XPathSegment {
    property: string;
    index?: number;
    isArray?: boolean;
}

export function parseXPath(xpath: string): XPathSegment[] {
    if (!xpath || xpath === '/') {
        return [];
    }

    const path = xpath.startsWith('/') ? xpath.slice(1) : xpath;
    const segments = path.split('/').filter(segment => segment.length > 0);
    
    return segments.map(segment => {
        const arrayMatch = segment.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
            return {
                property: arrayMatch[1],
                index: parseInt(arrayMatch[2], 10),
                isArray: true
            };
        }
        return { property: segment };
    });
}

export function combineXPaths(base: string, relative: string): string {
    if (relative.startsWith('/')) {
        return relative;
    }

    if (relative === '..') {
        const segments = parseXPath(base);
        if (segments.length === 0) return '/';
        const result = segments.slice(0, -1).map(formatSegment).join('/');
        return result === '' ? '/' : '/' + result;
    }

    if (relative.startsWith('../')) {
        const upLevels = (relative.match(/\.\.\//g) || []).length;
        const remainingPath = relative.replace(/^(\.\.\/)+/, '');
        
        const baseSegments = parseXPath(base);
        const newBaseSegments = baseSegments.slice(0, Math.max(0, baseSegments.length - upLevels));
        
        if (remainingPath) {
            const newSegments = parseXPath(remainingPath);
            const result = [...newBaseSegments, ...newSegments].map(formatSegment).join('/');
            return result === '' ? '/' : '/' + result;
        }
        
        const result = newBaseSegments.map(formatSegment).join('/');
        return result === '' ? '/' : '/' + result;
    }

    const baseSegments = parseXPath(base);
    const relativeSegments = parseXPath(relative);
    
    const result = [...baseSegments, ...relativeSegments].map(formatSegment).join('/');
    return result === '' ? '/' : '/' + result;
}

function formatSegment(segment: XPathSegment): string {
    if (segment.isArray && segment.index !== undefined) {
        return `${segment.property}[${segment.index}]`;
    }
    return segment.property;
}

export function getDataAtXPath(data: Record<string, any>, xpath: string): any {
    if (!xpath || xpath === '/') {
        return data;
    }

    const segments = parseXPath(xpath);
    let current = data;

    for (const segment of segments) {
        if (current === null || current === undefined) {
            return undefined;
        }

        if (segment.isArray && segment.index !== undefined) {
            const array = current[segment.property];
            if (!Array.isArray(array) || segment.index >= array.length) {
                return undefined;
            }
            current = array[segment.index];
        } else {
            current = current[segment.property];
        }
    }

    return current;
}

export function setDataAtXPath(
    data: Record<string, any>, 
    xpath: string, 
    value: any, 
    operation: 'merge' | 'replace' | 'append' | 'delete' = 'replace'
): Record<string, any> {
    if (!xpath || xpath === '/') {
        if (operation === 'merge' && typeof data === 'object' && typeof value === 'object') {
            return { ...data, ...value };
        }
        return operation === 'delete' ? {} : value;
    }

    const segments = parseXPath(xpath);
    const result = { ...data };
    let current = result;

    for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];
        
        if (segment.isArray && segment.index !== undefined) {
            if (!current[segment.property] || !Array.isArray(current[segment.property])) {
                current[segment.property] = [];
            }
            current[segment.property] = [...current[segment.property]];
            
            while (current[segment.property].length <= segment.index) {
                current[segment.property].push({});
            }
            
            current = current[segment.property][segment.index];
        } else {
            if (!current[segment.property]) {
                current[segment.property] = {};
            } else {
                current[segment.property] = { ...current[segment.property] };
            }
            current = current[segment.property];
        }
    }

    const lastSegment = segments[segments.length - 1];
    
    if (lastSegment.isArray && lastSegment.index !== undefined) {
        if (!current[lastSegment.property] || !Array.isArray(current[lastSegment.property])) {
            current[lastSegment.property] = [];
        }
        current[lastSegment.property] = [...current[lastSegment.property]];
        
        if (operation === 'delete') {
            current[lastSegment.property].splice(lastSegment.index, 1);
        } else if (operation === 'append') {
            current[lastSegment.property].push(value);
        } else {
            while (current[lastSegment.property].length <= lastSegment.index) {
                current[lastSegment.property].push({});
            }
            
            if (operation === 'merge' && 
                typeof current[lastSegment.property][lastSegment.index] === 'object' && 
                typeof value === 'object') {
                current[lastSegment.property][lastSegment.index] = {
                    ...current[lastSegment.property][lastSegment.index],
                    ...value
                };
            } else {
                current[lastSegment.property][lastSegment.index] = value;
            }
        }
    } else {
        if (operation === 'delete') {
            delete current[lastSegment.property];
        } else if (operation === 'append') {
            if (!current[lastSegment.property] || !Array.isArray(current[lastSegment.property])) {
                current[lastSegment.property] = [];
            } else {
                current[lastSegment.property] = [...current[lastSegment.property]];
            }
            current[lastSegment.property].push(value);
        } else if (operation === 'merge' && 
                   typeof current[lastSegment.property] === 'object' && 
                   typeof value === 'object') {
            current[lastSegment.property] = { ...current[lastSegment.property], ...value };
        } else {
            current[lastSegment.property] = value;
        }
    }

    return result;
}

export function extractXPathParams(pattern: string, actual: string): Record<string, string | number> {
    const patternSegments = parseXPath(pattern);
    const actualSegments = parseXPath(actual);
    const params: Record<string, string | number> = {};

    if (patternSegments.length !== actualSegments.length) {
        return params;
    }

    for (let i = 0; i < patternSegments.length; i++) {
        const patternSeg = patternSegments[i];
        const actualSeg = actualSegments[i];

        if (patternSeg.property.startsWith(':')) {
            const paramName = patternSeg.property.slice(1);
            params[paramName] = actualSeg.property;
        } else if (patternSeg.property !== actualSeg.property) {
            return {};
        }

        if (patternSeg.isArray && actualSeg.isArray) {
            if (patternSeg.index !== undefined && actualSeg.index !== undefined) {
                if (patternSeg.index !== actualSeg.index) {
                    return {};
                }
            }
        } else if (patternSeg.isArray !== actualSeg.isArray) {
            return {};
        }
    }

    return params;
}