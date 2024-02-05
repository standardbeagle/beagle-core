import React from 'react';
import type { PropsWithChildren } from 'react';
import { useContext, forwardRef, Children, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { NavContext } from './types.ts';
import { combineRoutes } from './state/combineRoutes.ts';
import { matchPath } from './state/matchPath.ts';
import { PathContext, PathDispatchContext, RouteContext } from './provider.tsx';
import { navigate, back, forward } from './state/actions.ts';

export { PathProvider } from './provider.tsx';

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

interface RoutesProps {};

export function Routes(props: PropsWithChildren<RoutesProps>) : ReactElement {
    const { children } = props;
    const routeContext = useContext(RouteContext);
    const pathContext = useContext(PathContext);
    const result: RouteRenderData[] = [];
    flattenActiveRoutes(result, children, routeContext.path, pathContext.path);

    return <>{ result.map(({children, match}, index) => {
        return (<RouteContext.Provider key={ index } value={{ ...match }}>{children}</RouteContext.Provider>);
    })}</>
}

interface RouteProps {
    route: string;
};

export function Route(_: PropsWithChildren<RouteProps>): ReactElement {
    return <></>;
}

interface RouteRenderData {
    route?: string;
    children: ReactNode;
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
                children: element.props.children, 
                match 
            });
        }
    });
}
