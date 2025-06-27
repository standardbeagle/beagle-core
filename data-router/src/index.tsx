import React from 'react';
import type { ComponentProps } from 'react';
import { forwardRef, ReactNode } from 'react';
import { useNavigate } from './hooks/useNavigate';

export { DataProvider } from './provider';

export { useXPath } from './hooks/useXPath';
export { useData, useTargetData, useDataAtXPath } from './hooks/useData';
export { useNavigate, useNavigation, useHistory } from './hooks/useNavigate';
export { useDataManipulation } from './hooks/useDataManipulation';

// Export async hooks
export { useAsyncData } from './hooks/useAsyncData';
export { useAsyncMutation } from './hooks/useAsyncMutation';
export { useAsyncState, useAsyncStates, useGlobalAsyncState } from './hooks/useAsyncState';
export { useAsyncBatch, useAsyncParallel, useAsyncSequential } from './hooks/useAsyncBatch';
export { useOptimisticUpdates, useOptimisticList, useOptimisticObject } from './hooks/useOptimisticUpdates';
export { useInvalidation, useAutoInvalidation, useQueryInvalidation } from './hooks/useInvalidation';

// Export async state management
export { asyncStart, asyncSuccess, asyncError, asyncCancel, commandQueueUpdate, generateRequestId } from './state/actions';
export { CommandQueueManager } from './state/command-queue';

// Export types for async functionality
export type { AsyncState, AsyncCommand, CommandQueue, OptimisticUpdate } from './types';
export type { AsyncDataConfig, AsyncDataResult } from './hooks/useAsyncData';
export type { AsyncMutationConfig, AsyncMutationResult } from './hooks/useAsyncMutation';
export type { AsyncStateInfo, AsyncStateResult } from './hooks/useAsyncState';
export type { BatchOperation, BatchConfig, BatchResult, AsyncBatchResult } from './hooks/useAsyncBatch';
export type { OptimisticUpdateConfig, OptimisticUpdateResult } from './hooks/useOptimisticUpdates';
export type { InvalidationConfig, InvalidationResult } from './hooks/useInvalidation';

export { Form, Button } from './FormHandler';

interface LinkProps extends Omit<ComponentProps<'a'>, 'href' | 'onClick'> {
    to: string;
    children: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ to, children, ...rest }, ref) => {
    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (!event.defaultPrevented) {
            event.preventDefault();
            navigate(to);
        }
    };

    return (
        <a 
            {...rest}
            href="#"
            ref={ref}
            onClick={handleClick}
        >
            {children}
        </a>
    );
});

Link.displayName = 'Link';