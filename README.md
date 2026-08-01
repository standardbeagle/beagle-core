# beagle-core

Virtual Router — memory-only, hook-based routing for React.

## Installation

```bash
npm install @standardbeagle/virtual-router
```

## Quick Start

Wrap your component tree with `PathProvider` and use React hooks to navigate:

```tsx
import { PathProvider, Routes, Route, Link, usePath, useNavigate } from '@standardbeagle/virtual-router';

function App() {
  return (
    <PathProvider path="/">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/">
          <HomePage />
        </Route>
        <Route path="/about">
          <AboutPage />
        </Route>
      </Routes>
    </PathProvider>
  );
}

function HomePage() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/about')}>Go to About</button>;
}

function AboutPage() {
  const path = usePath();
  return <div>Current path: {path}</div>;
}
```

## Features

- **Memory-only routing**: Routes live entirely in component state—no browser URL changes
- **Hook-based API**: `usePath`, `useNavigate`, `useParams`, `useSearchParams`, `useNavigation`
- **Framework connectors**: Embed inside React Router, Next.js, or TanStack Router apps
- **Full navigation history**: Built-in back/forward navigation with history tracking

## Documentation

Full documentation is available at [https://dev.standardbeagle.com/beagle-core/](https://dev.standardbeagle.com/beagle-core/)

## License

MIT
