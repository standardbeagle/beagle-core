import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Routes,
  Route,
  Form,
  SubmitButton,
  FormLink,
  usePath,
  useSearchParams,
  useFormData,
  useFormSubmission,
} from '@standardbeagle/virtual-router';
import { renderWithVirtualRouter } from '../test-utils';

function PathDisplay() {
  const path = usePath();
  return <span data-testid="path">{path}</span>;
}

function SearchDisplay() {
  const { search, query } = useSearchParams();
  return (
    <div>
      <span data-testid="query">{query}</span>
      <span data-testid="search-entries">
        {JSON.stringify(Object.fromEntries(search.entries()))}
      </span>
    </div>
  );
}

function FormDataDisplay() {
  const formData = useFormData();
  return (
    <span data-testid="form-data">
      {formData ? JSON.stringify(formData) : 'null'}
    </span>
  );
}

function SubmissionStateDisplay() {
  const state = useFormSubmission();
  return (
    <div>
      <span data-testid="is-submitting">{String(state.isSubmitting)}</span>
      <span data-testid="last-submission">
        {state.lastSubmission ? JSON.stringify(state.lastSubmission) : 'null'}
      </span>
      <span data-testid="submission-error">
        {state.error ? state.error.message : 'null'}
      </span>
    </div>
  );
}

describe('Virtual Router: Form Handling', () => {
  describe('Form component', () => {
    it('submits GET form data and navigates with query string', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <Form action="/results" method="GET">
            <input name="q" defaultValue="react" data-testid="input-q" />
            <SubmitButton>Search</SubmitButton>
          </Form>
          <PathDisplay />
          <SearchDisplay />
        </div>,
      );

      await user.click(screen.getByRole('button', { name: 'Search' }));

      expect(screen.getByTestId('path')).toHaveTextContent('/results');
      expect(screen.getByTestId('query')).toHaveTextContent('q=react');
    });

    it('submits POST form data and navigates with hash-encoded data', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <Form action="/submit" method="POST">
            <input name="name" defaultValue="Alice" data-testid="input-name" />
            <SubmitButton>Submit</SubmitButton>
          </Form>
          <PathDisplay />
          <FormDataDisplay />
        </div>,
      );

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(screen.getByTestId('path')).toHaveTextContent('/submit');
      const formData = JSON.parse(screen.getByTestId('form-data').textContent!);
      expect(formData.name).toBe('Alice');
    });

    it('calls custom onSubmit handler with form data', async () => {
      const user = userEvent.setup();
      let capturedData: Record<string, unknown> | null = null;

      function TestForm() {
        return (
          <Form
            onSubmit={(data) => {
              capturedData = data;
            }}
          >
            <input name="email" defaultValue="test@example.com" />
            <SubmitButton>Send</SubmitButton>
          </Form>
        );
      }

      renderWithVirtualRouter(<TestForm />);

      await user.click(screen.getByRole('button', { name: 'Send' }));

      expect(capturedData).not.toBeNull();
      expect(capturedData!.email).toBe('test@example.com');
    });

    it('submits multiple form fields as query string', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <Form action="/search" method="GET">
            <input name="q" defaultValue="router" />
            <input name="lang" defaultValue="en" />
            <SubmitButton>Go</SubmitButton>
          </Form>
          <SearchDisplay />
        </div>,
      );

      await user.click(screen.getByRole('button', { name: 'Go' }));

      const entries = JSON.parse(screen.getByTestId('search-entries').textContent!);
      expect(entries.q).toBe('router');
      expect(entries.lang).toBe('en');
    });
  });

  describe('useFormData', () => {
    it('returns null when no form data in hash', () => {
      renderWithVirtualRouter(
        <FormDataDisplay />,
        { initialPath: '/page' },
      );
      expect(screen.getByTestId('form-data')).toHaveTextContent('null');
    });

    it('extracts form data from hash fragment after POST', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <Form action="/receive" method="POST">
            <input name="title" defaultValue="Hello" />
            <SubmitButton>Post</SubmitButton>
          </Form>
          <Routes>
            <Route path="receive">
              <FormDataDisplay />
            </Route>
          </Routes>
        </div>,
      );

      await user.click(screen.getByRole('button', { name: 'Post' }));

      const formData = JSON.parse(screen.getByTestId('form-data').textContent!);
      expect(formData.title).toBe('Hello');
    });
  });

  describe('useFormSubmission', () => {
    it('provides initial submission state', () => {
      renderWithVirtualRouter(<SubmissionStateDisplay />);

      expect(screen.getByTestId('is-submitting')).toHaveTextContent('false');
      expect(screen.getByTestId('last-submission')).toHaveTextContent('null');
      expect(screen.getByTestId('submission-error')).toHaveTextContent('null');
    });
  });

  describe('SubmitButton', () => {
    it('renders as a submit button and triggers form submission', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <Form action="/done" method="GET">
            <input name="status" defaultValue="ok" />
            <SubmitButton>Finish</SubmitButton>
          </Form>
          <PathDisplay />
          <SearchDisplay />
        </div>,
      );

      const button = screen.getByRole('button', { name: 'Finish' });
      expect(button).toHaveAttribute('type', 'submit');

      await user.click(button);

      expect(screen.getByTestId('path')).toHaveTextContent('/done');
      expect(screen.getByTestId('query')).toHaveTextContent('status=ok');
    });

    it('supports disabled state', () => {
      renderWithVirtualRouter(
        <Form action="/noop">
          <SubmitButton disabled>Disabled</SubmitButton>
        </Form>,
      );

      expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    });
  });

  describe('FormLink', () => {
    it('navigates to the target path without form data', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <FormLink to="/target" data-testid="form-link">
            Go
          </FormLink>
          <PathDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('form-link'));

      expect(screen.getByTestId('path')).toHaveTextContent('/target');
    });

    it('navigates with GET form data as query string', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <FormLink
            to="/results"
            formData={{ filter: 'active' }}
            method="GET"
            data-testid="form-link"
          >
            Filter
          </FormLink>
          <PathDisplay />
          <SearchDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('form-link'));

      expect(screen.getByTestId('path')).toHaveTextContent('/results');
      expect(screen.getByTestId('query')).toHaveTextContent('filter=active');
    });

    it('navigates with POST form data encoded in hash', async () => {
      const user = userEvent.setup();
      renderWithVirtualRouter(
        <div>
          <FormLink
            to="/endpoint"
            formData={{ payload: 'data' }}
            method="POST"
            data-testid="form-link"
          >
            Send
          </FormLink>
          <PathDisplay />
          <FormDataDisplay />
        </div>,
      );

      await user.click(screen.getByTestId('form-link'));

      expect(screen.getByTestId('path')).toHaveTextContent('/endpoint');
      const formData = JSON.parse(screen.getByTestId('form-data').textContent!);
      expect(formData.payload).toBe('data');
    });

    it('calls onClick handler when provided', async () => {
      const user = userEvent.setup();
      let clicked = false;

      renderWithVirtualRouter(
        <FormLink
          to="/anywhere"
          onClick={() => { clicked = true; }}
          data-testid="form-link"
        >
          Click Me
        </FormLink>,
      );

      await user.click(screen.getByTestId('form-link'));

      expect(clicked).toBe(true);
    });
  });
});
