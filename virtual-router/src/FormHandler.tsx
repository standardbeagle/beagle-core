import { FormEvent, ReactNode } from 'react';
import { useNavigate, useSearchParams } from './index';

interface FormData {
  [key: string]: string | string[] | File | File[];
}

interface FormHandlerProps {
  action?: string;
  method?: 'GET' | 'POST';
  onSubmit?: (data: FormData, navigate: (path: string) => void) => void;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Form({ 
  action = '', 
  method = 'GET', 
  onSubmit, 
  children, 
  ...props 
}: FormHandlerProps) {
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const form = event.currentTarget;
    const formData = new window.FormData(form);
    
    // Convert FormData to our FormData interface
    const data: FormData = {};
    
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // Handle multiple values for the same key
        if (Array.isArray(data[key])) {
          (data[key] as (string | File)[]).push(value as string | File);
        } else {
          data[key] = [data[key] as string | File, value as string | File];
        }
      } else {
        data[key] = value as string | File;
      }
    }

    if (onSubmit) {
      // Custom form handler
      onSubmit(data, navigate);
    } else if (action) {
      // Default behavior: navigate with form data
      if (method === 'GET') {
        // Convert to query string
        const queryString = convertFormDataToQueryString(data);
        const targetPath = queryString ? `${action}?${queryString}` : action;
        navigate(targetPath);
      } else {
        // POST data - navigate with data in route context
        navigate(`${action}#formData=${encodeFormData(data)}`);
      }
    }
  };

  return (
    <form {...props} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

// Helper function to convert form data to query string
function convertFormDataToQueryString(data: FormData): string {
  const params = new URLSearchParams();
  
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => {
        if (typeof v === 'string') {
          params.append(key, v);
        }
      });
    } else if (typeof value === 'string') {
      params.append(key, value);
    }
    // Skip File objects for GET requests
  });
  
  return params.toString();
}

// Helper function to encode form data for POST requests
function encodeFormData(data: FormData): string {
  // Convert to JSON, excluding File objects for now
  const serializable: { [key: string]: string | string[] } = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      serializable[key] = value
        .filter(v => typeof v === 'string')
        .map(v => v as string);
    } else if (typeof value === 'string') {
      serializable[key] = value;
    }
    // Files would need special handling in a real implementation
  });
  
  return encodeURIComponent(JSON.stringify(serializable));
}

// Hook to extract form data from hash
export function useFormData(): FormData | null {
  const { hash } = useSearchParams();
  if (!hash) return null;
  
  const formDataMatch = hash.match(/formData=([^&]*)/);
  
  if (!formDataMatch) {
    return null;
  }
  
  try {
    const decoded = decodeURIComponent(formDataMatch[1]);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Action components for specific form actions
interface SubmitButtonProps {
  formAction?: string;
  formMethod?: 'GET' | 'POST';
  children: ReactNode;
  type?: 'submit' | 'button';
  className?: string;
  disabled?: boolean;
}

export function SubmitButton({ 
  formAction, 
  formMethod, 
  children, 
  type = 'submit',
  ...props 
}: SubmitButtonProps) {
  return (
    <button 
      type={type}
      formAction={formAction}
      formMethod={formMethod}
      {...props}
    >
      {children}
    </button>
  );
}

// Hook to get form submission state
export function useFormSubmission() {
  // This could be enhanced to track form submission state
  return {
    isSubmitting: false,
    lastSubmission: null as FormData | null,
    error: null as Error | null
  };
}

// Enhanced Link component that can handle form data
interface FormLinkProps {
  to: string;
  formData?: FormData;
  method?: 'GET' | 'POST';
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function FormLink({ 
  to, 
  formData, 
  method = 'GET', 
  children, 
  onClick,
  ...props 
}: FormLinkProps) {
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    
    if (onClick) {
      onClick();
    }

    if (formData) {
      if (method === 'GET') {
        const queryString = convertFormDataToQueryString(formData);
        const targetPath = queryString ? `${to}?${queryString}` : to;
        navigate(targetPath);
      } else {
        navigate(`${to}#formData=${encodeFormData(formData)}`);
      }
    } else {
      navigate(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}