import { test, expect } from 'vitest';
import { PathProvider, Route, Routes, usePath } from './index.tsx';
import { render, renderHook } from '@testing-library/react';

test('default path /', () => {
    const { result } = renderHook( () => usePath());
    expect(result.current).toBe("/");
});

test('empty provider renders', () => {
    render(<PathProvider path=""><></></PathProvider>);
});

test('Provider renders basic element', () => {
    const { getByText } = render(<PathProvider path=""><>Hello</></PathProvider>);
    expect(getByText("Hello")).toBeDefined();
});

test('Provider renders basic element any path', () => {
    const { getByText } = render(<PathProvider path="/test"><>Howdy</></PathProvider>);
    expect(getByText("Howdy")).toBeDefined();
});

// test('Provider renders basic element any path', () => {
//     const { getByText } = render(<PathProvider path="/test">
//         <Routes>
//             <Route route="*">Howdy</Route>
//         </Routes>
//         </PathProvider>);
//     expect(getByText("Howdy")).toBeDefined();
// });
