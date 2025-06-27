import { createActions } from 'redux-actions';
import { DataOperationType, AsyncCommand } from '../types';

export const { navigate, back, forward, dataOperation, asyncStart, asyncSuccess, 
               asyncError, asyncCancel, commandQueueUpdate } = createActions({
    NAVIGATE: (xpath: string): string => xpath,
    BACK: (count: number = 1): number => Math.max(1, count),
    FORWARD: (count: number = 1): number => Math.max(1, count),
    DATA_OPERATION: (xpath: string, operation: DataOperationType, data: any) => ({ xpath, operation, data }),
    ASYNC_START: (xpath: string, requestId: string, operation: 'fetch' | 'mutate', 
                  priority: 'low' | 'normal' | 'high' = 'normal', optimisticData?: any) => 
                  ({ xpath, requestId, operation, priority, optimisticData }),
    ASYNC_SUCCESS: (xpath: string, requestId: string, data: any, timestamp: number = Date.now()) => 
                   ({ xpath, requestId, data, timestamp }),
    ASYNC_ERROR: (xpath: string, requestId: string, error: Error, shouldRollback: boolean = true) => 
                 ({ xpath, requestId, error, shouldRollback }),
    ASYNC_CANCEL: (xpath: string, requestId: string) => ({ xpath, requestId }),
    COMMAND_QUEUE_UPDATE: (operation: 'add' | 'remove' | 'execute', command?: AsyncCommand, commandId?: string) => 
                          ({ operation, command, commandId }),
});

export function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const createNavigateAction = (xpath: string) => ({
    type: 'NAVIGATE' as const,
    payload: xpath,
});

export const createBackAction = (count: number = 1) => ({
    type: 'BACK' as const,
    payload: Math.max(1, count),
});

export const createForwardAction = (count: number = 1) => ({
    type: 'FORWARD' as const,
    payload: Math.max(1, count),
});

export const createDataAction = (xpath: string, operation: DataOperationType, data: any) => ({
    type: 'DATA_OPERATION' as const,
    payload: { xpath, operation, data },
});