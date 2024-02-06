import { test } from 'vitest';
import { PathProvider, Route, Routes, useParams, usePath, useSearchParams } from './index.tsx';
import { render, renderHook, screen } from '@testing-library/react';


test('default path /', ({ expect }) => {
    const { result } = renderHook( () => usePath());
    expect(result.current).toBe("/");
});

test('empty provider renders', () => {
    render(<PathProvider path=""><></></PathProvider>);
});

test('Provider renders basic element', ({ expect }) => {
    const { getByText } = render(<PathProvider path=""><>Hello</></PathProvider>);
    expect(getByText("Hello")).toBeDefined();
});

test('Provider renders basic element any path', ({ expect }) => {
    const { getByText } = render(<PathProvider path="/test"><>Howdy</></PathProvider>);
    expect(getByText("Howdy")).toBeDefined();
});

test('Route renders star match element any for path /', ({ expect }) => {
    const { getByText } = render(<PathProvider path="/">
            <Routes>
                <Route path="*">Howdy</Route>
            </Routes>
        </PathProvider>);
    expect(getByText("Howdy")).toBeDefined();
});

test('Route renders star match element any for path /page1', ({ expect }) => {
    const { getByText } = render(<PathProvider path="/page1">
            <Routes>
                <Route path="*">Howdy</Route>
            </Routes>
        </PathProvider>);
    expect(getByText("Howdy")).toBeDefined();
});

test('Route renders basic match on a path', ({ expect }) => {
    const { getByText, queryByText } = render(<PathProvider path="/page1">
            <Routes>
                <Route path="/page1">Page1</Route>
                <Route path="/page2">Page2</Route>
            </Routes>
        </PathProvider>);
    expect(getByText("Page1")).toBeDefined();
    expect(queryByText("Page2")).toBeNull();
});

test('Route renders basic match on a path page2', ({ expect }) => {
    const { getByText, queryByText } = render(<PathProvider path="/page2">
            <Routes>
                <Route path="/page1">Page1</Route>
                <Route path="/page2">Page2</Route>
            </Routes>
        </PathProvider>);
    expect(getByText("Page2")).toBeDefined();
    expect(queryByText("Page1")).toBeNull();
});

test('Route requires exact path match', ({ expect }) => {
    const { queryByText } = render(<PathProvider path="/page1/other">
            <Routes>
                <Route path="/page1">Page1</Route>
                <Route path="/page2">Page2</Route>
            </Routes>
        </PathProvider>);
    expect(queryByText("Page1")).toBeNull();
    expect(queryByText("Page2")).toBeNull();
});

test('Multiple routes match', ({ expect }) => {
    const { queryByText } = render(<PathProvider path="/page1/other">
            <Routes>
                <Route path="/page1/*"><div>Page1</div></Route>
                <Route path="/page2"><div>Page2</div></Route>
                <Route path="/page1/other"><div>Other</div></Route>
            </Routes>
        </PathProvider>);
    expect(queryByText("Page1")).toBeDefined();
    expect(queryByText("Page2")).toBeNull();
    expect(queryByText("Other")).toBeDefined();
});

test('Nested Routes', ({ expect }) => {
    const { queryByText } = render(<PathProvider path="/page1/other">
            <Routes>
                <Route path="/page1/*">
                    <div>
                        <div>Page1</div>
                        <Routes>
                            <Route path=":id"><div>IdMatch</div></Route>
                        </Routes>
                    </div>
                </Route>
                <Route path="/page2"><div>Page2</div></Route>
                <Route path="/page1/other"><div>Other</div></Route>
            </Routes>
        </PathProvider>);
    expect(queryByText("Page1")).toBeDefined();
    expect(queryByText("IdMatch")).toBeDefined();
    expect(queryByText("Page2")).toBeNull();
    expect(queryByText("Other")).toBeDefined();
});

const ShowPath = () => {
    const path = usePath();
    return <div>{path}</div>;
}

const ShowParams = () => {
    const params = useParams();
    return <div>{JSON.stringify(params)}</div>;
}

const ShowSearchParams = () => {
    const params = useSearchParams();
    return <div>{JSON.stringify(params)}</div>;
}

test('usePath hook', ({ expect }) => {
    const { getByText } = render(<PathProvider path="/page1/other">
            <ShowPath />
        </PathProvider>);
    expect(getByText("/page1/other")).toBeDefined();
});

test('useParams hook', ({ expect }) => {
    const { getByText } = render(<PathProvider path="/page1/other">
            <Routes>
                <Route path="/page1/:id">
                    <ShowParams />
                </Route>
            </Routes>
        </PathProvider>);
    expect(getByText('{"id":"other"}')).toBeDefined();
});

test('useSearchParams hook', ({ expect }) => {
    const { getByText } = render(<PathProvider path="/page1/other?test=data#sdor">
            <Routes>
                <Route path="/page1/:id">
                    <ShowSearchParams />
                </Route>
            </Routes>
        </PathProvider>);
        screen.debug();
    expect(getByText('{"search":{},"hash":"sdor","query":"test=data"}')).toBeDefined();
});

