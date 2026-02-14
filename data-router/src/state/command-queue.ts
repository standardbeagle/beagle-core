import { AsyncCommand, CommandQueue } from '../types';
import { generateRequestId } from './actions';

export class CommandQueueManager {
    private queue: CommandQueue = {
        pending: [],
        executing: new Map(),
        maxConcurrent: 3
    };

    private dispatch: (action: any) => void;
    private destroyed = false;

    constructor(dispatch: (action: any) => void, maxConcurrent: number = 3) {
        this.dispatch = dispatch;
        this.queue = { ...this.queue, maxConcurrent };
    }

    destroy(): void {
        this.destroyed = true;
        this.queue.executing.forEach((command) => {
            command.abortController.abort();
        });
        this.queue = {
            pending: [],
            executing: new Map(),
            maxConcurrent: this.queue.maxConcurrent
        };
    }
    
    createCommand(
        xpath: string,
        operation: 'fetch' | 'mutate',
        promise: Promise<any>,
        priority: 'low' | 'normal' | 'high' = 'normal'
    ): AsyncCommand {
        const abortController = new AbortController();
        const commandId = generateRequestId();
        
        const wrappedPromise = promise.then(
            result => {
                this.removeFromExecuting(commandId);
                return result;
            },
            error => {
                this.removeFromExecuting(commandId);
                throw error;
            }
        );
        
        return {
            id: commandId,
            xpath,
            operation,
            abortController,
            promise: wrappedPromise,
            timestamp: Date.now(),
            priority
        };
    }
    
    enqueue(command: AsyncCommand): void {
        if (this.destroyed) return;
        this.queue = {
            ...this.queue,
            pending: [...this.queue.pending, command]
        };
        this.dispatch({
            type: 'COMMAND_QUEUE_UPDATE',
            payload: { operation: 'add', command }
        });

        this.processQueue();
    }
    
    cancel(commandId: string): void {
        const executingCommand = this.queue.executing.get(commandId);
        if (executingCommand) {
            executingCommand.abortController.abort();
            this.removeFromExecuting(commandId);
        }
        
        this.queue = {
            ...this.queue,
            pending: this.queue.pending.filter(cmd => cmd.id !== commandId)
        };
    }
    
    cancelByXPath(xpath: string): void {
        this.queue.executing.forEach((command, id) => {
            if (command.xpath === xpath) {
                command.abortController.abort();
                this.removeFromExecuting(id);
            }
        });
        
        this.queue = {
            ...this.queue,
            pending: this.queue.pending.filter(cmd => cmd.xpath !== xpath)
        };
    }
    
    private processQueue(): void {
        if (this.destroyed) return;
        while (this.queue.executing.size < this.queue.maxConcurrent && this.queue.pending.length > 0) {
            const sortedPending = [...this.queue.pending].sort((a, b) => {
                const priorityOrder = { high: 3, normal: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority] || a.timestamp - b.timestamp;
            });
            
            const command = sortedPending[0];
            if (command) {
                this.executeCommand(command);
            } else {
                break;
            }
        }
    }
    
    private executeCommand(command: AsyncCommand): void {
        if (this.destroyed) return;
        const newExecuting = new Map(this.queue.executing);
        newExecuting.set(command.id, command);
        this.queue = {
            ...this.queue,
            pending: this.queue.pending.filter(c => c.id !== command.id),
            executing: newExecuting
        };
        this.dispatch({
            type: 'COMMAND_QUEUE_UPDATE',
            payload: { operation: 'execute', command }
        });

        command.promise.catch(() => {
            // Errors are handled by the caller's promise chain (executeRequest).
            // This catch prevents unhandled rejection warnings.
        });
    }
    
    private removeFromExecuting(commandId: string): void {
        const updatedExecuting = new Map(this.queue.executing);
        updatedExecuting.delete(commandId);
        this.queue = {
            ...this.queue,
            executing: updatedExecuting
        };
        this.dispatch({
            type: 'COMMAND_QUEUE_UPDATE',
            payload: { operation: 'remove', commandId }
        });

        queueMicrotask(() => this.processQueue());
    }
    
    updateQueue(newQueue: CommandQueue): void {
        this.queue = newQueue;
    }
    
    hasPendingOperations(xpath?: string): boolean {
        if (!xpath) {
            return this.queue.pending.length > 0 || this.queue.executing.size > 0;
        }
        
        return this.queue.pending.some(cmd => cmd.xpath === xpath) ||
               Array.from(this.queue.executing.values()).some(cmd => cmd.xpath === xpath);
    }
    
    getQueuedOperations(xpath?: string): AsyncCommand[] {
        const allCommands = [
            ...this.queue.pending,
            ...Array.from(this.queue.executing.values())
        ];
        
        return xpath ? allCommands.filter(cmd => cmd.xpath === xpath) : allCommands;
    }
}