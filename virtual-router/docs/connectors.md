# Framework Connectors

Virtual Router can be embedded inside apps that already use a parent routing framework. Connectors sync the parent router's current path with the virtual router's internal state.

## How It Works

```
Parent Router (owns browser URL)
  └── Connector (bidirectional sync)
        └── PathProvider (controlled mode)
              └── Your components (Routes, Link, usePath, etc.)
```

When the parent URL changes, the connector updates the virtual router's path. When internal navigation happens (via `useNavigate` or `<Link>`), the connector pushes the change back to the parent router.

## React Router v6

```bash
npm install react-router-dom
```

```tsx
import { ReactRouterConnector } from '@standardbeagle/virtual-router/connectors/react-router';

// Inside your React Router route tree:
function WidgetPage() {
  return (
    <ReactRouterConnector basePath="/widgets">
      <Routes>
        <Route path="/">
          <WidgetList />
        </Route>
        <Route path="/:id">
          <WidgetDetail />
        </Route>
      </Routes>
    </ReactRouterConnector>
  );
}
```

Navigating to `/widgets/42` in the browser sets the virtual router path to `/:id` with `id = "42"`. Internal `<Link to="/123">` navigates the browser to `/widgets/123`.

## Next.js (App Router)

```tsx
import { NextRouterConnector } from '@standardbeagle/virtual-router/connectors/nextjs';

// In a Next.js page or layout:
export default function WidgetsPage() {
  return (
    <NextRouterConnector basePath="/widgets">
      <Routes>
        <Route path="/">
          <WidgetList />
        </Route>
        <Route path="/:id">
          <WidgetDetail />
        </Route>
      </Routes>
    </NextRouterConnector>
  );
}
```

Uses `usePathname()` and `useRouter().push()` from `next/navigation`.

## TanStack Router

```tsx
import { TanStackRouterConnector } from '@standardbeagle/virtual-router/connectors/tanstack';

function WidgetRoute() {
  return (
    <TanStackRouterConnector basePath="/widgets">
      <Routes>
        <Route path="/">
          <WidgetList />
        </Route>
        <Route path="/:id">
          <WidgetDetail />
        </Route>
      </Routes>
    </TanStackRouterConnector>
  );
}
```

Uses `useLocation()` and `useNavigate()` from `@tanstack/react-router`.

## ConnectorProps

All connectors accept the same props:

| Prop | Type | Description |
|------|------|-------------|
| `basePath` | `string` | The parent route prefix to strip/prepend. Required. |
| `children` | `ReactNode` | Your virtual router component tree. |
| `path` | `string` | Optional initial path override. Defaults to `"/"`. |

## Manual Controlled Mode

You can skip the connector components and use `PathProvider` directly in controlled mode:

```tsx
import { PathProvider } from '@standardbeagle/virtual-router';

function CustomConnector() {
  const [externalPath, setExternalPath] = useState('/');

  return (
    <PathProvider
      path="/"
      basePath="/widgets"
      externalPath={externalPath}
      onChange={(newPath) => {
        // Push to your router
        setExternalPath(newPath);
      }}
    >
      {/* ... */}
    </PathProvider>
  );
}
```
