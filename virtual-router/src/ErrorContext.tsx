import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface RouterError {
  message: string;
  code?: string;
  path?: string;
  timestamp: number;
}

interface ErrorContextType {
  errors: RouterError[];
  addError: (error: RouterError) => void;
  clearErrors: () => void;
  clearError: (timestamp: number) => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [errors, setErrors] = useState<RouterError[]>([]);

  const addError = useCallback((error: RouterError) => {
    setErrors(prev => [...prev, { ...error, timestamp: Date.now() }]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearError = useCallback((timestamp: number) => {
    setErrors(prev => prev.filter(error => error.timestamp !== timestamp));
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, addError, clearErrors, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useRouteError(): RouterError | null {
  const context = useContext(ErrorContext);
  if (!context) {
    return null;
  }
  return context.errors[0] || null;
}

export function useRouteErrors(): ErrorContextType | null {
  return useContext(ErrorContext);
}