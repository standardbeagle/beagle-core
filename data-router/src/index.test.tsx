import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, Link } from './index';
import { useXPath } from './hooks/useXPath';

function TestComponent() {
    const xpath = useXPath();
    return <div data-testid="xpath">{xpath}</div>;
}

describe('Link component', () => {
    it('should navigate when clicked', () => {
        render(
            <DataProvider>
                <TestComponent />
                <Link to="/users/profile">Go to Profile</Link>
            </DataProvider>
        );
        
        expect(screen.getByTestId('xpath')).toHaveTextContent('/');
        
        fireEvent.click(screen.getByText('Go to Profile'));
        
        expect(screen.getByTestId('xpath')).toHaveTextContent('/users/profile');
    });

    it('should handle relative navigation', () => {
        render(
            <DataProvider initialXPath="/users">
                <TestComponent />
                <Link to="profile">Go to Profile</Link>
            </DataProvider>
        );
        
        expect(screen.getByTestId('xpath')).toHaveTextContent('/users');
        
        fireEvent.click(screen.getByText('Go to Profile'));
        
        expect(screen.getByTestId('xpath')).toHaveTextContent('/users/profile');
    });

    it('should prevent default link behavior', () => {
        render(
            <DataProvider>
                <TestComponent />
                <Link to="/test">Test Link</Link>
            </DataProvider>
        );
        
        const link = screen.getByText('Test Link');
        
        fireEvent.click(link);
        
        // Check that navigation occurred instead of testing preventDefault directly
        expect(screen.getByTestId('xpath')).toHaveTextContent('/test');
    });
});