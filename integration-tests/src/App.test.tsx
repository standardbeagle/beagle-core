import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import App from './App';
import { render } from '@testing-library/react';
import { renderWithVirtualRouter, renderWithDataRouter, renderWithBothRouters } from './test-utils';
import { usePath } from '@standardbeagle/virtual-router';
import { useXPath } from '@standardbeagle/data-router';

describe('App', () => {
  it('renders with both routers', () => {
    render(<App />);
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
    expect(screen.getByTestId('current-xpath')).toHaveTextContent('/');
  });
});

describe('test-utils', () => {
  function VirtualRouterConsumer() {
    const path = usePath();
    return <span data-testid="path">{path}</span>;
  }

  function DataRouterConsumer() {
    const xpath = useXPath();
    return <span data-testid="xpath">{xpath}</span>;
  }

  it('renderWithVirtualRouter provides PathProvider', () => {
    renderWithVirtualRouter(<VirtualRouterConsumer />, { initialPath: '/test' });
    expect(screen.getByTestId('path')).toHaveTextContent('/test');
  });

  it('renderWithDataRouter provides DataProvider', () => {
    renderWithDataRouter(<DataRouterConsumer />);
    expect(screen.getByTestId('xpath')).toHaveTextContent('/');
  });

  it('renderWithBothRouters provides both providers', () => {
    renderWithBothRouters(
      <div>
        <VirtualRouterConsumer />
        <DataRouterConsumer />
      </div>,
      { initialPath: '/dual' },
    );
    expect(screen.getByTestId('path')).toHaveTextContent('/dual');
    expect(screen.getByTestId('xpath')).toHaveTextContent('/');
  });
});
