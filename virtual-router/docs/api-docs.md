# API Reference

## Hooks

### `usePath()`

Returns the current path string (without query or hash).

```tsx
const path = usePath(); // "/users/42"
```

### `useNavigate()`

Returns a function to navigate to a new path.

```tsx
const navigate = useNavigate();
navigate('/dashboard');
```

### `useNavigation()`

Returns a full navigation object with path, history, and navigation controls.

```tsx
const {
  navigate,  // (path: string) => void
  back,      // (count?: number) => void
  forward,   // (count?: number) => void
  hasBack,   // boolean
  hasForward,// boolean
  path,      // string
  history,   // readonly string[]
  location,  // number — steps back from current
} = useNavigation();
```

### `useHistory()`

Returns the navigation history stack.

```tsx
const history = useHistory(); // readonly string[]
```

### `useParams()`

Returns route parameters extracted from the current matched path. Must be inside a `<Route>`.

```tsx
// Route path: "/users/:id"
// Current path: "/users/42"
const { id } = useParams(); // "42"
```

### `useSearchParams()`

Returns query string and hash from the current path.

```tsx
// Current path: "/search?q=hello#results"
const { search, hash, query } = useSearchParams();
search.get('q'); // "hello"
hash;            // "#results"
query;           // "q=hello"
```

### `useRouteError()`

Returns the current route error, if any. Use inside an `ErrorProvider`.

### `useRouteErrors()`

Returns all route errors. Use inside an `ErrorProvider`.

### `useFormData()`

Returns form data state for the current route. Use inside a `Form`.

### `useFormSubmission()`

Returns form submission handler. Use inside a `Form`.

## Components

### `<PathProvider>`

Root provider that manages routing state.

```tsx
<PathProvider
  path="/"               // initial path (required)
  basePath="/widgets"     // prefix stripped from externalPath
  externalPath={pathname} // controlled mode: driven by parent router
  onChange={onNavigate}   // called when internal navigation happens
>
  {children}
</PathProvider>
```

| Prop | Type | Description |
|------|------|-------------|
| `path` | `string` | Initial path. Required. |
| `basePath` | `string` | Base path prefix for connector mode. Default `"/"`. |
| `externalPath` | `string` | When set, path is controlled by an external source. |
| `onChange` | `(path: string) => void` | Fires on internal navigation (not on external sync). |

### `<Routes>`

Matches children `<Route>` components against the current path and renders the first match.

```tsx
<Routes>
  <Route path="/">...</Route>
  <Route path="/about">...</Route>
</Routes>
```

### `<Route>`

Declares a route pattern. Only rendered when inside `<Routes>` and the path matches.

```tsx
<Route path="/users/:id">
  <UserProfile />
</Route>
```

Supports:
- Static segments: `/about`
- Dynamic parameters: `/users/:id`
- Wildcards: `/files/*`

### `<Link>`

Anchor element that navigates on click without a page reload.

```tsx
<Link to="/about" className="nav-link">About</Link>
```

| Prop | Type | Description |
|------|------|-------------|
| `to` | `string` | Target path. Required. |
| ...rest | `<a>` props | All standard anchor props except `href` and `onClick`. |

### `<Form>`, `<SubmitButton>`, `<FormLink>`

Form handling components for managing form state within routes.

### `<ErrorProvider>`, `<RouterErrorBoundary>`

Error boundary components for catching and displaying route-level errors.
