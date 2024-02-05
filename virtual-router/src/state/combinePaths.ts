export const combinePaths = (current: string, newPath: string): string => {
    if (newPath.startsWith('/')) return mergePaths(newPath, '');
    const [currentBase] = current.split('?') ?? [""];
    return mergePaths(currentBase, newPath);
}

export const mergePaths = (current: string, newPath: string): string => {
    const segments = current.split('/').concat(newPath.split('/'));
    const newSegments : string[] = [];
    for (const segment of segments) {
        if (segment === '..') {
            newSegments.pop();
        } else if (segment.startsWith('?')) {
            const prev = newSegments.pop();
            newSegments.push(prev + segment);
        } else if (segment !== '.' && segment !== '') {
            newSegments.push(segment);
        }
    };
    return '/' + newSegments.join('/');
}
