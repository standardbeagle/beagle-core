import { FormEvent, ReactNode, ButtonHTMLAttributes } from 'react';
import { useDataManipulation } from './hooks/useDataManipulation';
import { useNavigate } from './hooks/useNavigate';
import { FormData, DataOperationType } from './types';

interface FormHandlerProps {
    xpath?: string;
    operation?: DataOperationType;
    onSubmit?: (data: FormData, navigate: (xpath: string) => void) => void;
    children: ReactNode;
    className?: string;
    id?: string;
}

export function Form({ 
    xpath = '', 
    operation = 'merge',
    onSubmit, 
    children,
    ...props 
}: FormHandlerProps) {
    const navigate = useNavigate();
    const { setData } = useDataManipulation();

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const form = event.currentTarget;
        const formData = new window.FormData(form);
        
        const data: FormData = {};
        
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    (data[key] as FormDataEntryValue[]).push(value);
                } else {
                    data[key] = [data[key] as FormDataEntryValue, value];
                }
            } else {
                data[key] = value;
            }
        }

        if (onSubmit) {
            onSubmit(data, navigate);
        } else if (xpath) {
            setData(xpath, data, operation);
        }
    };

    return (
        <form {...props} onSubmit={handleSubmit}>
            {children}
        </form>
    );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    dataAction?: DataOperationType;
    targetXPath?: string;
    navigateTo?: string;
    children: ReactNode;
}

export function Button({
    dataAction = 'merge',
    targetXPath,
    navigateTo,
    children,
    onClick,
    type = 'submit',
    ...props
}: ButtonProps) {
    const { setData } = useDataManipulation();
    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(event);
        }

        if (event.defaultPrevented) {
            return;
        }

        if (type === 'submit') {
            const form = event.currentTarget.closest('form');
            if (form && targetXPath) {
                const formData = new window.FormData(form);
                const data: FormData = {};
                
                for (const [key, value] of formData.entries()) {
                    if (data[key]) {
                        if (Array.isArray(data[key])) {
                            (data[key] as FormDataEntryValue[]).push(value);
                        } else {
                            data[key] = [data[key] as FormDataEntryValue, value];
                        }
                    } else {
                        data[key] = value;
                    }
                }

                setData(targetXPath, data, dataAction);
            }
        }

        if (navigateTo) {
            navigate(navigateTo);
        }
    };

    return (
        <button type={type} {...props} onClick={handleClick}>
            {children}
        </button>
    );
}