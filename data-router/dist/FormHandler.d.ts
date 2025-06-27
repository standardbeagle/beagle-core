import { ReactNode, ButtonHTMLAttributes } from 'react';
import { FormData, DataOperationType } from './types';
interface FormHandlerProps {
    xpath?: string;
    operation?: DataOperationType;
    onSubmit?: (data: FormData, navigate: (xpath: string) => void) => void;
    children: ReactNode;
    className?: string;
    id?: string;
}
export declare function Form({ xpath, operation, onSubmit, children, ...props }: FormHandlerProps): import("react/jsx-runtime").JSX.Element;
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    dataAction?: DataOperationType;
    targetXPath?: string;
    navigateTo?: string;
    children: ReactNode;
}
export declare function Button({ dataAction, targetXPath, navigateTo, children, onClick, type, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
