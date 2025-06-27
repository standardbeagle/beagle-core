import { test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  PathProvider, 
  Routes, 
  Route, 
  Link, 
  usePath, 
  useParams, 
  useSearchParams,
  useHistory,
  useNavigation 
} from './index';

// Complex app component for integration testing
function ComplexApp() {
  return (
    <PathProvider path="/home">
      <nav>
        <Link to="/home">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/products/electronics">Electronics</Link>
        <Link to="/products/electronics/phones">Phones</Link>
        <Link to="/user/123">User Profile</Link>
        <Link to="/search?q=test&category=all#results">Search</Link>
      </nav>
      
      <Routes>
        <Route path="/home">
          <HomePage />
        </Route>
        <Route path="/products/*">
          <ProductsLayout />
        </Route>
        <Route path="/user/:userId">
          <UserProfile />
        </Route>
        <Route path="/search">
          <SearchPage />
        </Route>
      </Routes>
      
      <DebugInfo />
    </PathProvider>
  );
}

function HomePage() {
  return <div>Home Page</div>;
}

function ProductsLayout() {
  const path = usePath();
  
  return (
    <div>
      <h1>Products Layout</h1>
      <nav>
        <Link to="/products">All Products</Link>
        <Link to="/products/electronics">Electronics</Link>
        <Link to="/products/clothing">Clothing</Link>
      </nav>
      
      <Routes>
        <Route path="/products">
          <div>All Products List</div>
        </Route>
        <Route path="/products/:category">
          <ProductCategory />
        </Route>
        <Route path="/products/:category/:subcategory">
          <ProductSubcategory />
        </Route>
      </Routes>
    </div>
  );
}

function ProductCategory() {
  const { category } = useParams();
  return <div>Category: {category}</div>;
}

function ProductSubcategory() {
  const { category, subcategory } = useParams();
  return <div>Subcategory: {category} / {subcategory}</div>;
}

function UserProfile() {
  const { userId } = useParams();
  const navigation = useNavigation();
  
  return (
    <div>
      <h1>User Profile: {userId}</h1>
      <button onClick={() => navigation.navigate('/user/456')}>
        Go to User 456
      </button>
      <button onClick={() => navigation.back()}>
        Go Back
      </button>
    </div>
  );
}

function SearchPage() {
  const { search, hash } = useSearchParams();
  const query = search.get('q');
  const category = search.get('category');
  
  return (
    <div>
      <h1>Search Results</h1>
      <p>Query: {query}</p>
      <p>Category: {category}</p>
      <p>Hash: {hash}</p>
    </div>
  );
}

function DebugInfo() {
  const path = usePath();
  const history = useHistory();
  const navigation = useNavigation();
  
  return (
    <div data-testid="debug">
      <div data-testid="current-path">Current: {path}</div>
      <div data-testid="history">History: {JSON.stringify(history)}</div>
      <div data-testid="location">Location: {navigation.location}</div>
      <div data-testid="has-back">Has Back: {String(navigation.hasBack)}</div>
    </div>
  );
}

test('Complex navigation flow', async () => {
  const user = userEvent.setup();
  render(<ComplexApp />);
  
  // Initial state
  expect(screen.getByText('Home Page')).toBeTruthy();
  expect(screen.getByTestId('current-path').textContent!).toContain('Current: /home');
  expect(screen.getByTestId('history').textContent!).toContain('History: []');
  
  // Navigate to products
  await user.click(screen.getByRole('link', { name: 'Products' }));
  expect(screen.getByText('Products Layout')).toBeTruthy();
  expect(screen.getByText('All Products List')).toBeTruthy();
  expect(screen.getByTestId('current-path').textContent!).toContain('Current: /products');
  expect(screen.getByTestId('history').textContent!).toContain('History: ["/home"]');
  
  // Navigate to electronics subcategory
  await user.click(screen.getByRole('link', { name: 'Electronics' }));
  expect(screen.getByText('Category: electronics')).toBeTruthy();
  expect(screen.getByTestId('current-path').textContent!).toContain('Current: /products/electronics');
  
  // Navigate to phones
  await user.click(screen.getAllByRole('link', { name: 'Phones' })[0]);
  expect(screen.getByText('Subcategory: electronics / phones')).toBeTruthy();
  expect(screen.getByTestId('history').textContent!).toContain('["/products/electronics","/products","/home"]');
});

