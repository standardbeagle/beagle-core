import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataProvider } from './provider';
import { useXPath } from './hooks/useXPath';
import { useData, useTargetData } from './hooks/useData';

function TestComponent() {
    const xpath = useXPath();
    const data = useData();
    const targetData = useTargetData();
    
    return (
        <div>
            <div data-testid="xpath">{xpath}</div>
            <div data-testid="data">{JSON.stringify(data)}</div>
            <div data-testid="target">{JSON.stringify(targetData)}</div>
        </div>
    );
}

describe('DataProvider', () => {
    it('should provide default values', () => {
        render(
            <DataProvider>
                <TestComponent />
            </DataProvider>
        );
        
        expect(screen.getByTestId('xpath')).toHaveTextContent('/');
        expect(screen.getByTestId('data')).toHaveTextContent('{}');
        expect(screen.getByTestId('target')).toHaveTextContent('{}');
    });

    it('should provide initial data and xpath', () => {
        const initialData = { users: [{ name: 'John' }] };
        const initialXPath = '/users[0]';
        
        render(
            <DataProvider initialData={initialData} initialXPath={initialXPath}>
                <TestComponent />
            </DataProvider>
        );
        
        expect(screen.getByTestId('xpath')).toHaveTextContent('/users[0]');
        expect(screen.getByTestId('data')).toHaveTextContent(JSON.stringify(initialData));
        expect(screen.getByTestId('target')).toHaveTextContent('{"name":"John"}');
    });
});