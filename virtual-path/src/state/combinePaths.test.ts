import { test, expect } from "vitest";
import { combinePaths } from "./combinePaths";

test('should combine paths /a/b/c d/e/f', () => { 
    const newPath = combinePaths('/a/b/c', 'd/e/f');
    expect(newPath).toBe('/a/b/c/d/e/f');
});

test('should combine paths /a/b/c ./d/e/f', () => { 
    const newPath = combinePaths('/a/b/c', './d/e/f');
    expect(newPath).toBe('/a/b/c/d/e/f');
});

test('should combine paths  /a/b/c/ d/e/f', () => { 
    const newPath = combinePaths('/a/b/c/', 'd/e/f');
    expect(newPath).toBe('/a/b/c/d/e/f');
});

test('should combine paths  /a/b/c// d/e/f', () => { 
    const newPath = combinePaths('/a/b/c//', 'd/e/f');
    expect(newPath).toBe('/a/b/c/d/e/f');
});

test('should combine paths /a/b/c /d/e/f', () => { 
    const newPath = combinePaths('/a/b/c', '/d/e/f');
    expect(newPath).toBe('/d/e/f');
});

test('should combine paths /a/b/c //d/e/f', () => { 
    const newPath = combinePaths('/a/b/c', '//d/e/f');
    expect(newPath).toBe('/d/e/f');
});

test('should combine paths  a/b/c d/e/f', () => { 
    const newPath = combinePaths('a/b/c', 'd/e/f');
    expect(newPath).toBe('/a/b/c/d/e/f');
});

test('should combine paths  a/b/c?test=3 d/e/f', () => { 
    const newPath = combinePaths('a/b/c?test=3', 'd/e/f');
    expect(newPath).toBe('/a/b/c/d/e/f');
});

test('should combine paths  a/b/c?test=3 d/e/f?oh=yeah', () => { 
    const newPath = combinePaths('a/b/c?test=3', 'd/e/f?oh=yeah');
    expect(newPath).toBe('/a/b/c/d/e/f?oh=yeah');
});

test('should combine paths  a/b/c?test=3 ?oh=yeah', () => { 
    const newPath = combinePaths('a/b/c?test=3', '?oh=yeah');
    expect(newPath).toBe('/a/b/c?oh=yeah');
});

test('should combine paths  a/b/c?test=3 d/e/f', () => { 
    const newPath = combinePaths('a/b/c?test=3', '');
    expect(newPath).toBe('/a/b/c');
});

test('should combine paths  a/b/c ../d/e/f', () => { 
    const newPath = combinePaths('a/b/c', '../d/e/f');
    expect(newPath).toBe('/a/b/d/e/f');
});

test('should combine paths  a/b/c ../../d/e/f', () => { 
    const newPath = combinePaths('a/b/c', '../../d/e/f');
    expect(newPath).toBe('/a/d/e/f');
});

test('should combine paths   ../../d/e/f', () => { 
    const newPath = combinePaths('', '../../d/e/f');
    expect(newPath).toBe('/d/e/f');
});

test('should combine paths ../../d/e/f', () => { 
    const newPath = combinePaths('', '../../d/e/f');
    expect(newPath).toBe('/d/e/f');
});

test('should combine paths test.htm', () => { 
    const newPath = combinePaths('test.htm', '');
    expect(newPath).toBe('/test.htm');
});
