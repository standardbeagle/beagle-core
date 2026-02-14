import React from 'react';
import type { ComponentProps } from 'react';
import { useContext, forwardRef, Children, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { NavContext, RouteParams, SearchParams, NavigationObject } from './types.ts';
import { combineRoutes } from './state/combineRoutes.ts';
import { matchPath } from './state/matchPath.ts';
import { PathContext, PathDispatchContext, RouteContext } from './provider.tsx';
import { navigate, back, forward } from './state/actions.ts';

export { PathProvider } from './provider.tsx';
export type { ConnectorProps } from './connectors/types';

export function usePath(): string {
    const pathState = useContext(PathContext) as NavContext;
    // Extract just the path portion, without query parameters or hash
    const fullPath = pathState.path;
    const queryIndex = fullPath.indexOf('?');
    const hashIndex = fullPath.indexOf('#');
    
    let endIndex = fullPath.length;
    if (queryIndex !== -1) endIndex = Math.min(endIndex, queryIndex);
    if (hashIndex !== -1) endIndex = Math.min(endIndex, hashIndex);
    
    return fullPath.substring(0, endIndex);
}

export function useHistory(): readonly string[] {
    const pathState = useContext(PathContext);
    if (!pathState) {
        throw new Error('useHistory must be used within a PathProvider');
    }
    return pathState.history;
}

export function useNavigate(): (url: string) => void {
    const dispatch = useContext(PathDispatchContext);
    if (!dispatch) {
        throw new Error('useNavigate must be used within a PathProvider');
    }
    return (path: string) => dispatch(navigate(path));
}

export function useNavigation(): NavigationObject {
    const dispatch = useContext(PathDispatchContext);
    const pathState = useContext(PathContext);
    
    if (!dispatch || !pathState) {
        throw new Error('useNavigation must be used within a PathProvider');
    }
    
    return {
        navigate: (path: string) => dispatch(navigate(path)),
        back: (count: number = 1) => dispatch(back(count)),
        forward: (count: number = 1) => dispatch(forward(count)),
        hasBack: pathState.location < pathState.history.length,
        hasForward: pathState.location > 0,
        path: pathState.path,
        history: pathState.history,
        location: pathState.location,
    };
}

export function useParams(): RouteParams {
    const routeContext = useContext(RouteContext);
    if (!routeContext) {
        throw new Error('useParams must be used within a PathProvider');
    }
    return routeContext.data;
}

export function useSearchParams(): SearchParams {
    const routeContext = useContext(RouteContext);
    if (!routeContext) {
        throw new Error('useSearchParams must be used within a PathProvider');
    }
    const { query, hash } = routeContext;
    return { search: new URLSearchParams(query), hash, query };
}

// Export error handling from ErrorContext
export { useRouteError, useRouteErrors, ErrorProvider } from './ErrorContext';
export { RouterErrorBoundary } from './ErrorBoundary';

// Export form handling components
export { Form, SubmitButton, FormLink, useFormData, useFormSubmission } from './FormHandler';

interface LinkProps extends Omit<ComponentProps<'a'>, 'href' | 'onClick'> {
    to: string;
    children: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ to, children, ...rest }, ref) => {
    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (!event.defaultPrevented) {
            event.preventDefault();
            navigate(to);
        }
    };

    return (
        <a 
            {...rest}
            href={to}
            ref={ref}
            onClick={handleClick}
        >
            {children}
        </a>
    );
});

Link.displayName = 'Link';

interface RoutesProps {
    children?: ReactNode;
}

export function Routes({ children }: RoutesProps): ReactElement {
    const routeContext = useContext(RouteContext);
    const pathContext = useContext(PathContext);
    
    if (!routeContext || !pathContext) {
        throw new Error('Routes must be used within a PathProvider');
    }
    
    const result: RouteRenderData[] = [];
    flattenActiveRoutes(result, children, routeContext.routePath, pathContext.path);

    return (
        <>
            {result.map(({ children, match }, index) => (
                <RouteContext.Provider key={index} value={{ ...match }}>
                    {children}
                </RouteContext.Provider>
            ))}
        </>
    );
}

interface RouteProps {
    path: string;
    children?: ReactNode;
}

export function Route(_: RouteProps): ReactElement {
    return <></>;
}

interface RouteRenderData {
    routePath: string;
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
                routePath: elementRoute,
                children: element.props.children, 
                match 
            });
        }
    });
}
