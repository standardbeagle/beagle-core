import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { PathProvider } from '@standardbeagle/virtual-router';

interface VirtualRouterWrapperProps {
  children: ReactNode;
  initialPath?: string;
}

function VirtualRouterWrapper({ children, initialPath = '/' }: VirtualRouterWrapperProps) {
  return <PathProvider path={initialPath}>{children}</PathProvider>;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialPath?: string;
}

export function renderWithVirtualRouter(
  ui: ReactElement,
  { initialPath, ...options }: CustomRenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <VirtualRouterWrapper initialPath={initialPath}>{children}</VirtualRouterWrapper>;
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

export { VirtualRouterWrapper };
