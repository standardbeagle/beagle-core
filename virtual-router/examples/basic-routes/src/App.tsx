import "./App.css";
import { Routes, Route, Link } from "@standardbeagle/virtual-router";

function App() {
  return (
    <>
      <h1>Pages</h1>
      <ul className="tabs">
        <li>
          <Link to="/about">page 1</Link>
        </li>
        <li>
          <Link to="/users">page 2</Link>
        </li>
      </ul>
      <h2>Current Page</h2>
      <Routes>
        <Route path="/about">
          <div className="card"><h3>Page 1</h3></div>
        </Route>
        <Route path="/users">
          <div className="card"><h3>Page 2</h3></div>
        </Route>
        <Route path="/">
          <div className="card">Not Found</div>
        </Route>
      </Routes>
    </>
  );
}

export default App;
