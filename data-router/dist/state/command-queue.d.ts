import { AsyncCommand, CommandQueue } from '../types';
export declare class CommandQueueManager {
    private queue;
    private dispatch;
    private destroyed;
    constructor(dispatch: (action: any) => void, maxConcurrent?: number);
    destroy(): void;
    createCommand(xpath: string, operation: 'fetch' | 'mutate', promise: Promise<any>, priority?: 'low' | 'normal' | 'high'): AsyncCommand;
    enqueue(command: AsyncCommand): void;
    cancel(commandId: string): void;
    cancelByXPath(xpath: string): void;
    private processQueue;
    private executeCommand;
    private removeFromExecuting;
    updateQueue(newQueue: CommandQueue): void;
    hasPendingOperations(xpath?: string): boolean;
    getQueuedOperations(xpath?: string): AsyncCommand[];
}