test('Parameter extraction and navigation', async () => {
  const user = userEvent.setup();
  render(<ComplexApp />);
  
  // Navigate to user profile
  await user.click(screen.getByRole('link', { name: 'User Profile' }));
  expect(screen.getByText('User Profile: 123')).toBeTruthy();
  
  // Navigate to another user using button
  await user.click(screen.getByRole('button', { name: 'Go to User 456' }));
  expect(screen.getByText('User Profile: 456')).toBeTruthy();
  
  // Test back navigation
  await user.click(screen.getByRole('button', { name: 'Go Back' }));
  expect(screen.getByText('User Profile: 123')).toBeTruthy();
});

test('Query string and hash handling', async () => {
  const user = userEvent.setup();
  render(<ComplexApp />);
  
  // Navigate to search with query params
  await user.click(screen.getByRole('link', { name: 'Search' }));
  expect(screen.getByText('Search Results')).toBeTruthy();
  expect(screen.getByText('Query: test')).toBeTruthy();
  expect(screen.getByText('Category: all')).toBeTruthy();
  expect(screen.getByText('Hash: #results')).toBeTruthy();
});

test('History management with back and forward', async () => {
  const user = userEvent.setup();
  
  function HistoryApp() {
    const navigation = useNavigation();
    
    return (
      <PathProvider path="/">
        <nav>
          <Link to="/page1">Page 1</Link>
          <Link to="/page2">Page 2</Link>
          <Link to="/page3">Page 3</Link>
          <button onClick={() => navigation.back()}>Back</button>
          <button onClick={() => navigation.forward()}>Forward</button>
          <button onClick={() => navigation.back(2)}>Back 2</button>
        </nav>
        
        <Routes>
          <Route path="/">Home</Route>
          <Route path="/page1">Page 1</Route>
          <Route path="/page2">Page 2</Route>
          <Route path="/page3">Page 3</Route>
        </Routes>
        
        <DebugInfo />
      </PathProvider>
    );
  }
  
  render(<HistoryApp />);
  
  // Build history
  await user.click(screen.getByRole('link', { name: 'Page 1' }));
  await user.click(screen.getByRole('link', { name: 'Page 2' }));
  await user.click(screen.getByRole('link', { name: 'Page 3' }));
  
  expect(screen.getByText('Page 3')).toBeTruthy();
  expect(screen.getByTestId('has-back').textContent!).toContain('Has Back: true');
  
  // Go back
  await user.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByText('Page 2')).toBeTruthy();
  
  // Go back 2 steps
  await user.click(screen.getByRole('button', { name: 'Back 2' }));
  expect(screen.getByText('Home')).toBeTruthy();
  
  // Go forward
  await user.click(screen.getByRole('button', { name: 'Forward' }));
  expect(screen.getByText('Page 1')).toBeTruthy();
});

