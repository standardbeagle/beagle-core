# Getting Started

## Installation

```bash
npm install @standardbeagle/virtual-router
```

## Basic Usage

Wrap your component tree with `PathProvider` and use hooks to read and change the current path.

```tsx
import { PathProvider, Routes, Route, Link, usePath } from '@standardbeagle/virtual-router';

function App() {
  return (
    <PathProvider path="/">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <Routes>
        <Route path="/">
          <HomePage />
        </Route>
        <Route path="/about">
          <AboutPage />
        </Route>
        <Route path="/settings">
          <SettingsPage />
        </Route>
      </Routes>
    </PathProvider>
  );
}
```

## Reading the Current Path

```tsx
import { usePath } from '@standardbeagle/virtual-router';

function Breadcrumb() {
  const path = usePath();
  return <span>Current: {path}</span>;
}
```

## Programmatic Navigation

```tsx
import { useNavigate } from '@standardbeagle/virtual-router';

function LoginButton() {
  const navigate = useNavigate();

  function handleLogin() {
    // ... auth logic
    navigate('/dashboard');
  }

  return <button onClick={handleLogin}>Log In</button>;
}
```

## Dynamic Route Parameters

Use `:param` syntax in route paths to capture segments.

```tsx
import { Routes, Route, useParams } from '@standardbeagle/virtual-router';

function UserRoutes() {
  return (
    <Routes>
      <Route path="/users/:id">
        <UserProfile />
      </Route>
    </Routes>
  );
}

function UserProfile() {
  const { id } = useParams();
  return <h1>User {id}</h1>;
}
```

## Back / Forward Navigation

```tsx
import { useNavigation } from '@standardbeagle/virtual-router';

function NavControls() {
  const { back, forward, hasBack, hasForward } = useNavigation();

  return (
    <div>
      <button onClick={() => back()} disabled={!hasBack}>Back</button>
      <button onClick={() => forward()} disabled={!hasForward}>Forward</button>
    </div>
  );
}
```

## Using with a Parent Router

If your app already uses React Router, Next.js, or TanStack Router, use a [connector](/connectors) to embed virtual-router under a sub-path.
