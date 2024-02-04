import { test, expect } from "vitest";
import { combineRoutes } from "./combineRoutes";


test('should combine routes /a/b/c d/e/f', () => {
    const newPath = combineRoutes('/a/b/c', 'd/e/f');
    expect(newPath).toBe('/a/b/c/d/e/f');
});

test('should combine routes /a/b/c/* d/e/f', () => {
    const newPath = combineRoutes('/a/b/c/*', 'd/e/f');
    expect(newPath).toBe('/a/b/c/d/e/f');
});
test('should combine routes /a/b/c/* d/e/f/*', () => {
    const newPath = combineRoutes('/a/b/c', 'd/e/f/*');
    expect(newPath).toBe('/a/b/c/d/e/f/*');
});
