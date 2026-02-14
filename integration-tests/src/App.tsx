import { PathProvider, Routes, Route, Link, usePath } from '@standardbeagle/virtual-router';
import { DataProvider, useData, useXPath } from '@standardbeagle/data-router';

function CurrentPath() {
  const path = usePath();
  return <span data-testid="current-path">{path}</span>;
}

function CurrentData() {
  const xpath = useXPath();
  const data = useData();
  return (
    <div data-testid="current-data">
      <span data-testid="current-xpath">{xpath}</span>
      <span data-testid="data-content">{JSON.stringify(data)}</span>
    </div>
  );
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

const initialData = { message: 'hello' };

export default function App() {
  return (
    <PathProvider path="/">
      <DataProvider initialData={initialData}>
        <nav>
          <CurrentPath />
          <CurrentData />
        </nav>
        <Routes>
          <Route path="/">
            <HomePage />
          </Route>
          <Route path="/about">
            <AboutPage />
          </Route>
        </Routes>
      </DataProvider>
    </PathProvider>
  );
}
