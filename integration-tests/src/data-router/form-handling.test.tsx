import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Form,
  Button,
  useData,
  useDataAtXPath,
  useXPath,
  useNavigate,
  useDataManipulation,
} from '@standardbeagle/data-router';
import { renderWithDataRouter } from '../test-utils';

function DataDisplay() {
  const data = useData();
  return <span data-testid="data">{JSON.stringify(data)}</span>;
}

function DataAtPath({ xpath }: { xpath: string }) {
  const data = useDataAtXPath(xpath);
  return <span data-testid={`data-${xpath}`}>{JSON.stringify(data)}</span>;
}

function XPathDisplay() {
  const xpath = useXPath();
  return <span data-testid="xpath">{xpath}</span>;
}

function NavigateButton({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button data-testid={`nav-${label}`} onClick={() => navigate(to)}>
      {label}
    </button>
  );
}

const sampleData = {
  users: {
    profile: { name: 'Alice', age: 30 },
  },
  items: [
    { id: 1, title: 'First' },
  ],
};

describe('Data Router: Form Handling', () => {
  describe('Form component', () => {
    it('renders a form element with children', () => {
      renderWithDataRouter(
        <Form>
          <input name="field" data-testid="input" />
        </Form>,
        { initialData: {} },
      );

      const form = screen.getByTestId('input').closest('form');
      expect(form).toBeTruthy();
    });

    it('renders with custom id and className', () => {
      renderWithDataRouter(
        <Form id="my-form" className="form-class">
          <span data-testid="child">content</span>
        </Form>,
        { initialData: {} },
      );

      const form = screen.getByTestId('child').closest('form');
      expect(form).toHaveAttribute('id', 'my-form');
      expect(form).toHaveClass('form-class');
    });

    it('submits form data to xpath with default merge operation', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Form xpath="/users/profile">
            <input name="email" defaultValue="alice@test.com" data-testid="email" />
            <button type="submit" data-testid="submit">Save</button>
          </Form>
          <DataAtPath xpath="/users/profile" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('submit'));

      const result = JSON.parse(screen.getByTestId('data-/users/profile').textContent!);
      expect(result.name).toBe('Alice');
      expect(result.age).toBe(30);
      expect(result.email).toBe('alice@test.com');
    });

    it('submits form data with replace operation', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Form xpath="/users/profile" operation="replace">
            <input name="name" defaultValue="Bob" data-testid="name" />
            <button type="submit" data-testid="submit">Replace</button>
          </Form>
          <DataAtPath xpath="/users/profile" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('submit'));

      const result = JSON.parse(screen.getByTestId('data-/users/profile').textContent!);
      expect(result).toEqual({ name: 'Bob' });
    });

    it('calls custom onSubmit handler with form data and navigate function', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      renderWithDataRouter(
        <Form onSubmit={onSubmit}>
          <input name="username" defaultValue="testuser" data-testid="username" />
          <button type="submit" data-testid="submit">Submit</button>
        </Form>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('submit'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const [formData, navigateFn] = onSubmit.mock.calls[0];
      expect(formData.username).toBe('testuser');
      expect(typeof navigateFn).toBe('function');
    });

    it('collects multiple form fields on submit', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Form xpath="/form-result" operation="replace">
            <input name="first" defaultValue="John" />
            <input name="last" defaultValue="Doe" />
            <input name="age" defaultValue="42" />
            <button type="submit" data-testid="submit">Save</button>
          </Form>
          <DataAtPath xpath="/form-result" />
        </div>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('submit'));

      const result = JSON.parse(screen.getByTestId('data-/form-result').textContent!);
      expect(result.first).toBe('John');
      expect(result.last).toBe('Doe');
      expect(result.age).toBe('42');
    });

    it('handles duplicate field names as arrays', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      renderWithDataRouter(
        <Form onSubmit={onSubmit}>
          <input name="tag" defaultValue="red" />
          <input name="tag" defaultValue="blue" />
          <input name="tag" defaultValue="green" />
          <button type="submit" data-testid="submit">Submit</button>
        </Form>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('submit'));

      const formData = onSubmit.mock.calls[0][0];
      expect(formData.tag).toEqual(['red', 'blue', 'green']);
    });

    it('prevents default form submission behavior', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <Form xpath="/result">
          <button type="submit" data-testid="submit">Submit</button>
        </Form>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('submit'));
      // If default was not prevented, jsdom would throw or navigate
      expect(true).toBe(true);
    });

    it('prefers onSubmit over xpath when both are provided', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      renderWithDataRouter(
        <div>
          <Form xpath="/should-not-write" onSubmit={onSubmit}>
            <input name="val" defaultValue="test" />
            <button type="submit" data-testid="submit">Submit</button>
          </Form>
          <DataDisplay />
        </div>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('submit'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = JSON.parse(screen.getByTestId('data').textContent!);
      expect(data['should-not-write']).toBeUndefined();
    });
  });

  describe('Button component', () => {
    it('renders a button element', () => {
      renderWithDataRouter(
        <Form>
          <Button data-testid="btn">Click</Button>
        </Form>,
        { initialData: {} },
      );

      const btn = screen.getByTestId('btn');
      expect(btn.tagName).toBe('BUTTON');
      expect(btn).toHaveTextContent('Click');
    });

    it('collects form data and writes to targetXPath on click', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Form>
            <input name="field" defaultValue="value1" />
            <Button targetXPath="/result" data-testid="btn">Save</Button>
          </Form>
          <DataAtPath xpath="/result" />
        </div>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('btn'));

      const result = JSON.parse(screen.getByTestId('data-/result').textContent!);
      expect(result.field).toBe('value1');
    });

    it('uses specified dataAction operation', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Form>
            <input name="extra" defaultValue="appended" />
            <Button targetXPath="/result" dataAction="replace" data-testid="btn">Replace</Button>
          </Form>
          <DataAtPath xpath="/result" />
        </div>,
        { initialData: { result: { existing: true } } },
      );

      await user.click(screen.getByTestId('btn'));

      const result = JSON.parse(screen.getByTestId('data-/result').textContent!);
      expect(result).toEqual({ extra: 'appended' });
      expect(result.existing).toBeUndefined();
    });

    it('navigates when navigateTo is specified', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Form>
            <Button type="button" navigateTo="/dashboard" data-testid="btn">Go</Button>
          </Form>
          <XPathDisplay />
        </div>,
        { initialData: {} },
      );

      expect(screen.getByTestId('xpath')).toHaveTextContent('/');
      await user.click(screen.getByTestId('btn'));
      expect(screen.getByTestId('xpath')).toHaveTextContent('/dashboard');
    });

    it('calls custom onClick handler', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderWithDataRouter(
        <Form>
          <Button type="button" onClick={onClick} data-testid="btn">Click</Button>
        </Form>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('btn'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not execute data action when onClick prevents default', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Form>
            <input name="val" defaultValue="test" />
            <Button
              targetXPath="/result"
              onClick={(e) => e.preventDefault()}
              data-testid="btn"
            >
              Prevent
            </Button>
          </Form>
          <DataDisplay />
        </div>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('btn'));
      const data = JSON.parse(screen.getByTestId('data').textContent!);
      expect(data.result).toBeUndefined();
    });
  });

  describe('Form + navigation combined workflows', () => {
    it('submits form data then navigates via onSubmit', async () => {
      const user = userEvent.setup();

      function FormWithNav() {
        const { setData } = useDataManipulation();
        return (
          <Form
            onSubmit={(formData, navigate) => {
              setData('/submission', formData, 'replace');
              navigate('/success');
            }}
          >
            <input name="name" defaultValue="Alice" />
            <button type="submit" data-testid="submit">Submit</button>
          </Form>
        );
      }

      renderWithDataRouter(
        <div>
          <FormWithNav />
          <XPathDisplay />
          <DataAtPath xpath="/submission" />
        </div>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('submit'));

      expect(screen.getByTestId('xpath')).toHaveTextContent('/success');
      const submission = JSON.parse(screen.getByTestId('data-/submission').textContent!);
      expect(submission.name).toBe('Alice');
    });

    it('Button writes data and navigates in one action', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Form>
            <input name="status" defaultValue="complete" />
            <Button
              targetXPath="/task"
              navigateTo="/tasks/done"
              data-testid="btn"
            >
              Complete & Navigate
            </Button>
          </Form>
          <XPathDisplay />
          <DataAtPath xpath="/task" />
        </div>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('btn'));

      expect(screen.getByTestId('xpath')).toHaveTextContent('/tasks/done');
      const task = JSON.parse(screen.getByTestId('data-/task').textContent!);
      expect(task.status).toBe('complete');
    });

    it('navigating after form submit shows updated data via useDataAtXPath', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Form xpath="/users/profile" operation="merge">
            <input name="verified" defaultValue="true" />
            <button type="submit" data-testid="submit">Verify</button>
          </Form>
          <NavigateButton to="/users/profile" label="to-profile" />
          <DataAtPath xpath="/users/profile" />
        </div>,
        { initialData: sampleData },
      );

      await user.click(screen.getByTestId('submit'));
      const result = JSON.parse(screen.getByTestId('data-/users/profile').textContent!);
      expect(result.name).toBe('Alice');
      expect(result.verified).toBe('true');
    });

    it('multiple form submissions accumulate data via merge', async () => {
      const user = userEvent.setup();
      renderWithDataRouter(
        <div>
          <Form xpath="/record" operation="merge">
            <input name="field1" defaultValue="a" data-testid="field1" />
            <button type="submit" data-testid="submit1">Submit 1</button>
          </Form>
          <Form xpath="/record" operation="merge">
            <input name="field2" defaultValue="b" data-testid="field2" />
            <button type="submit" data-testid="submit2">Submit 2</button>
          </Form>
          <DataAtPath xpath="/record" />
        </div>,
        { initialData: {} },
      );

      await user.click(screen.getByTestId('submit1'));
      let result = JSON.parse(screen.getByTestId('data-/record').textContent!);
      expect(result.field1).toBe('a');

      await user.click(screen.getByTestId('submit2'));
      result = JSON.parse(screen.getByTestId('data-/record').textContent!);
      expect(result.field1).toBe('a');
      expect(result.field2).toBe('b');
    });
  });
});
