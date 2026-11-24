import { PathProvider, Routes, Route, Link, usePath } from '@standardbeagle/virtual-router';

function CurrentPath() {
  const path = usePath();
  return <span data-testid="current-path">{path}</span>;
}

function HomePage() {
  return (
    <div>
      <h2>Home</h2>
      <Link to="/about">Go to About</Link>
    </div>
  );
}

function AboutPage() {
  return (
    <div>
      <h2>About</h2>
      <Link to="/">Go to Home</Link>
    </div>
  );
}

export default function App() {
  return (
    <PathProvider path="/">
      <nav>
        <CurrentPath />
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
