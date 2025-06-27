import { test, expect } from 'vitest';
import { navigate, back, forward } from './actions';

test('navigate action should create correct action object', () => {
  const action = navigate('/home');
  expect(action).toEqual({
    type: 'NAVIGATE',
    payload: '/home',
  });
});

test('navigate action should handle different path types', () => {
  expect(navigate('/')).toEqual({
    type: 'NAVIGATE',
    payload: '/',
  });

  expect(navigate('relative/path')).toEqual({
    type: 'NAVIGATE',
    payload: 'relative/path',
  });

  expect(navigate('/absolute/path')).toEqual({
    type: 'NAVIGATE',
    payload: '/absolute/path',
  });

  expect(navigate('../parent')).toEqual({
    type: 'NAVIGATE',
    payload: '../parent',
  });
});

test('navigate action should handle paths with query strings and hashes', () => {
  expect(navigate('/page?query=test')).toEqual({
    type: 'NAVIGATE',
    payload: '/page?query=test',
  });

  expect(navigate('/page#section')).toEqual({
    type: 'NAVIGATE',
    payload: '/page#section',
  });

  expect(navigate('/page?query=test#section')).toEqual({
    type: 'NAVIGATE',
    payload: '/page?query=test#section',
  });
});

test('back action should create correct action object with default count', () => {
  const action = back();
  expect(action).toEqual({
    type: 'BACK',
    payload: 1,
  });
});

test('back action should accept custom count', () => {
  expect(back(2)).toEqual({
    type: 'BACK',
    payload: 2,
  });

  expect(back(5)).toEqual({
    type: 'BACK',
    payload: 5,
  });

  expect(back(0)).toEqual({
    type: 'BACK',
    payload: 0,
  });
});

test('forward action should create correct action object with default count', () => {
  const action = forward();
  expect(action).toEqual({
    type: 'FORWARD',
    payload: 1,
  });
});

test('forward action should accept custom count', () => {
  expect(forward(2)).toEqual({
    type: 'FORWARD',
    payload: 2,
  });

  expect(forward(10)).toEqual({
    type: 'FORWARD',
    payload: 10,
  });

  expect(forward(0)).toEqual({
    type: 'FORWARD',
    payload: 0,
  });
});

test('action creators should be pure functions', () => {
  const path = '/test';
  const action1 = navigate(path);
  const action2 = navigate(path);
  
  expect(action1).toEqual(action2);
  expect(action1).not.toBe(action2); // Different object references
});

test('action types should be consistent', () => {
  const navigateAction = navigate('/test');
  const backAction = back();
  const forwardAction = forward();

  expect(navigateAction.type).toBe('NAVIGATE');
  expect(backAction.type).toBe('BACK');
  expect(forwardAction.type).toBe('FORWARD');
});

test('edge cases for action creators', () => {
  // Empty string navigation
  expect(navigate('')).toEqual({
    type: 'NAVIGATE',
    payload: '',
  });

  // Negative numbers for back/forward
  expect(back(-1)).toEqual({
    type: 'BACK',
    payload: -1,
  });

  expect(forward(-1)).toEqual({
    type: 'FORWARD',
    payload: -1,
  });

  // Very large numbers
  expect(back(1000)).toEqual({
    type: 'BACK',
    payload: 1000,
  });

  expect(forward(1000)).toEqual({
    type: 'FORWARD',
    payload: 1000,
  });
});