test('Nested routes with multiple providers', async () => {
  const user = userEvent.setup();
  
  function NestedApp() {
    return (
      <PathProvider path="/main">
        <div>
          <h1>Main App</h1>
          <Link to="/main/feature">Go to Feature</Link>
          
          <Routes>
            <Route path="/main">
              <div>Main Home</div>
            </Route>
            <Route path="/main/feature">
              <div>
                <h2>Feature Section</h2>
                <PathProvider path="/sub">
                  <div>
                    <h3>Sub Router</h3>
                    <Link to="/sub/item">Sub Item</Link>
                    
                    <Routes>
                      <Route path="/sub">Sub Home</Route>
                      <Route path="/sub/item">Sub Item Content</Route>
                    </Routes>
                    
                    <DebugInfo />
                  </div>
                </PathProvider>
              </div>
            </Route>
          </Routes>
          
          <div data-testid="main-debug">
            <DebugInfo />
          </div>
        </div>
      </PathProvider>
    );
  }
  
  render(<NestedApp />);
  
  // Check initial state
  expect(screen.getByText('Main Home')).toBeTruthy();
  
  // Navigate in main router
  await user.click(screen.getByRole('link', { name: 'Go to Feature' }));
  expect(screen.getByText('Feature Section')).toBeTruthy();
  expect(screen.getByText('Sub Home')).toBeTruthy();
  
  // Navigate in sub router
  await user.click(screen.getByRole('link', { name: 'Sub Item' }));
  expect(screen.getByText('Sub Item Content')).toBeTruthy();
  
  // Check that routers are independent
  const mainDebug = screen.getByTestId('main-debug').querySelector('[data-testid="current-path"]');
  const subDebug = screen.getAllByTestId('current-path')[0];
  
  expect(mainDebug?.textContent!).toContain('Current: /main/feature');
  expect(subDebug.textContent!).toContain('Current: /sub/item');
});

test('Route matching precedence', () => {
  render(
    <PathProvider path="/users/123/edit">
      <Routes>
        <Route path="/users/*">
          <div>Wildcard Match</div>
        </Route>
        <Route path="/users/:id">
          <div>Param Match</div>
        </Route>
        <Route path="/users/:id/edit">
          <div>Exact Match</div>
        </Route>
      </Routes>
    </PathProvider>
  );
  
  // All matching routes should render
  expect(screen.getByText('Wildcard Match')).toBeTruthy();
  expect(screen.getByText('Param Match')).toBeTruthy();
  expect(screen.getByText('Exact Match')).toBeTruthy();
});

test('Empty path navigation', async () => {
  const user = userEvent.setup();
  
  function EmptyPathApp() {
    const navigation = useNavigation();
    
    return (
      <PathProvider path="/start">
        <button onClick={() => navigation.navigate('')}>Empty Navigate</button>
        <button onClick={() => navigation.navigate('/')}>Root Navigate</button>
        <DebugInfo />
      </PathProvider>
    );
  }
  
  render(<EmptyPathApp />);
  
  expect(screen.getByTestId('current-path').textContent!).toContain('Current: /start');
  
  // Empty string navigation should not change path
  await user.click(screen.getByRole('button', { name: 'Empty Navigate' }));
  expect(screen.getByTestId('current-path').textContent!).toContain('Current: /start');
  
  // Root navigation should go to /
  await user.click(screen.getByRole('button', { name: 'Root Navigate' }));
  expect(screen.getByTestId('current-path').textContent!).toContain('Current: /');
});

test('Complex relative navigation', async () => {
  const user = userEvent.setup();
  
  function RelativeNavApp() {
    const navigation = useNavigation();
    
    return (
      <PathProvider path="/a/b/c">
        <button onClick={() => navigation.navigate('..')}>Up One</button>
        <button onClick={() => navigation.navigate('../..')}>Up Two</button>
        <button onClick={() => navigation.navigate('./d')}>Sibling</button>
        <button onClick={() => navigation.navigate('e/f')}>Nested</button>
        <DebugInfo />
      </PathProvider>
    );
  }
  
  render(<RelativeNavApp />);
  
  expect(screen.getByTestId('current-path').textContent!).toContain('Current: /a/b/c');
  
  // Navigate up one level
  await user.click(screen.getByRole('button', { name: 'Up One' }));
  expect(screen.getByTestId('current-path').textContent!).toContain('Current: /a/b');
  
  // Navigate up two more levels (from /a/b)
  await user.click(screen.getByRole('button', { name: 'Up Two' }));
  expect(screen.getByTestId('current-path').textContent!).toContain('Current: /');
  
  // Navigate to sibling (from /)
  await user.click(screen.getByRole('button', { name: 'Sibling' }));
  expect(screen.getByTestId('current-path').textContent!).toContain('Current: /d');
  
  // Navigate nested (from /d)
  await user.click(screen.getByRole('button', { name: 'Nested' }));
  expect(screen.getByTestId('current-path').textContent!).toContain('Current: /d/e/f');
});