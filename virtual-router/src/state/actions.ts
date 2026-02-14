import { createActions } from 'redux-actions';
import { NavigateAction, BackAction, ForwardAction, SyncAction } from '../types';

export const { navigate, back, forward, sync } = createActions({
    NAVIGATE: (path: string): string => path,
    BACK: (count: number = 1): number => Math.max(1, count),
    FORWARD: (count: number = 1): number => Math.max(1, count),
    SYNC: (path: string): string => path,
});

// Type-safe action creators
export const createNavigateAction = (path: string): NavigateAction => ({
    type: 'NAVIGATE',
    payload: path,
});

export const createBackAction = (count: number = 1): BackAction => ({
    type: 'BACK',
    payload: Math.max(1, count),
});

export const createForwardAction = (count: number = 1): ForwardAction => ({
    type: 'FORWARD',
    payload: Math.max(1, count),
});

export const createSyncAction = (path: string): SyncAction => ({
    type: 'SYNC',
    payload: path,
});

