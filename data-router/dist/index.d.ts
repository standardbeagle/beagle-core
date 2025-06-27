import React from 'react';
import type { ComponentProps } from 'react';
import { ReactNode } from 'react';
export { DataProvider } from './provider';
export { useXPath } from './hooks/useXPath';
export { useData, useTargetData, useDataAtXPath } from './hooks/useData';
export { useNavigate, useNavigation, useHistory } from './hooks/useNavigate';
export { useDataManipulation } from './hooks/useDataManipulation';
export { asyncStart, asyncSuccess, asyncError, asyncCancel, commandQueueUpdate, generateRequestId } from './state/actions';
export { CommandQueueManager } from './state/command-queue';
export type { AsyncState, AsyncCommand, CommandQueue, OptimisticUpdate } from './types';
export { Form, Button } from './FormHandler';
interface LinkProps extends Omit<ComponentProps<'a'>, 'href' | 'onClick'> {
    to: string;
    children: ReactNode;
}
export declare const Link: React.ForwardRefExoticComponent<Omit<LinkProps, "ref"> & React.RefAttributes<HTMLAnchorElement>>;
