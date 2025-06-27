import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  PathProvider, 
  Routes, 
  Route, 
  Form, 
  FormLink,
  useSearchParams, 
  useFormData,
  usePath 
} from './index';

// Test component for displaying current state
function EdgeCaseTestComponent() {
  const { search, hash, query } = useSearchParams();
  const formData = useFormData();
  const path = usePath();

  return (
    <div>
      <div data-testid="path">{path}</div>
      <div data-testid="query">{query}</div>
      <div data-testid="hash">{hash}</div>
      <div data-testid="search-params">{JSON.stringify(Object.fromEntries(search))}</div>
      <div data-testid="form-data">{formData ? JSON.stringify(formData) : 'null'}</div>
    </div>
  );
}

test('Extremely long query strings', async () => {
  const user = userEvent.setup();
  
  // Create a very long query string
  const longValue = 'a'.repeat(1000);
  const manyParams = Array.from({ length: 50 }, (_, i) => `param${i}=value${i}`).join('&');
  
  function LongQueryForm() {
    return (
      <PathProvider path="/start">
        <Form action="/results" method="GET">
          <input name="long" defaultValue={longValue} />
          <textarea name="many" defaultValue={manyParams} />
          <button type="submit">Submit</button>
        </Form>
        <Routes>
          <Route path="/start">
            <div>Start Page</div>
          </Route>
          <Route path="/results">
            <div>Results</div>
            <EdgeCaseTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<LongQueryForm />);
  
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(screen.getByText('Results')).toBeTruthy();
  const searchParams = JSON.parse(screen.getByTestId('search-params').textContent!);
  expect(searchParams.long).toBe(longValue);
  expect(searchParams.many).toBe(manyParams);
});

test('Malformed and dangerous query strings', () => {
  const maliciousCases = [
    '/test?xss=<script>alert("xss")</script>',
    '/test?sql=\' OR 1=1--',
    '/test?path=../../../etc/passwd',
    '/test?null=%00',
    '/test?control=%0A%0D%0C%0B',
    '/test?unicode=%uD83D%uDE00', // Invalid unicode sequence
    '/test?percent=%',
    '/test?incomplete=%2',
    '/test?double=%%41',
  ];

  maliciousCases.forEach((path) => {
    const { unmount } = render(
      <PathProvider path={path}>
        <Routes>
          <Route path="/test">
            <EdgeCaseTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );

    // Should handle gracefully without crashing
    const searchElement = screen.queryByTestId('search-params');
    if (searchElement) {
      const searchParams = JSON.parse(searchElement.textContent!);
      
      // Verify XSS content is treated as plain text
      if (path.includes('xss=')) {
        expect(searchParams.xss).toBe('<script>alert("xss")</script>');
      }
    }
    
    unmount();
  });
});

test('Complex nested form data structures', async () => {
  const user = userEvent.setup();

  function NestedDataForm() {
    return (
      <PathProvider path="/complex">
        <Form action="/process" method="POST">
          <input name="user[name]" defaultValue="John" />
          <input name="user[email]" defaultValue="john@test.com" />
          <input name="user[preferences][theme]" defaultValue="dark" />
          <input name="user[preferences][lang]" defaultValue="en" />
          <input name="tags[]" defaultValue="javascript" />
          <input name="tags[]" defaultValue="react" />
          <input name="metadata[created][date]" defaultValue="2023-01-01" />
          <input name="metadata[created][by]" defaultValue="admin" />
          <button type="submit">Submit Complex</button>
        </Form>
        <Routes>
          <Route path="/complex">
            <div>Complex Form</div>
          </Route>
          <Route path="/process">
            <div>Processing</div>
            <EdgeCaseTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<NestedDataForm />);
  
  await user.click(screen.getByRole('button', { name: 'Submit Complex' }));
  
  const formDataText = screen.getByTestId('form-data').textContent;
  const formData = JSON.parse(formDataText!);
  
  expect(formData).toEqual({
    'user[name]': 'John',
    'user[email]': 'john@test.com',
    'user[preferences][theme]': 'dark',
    'user[preferences][lang]': 'en',
    'tags[]': ['javascript', 'react'],
    'metadata[created][date]': '2023-01-01',
    'metadata[created][by]': 'admin'
  });
});

test('Form with massive file uploads and mixed data', async () => {
  const user = userEvent.setup();

  function MassiveUploadForm() {
    return (
      <PathProvider path="/upload">
        <Form action="/process" method="POST">
          <input name="title" defaultValue="Mass Upload" />
          <input type="file" name="files" multiple />
          <input name="category" defaultValue="documents" />
          <textarea name="description" defaultValue="Multiple large files" />
          <button type="submit">Upload All</button>
        </Form>
        <Routes>
          <Route path="/upload">
            <div>Upload Form</div>
          </Route>
          <Route path="/process">
            <div>Processing Upload</div>
            <EdgeCaseTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<MassiveUploadForm />);
  
  // Mock multiple large files
  const fileInput = screen.getByDisplayValue('');
  const largeFiles = Array.from({ length: 10 }, (_, i) => 
    new File([new ArrayBuffer(1024 * 1024)], `large-file-${i}.bin`, { type: 'application/octet-stream' })
  );
  
  Object.defineProperty(fileInput, 'files', {
    value: largeFiles,
    writable: false,
  });

  await user.click(screen.getByRole('button', { name: 'Upload All' }));
  
  expect(screen.getByText('Processing Upload')).toBeTruthy();
  
  // Files should be excluded from serialization
  const formDataText = screen.getByTestId('form-data').textContent;
  const formData = JSON.parse(formDataText!);
  expect(formData).toEqual({
    title: 'Mass Upload',
    category: 'documents',
    description: 'Multiple large files'
    // files should be excluded
  });
});

test('Concurrent form submissions and navigation', async () => {
  const user = userEvent.setup();
  const submission1Handler = vi.fn();
  const submission2Handler = vi.fn();

  function ConcurrentFormsTest() {
    return (
      <PathProvider path="/concurrent">
        <Form onSubmit={submission1Handler}>
          <input name="form" defaultValue="1" />
          <button type="submit">Submit 1</button>
        </Form>
        <Form onSubmit={submission2Handler}>
          <input name="form" defaultValue="2" />
          <button type="submit">Submit 2</button>
        </Form>
        <Routes>
          <Route path="/concurrent">
            <div>Concurrent Forms</div>
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<ConcurrentFormsTest />);
  
  // Simulate rapid concurrent submissions
  const submit1 = user.click(screen.getByRole('button', { name: 'Submit 1' }));
  const submit2 = user.click(screen.getByRole('button', { name: 'Submit 2' }));
  
  await Promise.all([submit1, submit2]);
  
  expect(submission1Handler).toHaveBeenCalledOnce();
  expect(submission2Handler).toHaveBeenCalledOnce();
  
  const [formData1] = submission1Handler.mock.calls[0];
  const [formData2] = submission2Handler.mock.calls[0];
  
  expect(formData1).toEqual({ form: '1' });
  expect(formData2).toEqual({ form: '2' });
});

test('Query string and hash collision handling', () => {
  const collisionCases = [
    {
      name: 'Hash contains query-like syntax',
      path: '/test?real=param#fake=notparam&another=fake',
      expectedQuery: { real: 'param' },
      expectedHash: 'fake=notparam&another=fake'
    },
    {
      name: 'Query contains hash-like syntax',
      path: '/test?param=value%23hash&other=data',
      expectedQuery: { param: 'value#hash', other: 'data' },
      expectedHash: ''
    },
    {
      name: 'Multiple hashes in URL',
      path: '/test?query=data#first#second#third',
      expectedQuery: { query: 'data' },
      expectedHash: 'first#second#third'
    }
  ];

  collisionCases.forEach(({ name, path, expectedQuery, expectedHash }) => {
    const { unmount } = render(
      <PathProvider path={path}>
        <Routes>
          <Route path="/test">
            <EdgeCaseTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );

    const actualQuery = JSON.parse(screen.getByTestId('search-params').textContent!);
    const actualHash = screen.getByTestId('hash').textContent;

    expect(actualQuery).toEqual(expectedQuery);
    expect(actualHash).toBe(expectedHash);
    
    unmount();
  });
});

test('Form data encoding/decoding round trip', async () => {
  const user = userEvent.setup();

  const complexData = {
    'special chars': '!@#$%^&*()_+-=[]{}|;:,.<>?',
    'unicode': 'café ñoño 中文 🚀',
    'newlines': 'line1\nline2\r\nline3',
    'quotes': '"single\' and "double" quotes',
    'json-like': '{"nested":"value","array":[1,2,3]}',
    'encoded': '%20%21%22%23',
    'control': '\t\n\r\f\b'
  };

  function EncodingRoundTripForm() {
    return (
      <PathProvider path="/encode-test">
        <FormLink to="/decode-test" formData={complexData} method="POST">
          Submit Complex Data
        </FormLink>
        <Routes>
          <Route path="/encode-test">
            <div>Encoding Test</div>
          </Route>
          <Route path="/decode-test">
            <div>Decoding Test</div>
            <EdgeCaseTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<EncodingRoundTripForm />);
  
  await user.click(screen.getByRole('link', { name: 'Submit Complex Data' }));
  
  expect(screen.getByText('Decoding Test')).toBeTruthy();
  
  const decodedData = JSON.parse(screen.getByTestId('form-data').textContent!);
  
  // Verify all complex data survived the encoding/decoding round trip
  expect(decodedData).toEqual(complexData);
});

test('Memory stress test with rapid navigation', async () => {
  const user = userEvent.setup();

  function StressTestNavigation() {
    return (
      <PathProvider path="/stress/0">
        <nav>
          {Array.from({ length: 100 }, (_, i) => (
            <FormLink 
              key={i}
              to={`/stress/${i}`} 
              formData={{ index: i.toString(), data: `stress-test-${i}` }}
              method="GET"
            >
              Link {i}
            </FormLink>
          ))}
        </nav>
        <Routes>
          <Route path="/stress/:id">
            <EdgeCaseTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<StressTestNavigation />);
  
  // Rapidly navigate through many links
  for (let i = 0; i < 10; i++) {
    await user.click(screen.getByRole('link', { name: `Link ${i * 10}` }));
    
    const params = JSON.parse(screen.getByTestId('search-params').textContent!);
    expect(params).toEqual({ 
      index: (i * 10).toString(), 
      data: `stress-test-${i * 10}` 
    });
  }
});

test('Edge case in form data with null and undefined values', async () => {
  const user = userEvent.setup();

  function NullUndefinedForm() {
    return (
      <PathProvider path="/null-test">
        <Form action="/results" method="POST">
          <input name="empty" defaultValue="" />
          <input name="space" defaultValue=" " />
          <input name="null-string" defaultValue="null" />
          <input name="undefined-string" defaultValue="undefined" />
          <input name="zero" defaultValue="0" />
          <input name="false" defaultValue="false" />
          <button type="submit">Submit Nullish</button>
        </Form>
        <Routes>
          <Route path="/null-test">
            <div>Null Test</div>
          </Route>
          <Route path="/results">
            <div>Results</div>
            <EdgeCaseTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<NullUndefinedForm />);
  
  await user.click(screen.getByRole('button', { name: 'Submit Nullish' }));
  
  const formData = JSON.parse(screen.getByTestId('form-data').textContent!);
  
  expect(formData).toEqual({
    empty: '',
    space: ' ',
    'null-string': 'null',
    'undefined-string': 'undefined',
    zero: '0',
    false: 'false'
  });
});

test('Maximum URL length handling', async () => {
  const user = userEvent.setup();
  
  // Create data that would result in a very long URL
  const longKey = 'a'.repeat(100);
  const longValue = 'b'.repeat(1000);

  function MaxLengthForm() {
    return (
      <PathProvider path="/max-length">
        <Form action="/results" method="GET">
          <input name={longKey} defaultValue={longValue} />
          <button type="submit">Submit Long</button>
        </Form>
        <Routes>
          <Route path="/max-length">
            <div>Max Length Test</div>
          </Route>
          <Route path="/results">
            <div>Results</div>
            <EdgeCaseTestComponent />
          </Route>
        </Routes>
      </PathProvider>
    );
  }

  render(<MaxLengthForm />);
  
  await user.click(screen.getByRole('button', { name: 'Submit Long' }));
  
  // Should handle gracefully even with very long URLs
  expect(screen.getByText('Results')).toBeTruthy();
  const searchParams = JSON.parse(screen.getByTestId('search-params').textContent!);
  expect(searchParams[longKey]).toBe(longValue);
});