import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { PathProvider } from '@standardbeagle/virtual-router';
import { DataProvider } from '@standardbeagle/data-router';

interface VirtualRouterWrapperProps {
  children: ReactNode;
  initialPath?: string;
}

function VirtualRouterWrapper({ children, initialPath = '/' }: VirtualRouterWrapperProps) {
  return <PathProvider path={initialPath}>{children}</PathProvider>;
}

interface DataRouterWrapperProps {
  children: ReactNode;
  initialData?: Record<string, unknown>;
}

function DataRouterWrapper({ children, initialData = {} }: DataRouterWrapperProps) {
  return <DataProvider initialData={initialData}>{children}</DataProvider>;
}

interface DualRouterWrapperProps {
  children: ReactNode;
  initialPath?: string;
  initialData?: Record<string, unknown>;
}

function DualRouterWrapper({ children, initialPath = '/', initialData = {} }: DualRouterWrapperProps) {
  return (
    <PathProvider path={initialPath}>
      <DataProvider initialData={initialData}>
        {children}
      </DataProvider>
    </PathProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialPath?: string;
  initialData?: Record<string, unknown>;
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

export function renderWithDataRouter(
  ui: ReactElement,
  { initialData, ...options }: CustomRenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <DataRouterWrapper initialData={initialData}>{children}</DataRouterWrapper>;
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

export function renderWithBothRouters(
  ui: ReactElement,
  { initialPath, initialData, ...options }: CustomRenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <DualRouterWrapper initialPath={initialPath} initialData={initialData}>
        {children}
      </DualRouterWrapper>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

export { VirtualRouterWrapper, DataRouterWrapper, DualRouterWrapper };
