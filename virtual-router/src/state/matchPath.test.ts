import { test, expect } from "vitest";
import { matchPath } from "./matchPath.ts";


test('should match path /a/b/c with /a/b/c', () => {
    const match = matchPath('/a/b/c', '/a/b/c');
    expect(match.isMatch).toBe(true);
    expect(match.data).toEqual({});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('/a/b/c');
});

test('should match path /a/b/c with /a/b/c?one=two&three=4', () => {
    const match = matchPath('/a/b/c', '/a/b/c?one=two&three=4');
    expect(match.isMatch).toBe(true);
    expect(match.data).toEqual({});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('one=two&three=4');
    expect(match.hash).toBe('');
    expect(match.path).toBe('/a/b/c');
});

test('should not match path /a/b with /a/b/c', () => {
    const match = matchPath('/a/b/c', '/a/b');
    expect(match.isMatch).toBe(false);
    expect(match.data).toEqual({});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('');
});

test('should not match path /b/b/c with /a/b/c', () => {
    const match = matchPath('/a/b/c', '/b/b/c');
    expect(match.isMatch).toBe(false);
    expect(match.data).toEqual({});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('');
});

test('should match path /a with /a', () => {
    const match = matchPath('/a', '/a');
    expect(match.isMatch).toBe(true);
    expect(match.data).toEqual({});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('/a');
});

test('should match path /a/b with /a/b', () => {
    const match = matchPath('/a/b', '/a/b');
    expect(match.isMatch).toBe(true);
    expect(match.data).toEqual({});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('/a/b');
});

test('should match path /a/* with /a/b', () => {
    const match = matchPath('/a/b', '/a/b');
    expect(match.isMatch).toBe(true);
    expect(match.data).toEqual({});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('/a/b');
});

test('should match path /* with /a/b/c', () => {
    const match = matchPath('/*', '/a/b/c');
    expect(match.isMatch).toBe(true);
    expect(match.data).toEqual({});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('a/b/c');
});

test('should match path /* with /a', () => {
    const match = matchPath('/*', '/a');
    expect(match.isMatch).toBe(true);
    expect(match.data).toEqual({});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('a');
});

test('should match path /:id with /a', () => {
    const match = matchPath('/:id', '/a');
    expect(match.isMatch).toBe(true);
    expect(match.data).toEqual({id: 'a'});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('/a');
});

test('should not match path /:id/b with /a', () => {
    const match = matchPath('/:id/b', '/a');
    expect(match.isMatch).toBe(false);
    expect(match.data).toEqual({});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('');
});

test('should not match path /:id/34d with /a', () => {
    const match = matchPath('/:id/34d', '/a');
    expect(match.isMatch).toBe(false);
    expect(match.data).toEqual({});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('');
});

test('should not match path /:id/:value with /a/b', () => {
    const match = matchPath('/:id/:value', '/a/b');
    expect(match.isMatch).toBe(true);
    expect(match.data).toEqual({id: 'a', value: 'b'});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('/a/b');
});

test('should match path /:id/34d with /a/34d', () => {
    const match = matchPath('/:id/34d', '/a/34d');
    expect(match.isMatch).toBe(true);
    expect(match.data).toEqual({id: 'a'});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('/a/34d');
});

test('should match path /:id/34d with /34829-s8d94j-s8sdf93/34d', () => {
    const match = matchPath('/:id/34d', '/34829-s8d94j-s8sdf93/34d');
    expect(match.isMatch).toBe(true);
    expect(match.data).toEqual({id: '34829-s8d94j-s8sdf93'});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('');
    expect(match.hash).toBe('');
    expect(match.path).toBe('/34829-s8d94j-s8sdf93/34d');
});

test('should match path /:id/34d with /34829-s8d94j-s8sdf93/34d?test=1#haha', () => {
    const match = matchPath('/:id/34d', '/34829-s8d94j-s8sdf93/34d?test=1#haha');
    expect(match.isMatch).toBe(true);
    expect(match.data).toEqual({id: '34829-s8d94j-s8sdf93'});
    expect(match.remainer).toBe('');
    expect(match.query).toBe('test=1');
    expect(match.hash).toBe('haha');
    expect(match.path).toBe('/34829-s8d94j-s8sdf93/34d');
});