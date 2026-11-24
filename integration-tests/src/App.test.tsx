import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import App from './App';
import { render } from '@testing-library/react';
import { renderWithVirtualRouter } from './test-utils';
import { usePath } from '@standardbeagle/virtual-router';

describe('App', () => {
  it('renders with virtual router', () => {
    render(<App />);
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
  });
});

describe('test-utils', () => {
  function VirtualRouterConsumer() {
    const path = usePath();
    return <span data-testid="path">{path}</span>;
  }

  it('renderWithVirtualRouter provides PathProvider', () => {
    renderWithVirtualRouter(<VirtualRouterConsumer />, { initialPath: '/test' });
    expect(screen.getByTestId('path')).toHaveTextContent('/test');
  });
});
