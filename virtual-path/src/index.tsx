import React from 'react';
import { useContext, forwardRef, ReactElement, ReactNode, Children, isValidElement } from 'react';
import { NavContext } from './types';
import { combineRoutes } from './state/combineRoutes';
import { matchPath } from './state/matchPath';
import { PathContext, PathDispatchContext, RouteContext } from './provider';
import { navigate, back, forward } from './state/actions';

export { PathProvider } from './provider';

export function usePath(): string {
    const pathState = useContext(PathContext) as NavContext;
    return pathState.path;
}

export function useHistory(): string[] {
    const pathState = useContext(PathContext) as NavContext;
    return pathState.history;
}

export function useNavigate(): (url: string) => void {
    const dispatch = useContext(PathDispatchContext) as (x: any) => void;
    return (path: string) => dispatch(navigate(path));
}

export function useNavigation(): any {
    const dispatch = useContext(PathDispatchContext) as (x: any) => void;
    const pathState = useContext(PathContext) as NavContext;
    return {
        navigate: (path: string) => dispatch(navigate(path)),
        back: (count: number = 1) => dispatch(back(count)),
        forward: (count: number = 1) => dispatch(forward(count)),
        hasBack: pathState.location < pathState.history.length - 1,
        ...pathState
    };
}

export function useParams(): any {
    return useContext(RouteContext).data;
}

export function useSearchParams(): any {
    var { query, hash } = useContext(RouteContext);
    return { search: new URLSearchParams(query), hash };
}

export function useRouteError(): any {
    return {};
}

export const Link = forwardRef((props: any, ref: any) => {
    const { to, children, ...rest } = props as { to: string, children: ReactElement[] };
    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (!event.defaultPrevented) event.preventDefault();
        navigate(to);
    }

    return <a {...rest}
        href={to}
        ref={ref as any}
        onClick={handleClick} >
        {children}
    </a>;
});

export function Routes({ children }: { children: ReactNode }) {
    const routeContext = useContext(RouteContext);
    const pathContext = useContext(PathContext);
    const result: RouteRenderData[] = [];
    flattenActiveRoutes(result, children, routeContext.path, pathContext.path);

    return <>{ result.map(({element, match}, index) => {
        return (<RouteContext.Provider key={ index } value={{ ...match }}>{element}</RouteContext.Provider>);
    })}</>
}

export function Route(): ReactElement {
    return <></>;
}

interface RouteRenderData {
    route?: string;
    element: ReactNode;
    match: any;
}

function flattenActiveRoutes(result: RouteRenderData[], children: ReactNode, base: string, path: string) {
    Children.forEach(children, (element) => {
        if (!isValidElement(element)) return;

        if (element.type === React.Fragment) {
            flattenActiveRoutes(result, element.props.children, base, path);
            return;
        }

        const elementRoute = combineRoutes(base, element.props.path);
        const match = matchPath(elementRoute, path);
        if (match.isMatch) {
            result.push({ 
                element: element.props.element, 
                match 
            });
        }
    });
}
