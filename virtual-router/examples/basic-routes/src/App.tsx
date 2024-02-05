import "./App.css";
import { Routes, Route, Link } from "@standardbeagle/virtual-router";

function App() {
  return (
    <>
      <ul>
        <li>
          <Link to="/about">page 1</Link>
        </li>
        <li>
          <Link to="/users">page 2</Link>
        </li>
      </ul>
      <h1>Pages</h1>
      <Routes>
        <Route route="/about">
          <div className="card">Page 1</div>
        </Route>
        <Route route="/users">
          <div className="card">Page 2</div>
        </Route>
        <Route route="/">
          <div className="card">Not Found</div>
        </Route>
      </Routes>
    </>
  );
}

export default App;
