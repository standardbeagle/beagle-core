import { DataOperationType } from '../types';
export declare const navigate: import("redux-actions").ActionFunctionAny<import("redux-actions").Action<any>>, back: import("redux-actions").ActionFunctionAny<import("redux-actions").Action<any>>, forward: import("redux-actions").ActionFunctionAny<import("redux-actions").Action<any>>, dataOperation: import("redux-actions").ActionFunctionAny<import("redux-actions").Action<any>>, asyncStart: import("redux-actions").ActionFunctionAny<import("redux-actions").Action<any>>, asyncSuccess: import("redux-actions").ActionFunctionAny<import("redux-actions").Action<any>>, asyncError: import("redux-actions").ActionFunctionAny<import("redux-actions").Action<any>>, asyncCancel: import("redux-actions").ActionFunctionAny<import("redux-actions").Action<any>>, commandQueueUpdate: import("redux-actions").ActionFunctionAny<import("redux-actions").Action<any>>;
export declare function generateRequestId(): string;
export declare const createNavigateAction: (xpath: string) => {
    type: "NAVIGATE";
    payload: string;
};
export declare const createBackAction: (count?: number) => {
    type: "BACK";
    payload: number;
};
export declare const createForwardAction: (count?: number) => {
    type: "FORWARD";
    payload: number;
};
export declare const createDataAction: (xpath: string, operation: DataOperationType, data: any) => {
    type: "DATA_OPERATION";
    payload: {
        xpath: string;
        operation: DataOperationType;
        data: any;
    };
};
