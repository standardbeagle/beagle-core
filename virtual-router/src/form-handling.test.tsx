import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  PathProvider, 
  Routes, 
  Route, 
  Form, 
  SubmitButton, 
  FormLink,
  useFormData,
  useSearchParams,
  usePath 
} from './index';

// Test component to display current route state
function RouteStateDisplay() {
  const path = usePath();
  const { search } = useSearchParams();
  const formData = useFormData();

  return (
    <div>
      <div data-testid="current-path">{path}</div>
      <div data-testid="query-params">{JSON.stringify(Object.fromEntries(search))}</div>
      <div data-testid="form-data">{formData ? JSON.stringify(formData) : 'null'}</div>
    </div>
  );
}

test('Form GET submission with simple data', async () => {
  const user = userEvent.setup();

  function SearchForm() {
    return (
      <PathProvider path="/search">
        <Form action="/results" method="GET">
          <input name="q" defaultValue="test query" />
          <input name="category" defaultValue="books" />
          <SubmitButton>Search</SubmitButton>
        </Form>
        <Routes>
          <Route path="/search">
            <div>Search Page</div>
          </Route>
          <Route path="/results">
            <div>Results Page</div>
            <RouteStateDisplay />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<SearchForm />);

  await user.click(screen.getByRole('button', { name: 'Search' }));

  expect(screen.getByText('Results Page')).toBeTruthy();
  expect(screen.getByTestId('current-path').textContent).toBe('/results');
  expect(JSON.parse(screen.getByTestId('query-params').textContent!)).toEqual({
    q: 'test query',
    category: 'books'
  });
});

test('Form POST submission with data in hash', async () => {
  const user = userEvent.setup();

  function ContactForm() {
    return (
      <PathProvider path="/contact">
        <Form action="/submit" method="POST">
          <input name="name" defaultValue="John Doe" />
          <input name="email" defaultValue="john@example.com" />
          <textarea name="message" defaultValue="Hello world" />
          <SubmitButton>Submit</SubmitButton>
        </Form>
        <Routes>
          <Route path="/contact">
            <div>Contact Page</div>
          </Route>
          <Route path="/submit">
            <div>Submission Page</div>
            <RouteStateDisplay />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<ContactForm />);

  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(screen.getByText('Submission Page')).toBeTruthy();
  expect(screen.getByTestId('current-path').textContent).toBe('/submit');
  
  // Form data should be encoded in hash
  const formDataText = screen.getByTestId('form-data').textContent;
  expect(formDataText).not.toBe('null');
  const formData = JSON.parse(formDataText!);
  expect(formData).toEqual({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello world'
  });
});

test('Form with multiple values for same field', async () => {
  const user = userEvent.setup();

  function MultiSelectForm() {
    return (
      <PathProvider path="/filter">
        <Form action="/results" method="GET">
          <input type="checkbox" name="tags" value="javascript" defaultChecked />
          <input type="checkbox" name="tags" value="react" defaultChecked />
          <input type="checkbox" name="tags" value="typescript" />
          <SubmitButton>Filter</SubmitButton>
        </Form>
        <Routes>
          <Route path="/filter">
            <div>Filter Page</div>
          </Route>
          <Route path="/results">
            <div>Results Page</div>
            <RouteStateDisplay />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<MultiSelectForm />);

  // The checkboxes are already defaultChecked, so just submit
  await user.click(screen.getByRole('button', { name: 'Filter' }));

  // Verify through the display component  
  const queryParams = JSON.parse(screen.getByTestId('query-params').textContent!);
  expect(queryParams.tags).toEqual(['javascript', 'react']);
});

test('Custom form submission handler', async () => {
  const user = userEvent.setup();
  const customHandler = vi.fn();

  function CustomForm() {
    return (
      <PathProvider path="/custom">
        <Form onSubmit={customHandler}>
          <input name="field1" defaultValue="value1" />
          <input name="field2" defaultValue="value2" />
          <SubmitButton>Submit</SubmitButton>
        </Form>
        <Routes>
          <Route path="/custom">
            <div>Custom Form</div>
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<CustomForm />);

  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(customHandler).toHaveBeenCalledOnce();
  const [formData, navigate] = customHandler.mock.calls[0];
  
  expect(formData).toEqual({
    field1: 'value1',
    field2: 'value2'
  });
  expect(typeof navigate).toBe('function');
});

test('Form with special characters and encoding', async () => {
  const user = userEvent.setup();

  function EncodingForm() {
    return (
      <PathProvider path="/encode">
        <Form action="/results" method="GET">
          <input name="special" defaultValue="hello world & more" />
          <input name="unicode" defaultValue="café ñoño" />
          <input name="symbols" defaultValue="!@#$%^&*()" />
          <SubmitButton>Submit</SubmitButton>
        </Form>
        <Routes>
          <Route path="/encode">
            <div>Encoding Form</div>
          </Route>
          <Route path="/results">
            <div>Results</div>
            <RouteStateDisplay />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<EncodingForm />);

  await user.click(screen.getByRole('button', { name: 'Submit' }));

  const queryParams = JSON.parse(screen.getByTestId('query-params').textContent!);
  expect(queryParams).toEqual({
    special: 'hello world & more',
    unicode: 'café ñoño',
    symbols: '!@#$%^&*()'
  });
});

test('FormLink component with data', async () => {
  const user = userEvent.setup();

  function FormLinkTest() {
    const formData = {
      search: 'test query',
      category: 'electronics'
    };

    return (
      <PathProvider path="/home">
        <FormLink to="/search" formData={formData} method="GET">
          Search Electronics
        </FormLink>
        <Routes>
          <Route path="/home">
            <div>Home Page</div>
          </Route>
          <Route path="/search">
            <div>Search Results</div>
            <RouteStateDisplay />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<FormLinkTest />);

  await user.click(screen.getByRole('link', { name: 'Search Electronics' }));

  expect(screen.getByText('Search Results')).toBeTruthy();
  expect(JSON.parse(screen.getByTestId('query-params').textContent!)).toEqual({
    search: 'test query',
    category: 'electronics'
  });
});

test('Empty form submission', async () => {
  const user = userEvent.setup();

  function EmptyForm() {
    return (
      <PathProvider path="/empty">
        <Form action="/results" method="GET">
          <input name="optional" defaultValue="" />
          <SubmitButton>Submit</SubmitButton>
        </Form>
        <Routes>
          <Route path="/empty">
            <div>Empty Form</div>
          </Route>
          <Route path="/results">
            <div>Results</div>
            <RouteStateDisplay />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<EmptyForm />);

  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(screen.getByTestId('current-path').textContent).toBe('/results');
  expect(JSON.parse(screen.getByTestId('query-params').textContent!)).toEqual({
    optional: ''
  });
});

test('Form submission with file inputs (mocked)', async () => {
  const user = userEvent.setup();

  function FileUploadForm() {
    return (
      <PathProvider path="/upload">
        <Form action="/process" method="POST">
          <input name="title" defaultValue="My File" />
          <input type="file" name="file" />
          <SubmitButton>Upload</SubmitButton>
        </Form>
        <Routes>
          <Route path="/upload">
            <div>Upload Form</div>
          </Route>
          <Route path="/process">
            <div>Processing</div>
            <RouteStateDisplay />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<FileUploadForm />);

  // Mock file input
  const fileInput = screen.getByRole('textbox', { hidden: true }); // file input
  const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
  
  Object.defineProperty(fileInput, 'files', {
    value: [mockFile],
    writable: false,
  });

  await user.click(screen.getByRole('button', { name: 'Upload' }));

  expect(screen.getByText('Processing')).toBeTruthy();
  
  // File data should be excluded from serialization for POST
  const formDataText = screen.getByTestId('form-data').textContent;
  const formData = JSON.parse(formDataText!);
  expect(formData).toEqual({
    title: 'My File'
    // file should be excluded
  });
});

test('Form with dynamic action attribute', async () => {
  const user = userEvent.setup();

  function DynamicActionForm() {
    return (
      <PathProvider path="/dynamic">
        <Form action="/action/123" method="GET">
          <input name="data" defaultValue="test" />
          <SubmitButton>Submit to 123</SubmitButton>
        </Form>
        <Form action="/action/456" method="GET">
          <input name="data" defaultValue="test" />
          <SubmitButton>Submit to 456</SubmitButton>
        </Form>
        <Routes>
          <Route path="/dynamic">
            <div>Dynamic Forms</div>
          </Route>
          <Route path="/action/:id">
            <div>Action Page</div>
            <RouteStateDisplay />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<DynamicActionForm />);

  await user.click(screen.getByRole('button', { name: 'Submit to 123' }));
  expect(screen.getByTestId('current-path').textContent).toBe('/action/123');

  // Navigate back and try the other form
  await user.click(screen.getByRole('button', { name: 'Submit to 456' }));
  expect(screen.getByTestId('current-path').textContent).toBe('/action/456');
});

test('Form submission prevents default browser behavior', async () => {
  const user = userEvent.setup();
  const mockPreventDefault = vi.fn();

  function PreventDefaultForm() {
    return (
      <PathProvider path="/prevent">
        <Form action="/results" method="GET">
          <input name="test" defaultValue="value" />
          <SubmitButton>Submit</SubmitButton>
        </Form>
        <Routes>
          <Route path="/prevent">
            <div>Prevent Default Form</div>
          </Route>
          <Route path="/results">
            <div>Results</div>
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<PreventDefaultForm />);

  const form = screen.getByRole('button', { name: 'Submit' }).closest('form')!;
  
  // Mock the submit event
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
  Object.defineProperty(submitEvent, 'preventDefault', { value: mockPreventDefault });
  
  fireEvent(form, submitEvent);

  expect(mockPreventDefault).toHaveBeenCalled();
});

test('FormLink with POST method', async () => {
  const user = userEvent.setup();

  function PostLinkTest() {
    const postData = {
      action: 'delete',
      id: '123'
    };

    return (
      <PathProvider path="/admin">
        <FormLink to="/process" formData={postData} method="POST">
          Delete Item
        </FormLink>
        <Routes>
          <Route path="/admin">
            <div>Admin Panel</div>
          </Route>
          <Route path="/process">
            <div>Processing Action</div>
            <RouteStateDisplay />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<PostLinkTest />);

  await user.click(screen.getByRole('link', { name: 'Delete Item' }));

  expect(screen.getByText('Processing Action')).toBeTruthy();
  
  const formDataText = screen.getByTestId('form-data').textContent;
  const formData = JSON.parse(formDataText!);
  expect(formData).toEqual({
    action: 'delete',
    id: '123'
  });
});