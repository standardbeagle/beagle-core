import { combineXPaths } from './src/state/xpath-utils.js';

console.log('Combining /users + [0]:', combineXPaths('/users', '[0]'));
console.log('Combining /users + /settings:', combineXPaths('/users', '/settings'));