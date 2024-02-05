import { createActions } from 'redux-actions';

export const { navigate, back, forward } = createActions({
    NAVIGATE: (path: string) => path,
    BACK: (count: number = 1) => count,
    FORWARD: (count: number = 1) => count,
});

