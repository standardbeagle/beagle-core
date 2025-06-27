import { describe, it, expect } from 'vitest';
import { parseXPath, combineXPaths, getDataAtXPath, setDataAtXPath, extractXPathParams } from './xpath-utils';

describe('parseXPath', () => {
    it('should parse simple xpath', () => {
        const result = parseXPath('/users/profile');
        expect(result).toEqual([
            { property: 'users' },
            { property: 'profile' }
        ]);
    });

    it('should parse xpath with array indices', () => {
        const result = parseXPath('/users[0]/profile');
        expect(result).toEqual([
            { property: 'users', index: 0, isArray: true },
            { property: 'profile' }
        ]);
    });

    it('should handle root path', () => {
        expect(parseXPath('/')).toEqual([]);
        expect(parseXPath('')).toEqual([]);
    });

    it('should handle relative paths', () => {
        const result = parseXPath('profile/settings');
        expect(result).toEqual([
            { property: 'profile' },
            { property: 'settings' }
        ]);
    });
});

describe('combineXPaths', () => {
    it('should handle absolute paths', () => {
        expect(combineXPaths('/users/profile', '/admin/settings')).toBe('/admin/settings');
    });

    it('should combine relative paths', () => {
        expect(combineXPaths('/users/profile', 'settings')).toBe('/users/profile/settings');
    });

    it('should handle parent directory navigation', () => {
        expect(combineXPaths('/users/profile/settings', '..')).toBe('/users/profile');
        expect(combineXPaths('/users/profile', '..')).toBe('/users');
        expect(combineXPaths('/users', '..')).toBe('/');
    });

    it('should handle complex relative paths', () => {
        expect(combineXPaths('/users/profile', '../admin/settings')).toBe('/users/admin/settings');
    });
});

describe('getDataAtXPath', () => {
    const testData = {
        users: [
            { name: 'John', profile: { email: 'john@example.com' } },
            { name: 'Jane', profile: { email: 'jane@example.com' } }
        ],
        settings: {
            theme: 'dark',
            notifications: true
        }
    };

    it('should get data at root', () => {
        expect(getDataAtXPath(testData, '/')).toEqual(testData);
    });

    it('should get nested object data', () => {
        expect(getDataAtXPath(testData, '/settings/theme')).toBe('dark');
    });

    it('should get array element data', () => {
        expect(getDataAtXPath(testData, '/users[0]/name')).toBe('John');
        expect(getDataAtXPath(testData, '/users[1]/profile/email')).toBe('jane@example.com');
    });

    it('should return undefined for invalid paths', () => {
        expect(getDataAtXPath(testData, '/nonexistent')).toBeUndefined();
        expect(getDataAtXPath(testData, '/users[5]/name')).toBeUndefined();
    });
});

describe('setDataAtXPath', () => {
    const initialData = {
        users: [{ name: 'John' }],
        settings: { theme: 'light' }
    };

    it('should replace data at xpath', () => {
        const result = setDataAtXPath(initialData, '/settings/theme', 'dark');
        expect(result.settings.theme).toBe('dark');
        expect(result).not.toBe(initialData); // immutable
    });

    it('should merge objects', () => {
        const result = setDataAtXPath(initialData, '/settings', { notifications: true }, 'merge');
        expect(result.settings).toEqual({ theme: 'light', notifications: true });
    });

    it('should append to arrays', () => {
        const result = setDataAtXPath(initialData, '/users', { name: 'Jane' }, 'append');
        expect(result.users).toHaveLength(2);
        expect(result.users[1]).toEqual({ name: 'Jane' });
    });

    it('should delete properties', () => {
        const result = setDataAtXPath(initialData, '/settings/theme', null, 'delete');
        expect(result.settings.theme).toBeUndefined();
        expect('theme' in result.settings).toBe(false);
    });

    it('should handle array element operations', () => {
        const result = setDataAtXPath(initialData, '/users[0]/name', 'Johnny');
        expect(result.users[0].name).toBe('Johnny');
    });
});

describe('extractXPathParams', () => {
    it('should extract parameters from matching paths', () => {
        const params = extractXPathParams('/users/:id/profile', '/users/123/profile');
        expect(params).toEqual({ id: '123' });
    });

    it('should return empty object for non-matching paths', () => {
        const params = extractXPathParams('/users/:id/profile', '/admin/settings');
        expect(params).toEqual({});
    });

    it('should handle multiple parameters', () => {
        const params = extractXPathParams('/users/:userId/posts/:postId', '/users/123/posts/456');
        expect(params).toEqual({ userId: '123', postId: '456' });
    });
});