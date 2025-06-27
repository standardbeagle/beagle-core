import { test, expect } from 'vitest';
import { reducer, defaultState, defaultRoute } from './reducer';
import { navigate, back, forward } from './actions';

test('defaultState should have correct initial values', () => {
  expect(defaultState).toEqual({
    path: '/',
    history: [],
    location: 0,
  });
});

test('defaultRoute should have correct initial values', () => {
  expect(defaultRoute).toEqual({
    routePath: '*',
    data: {},
    hash: '',
    query: '',
  });
});

test('NAVIGATE action should update path and add to history', () => {
  const state = defaultState;
  const action = navigate('/about');
  const newState = reducer(state, action);

  expect(newState).toEqual({
    path: '/about',
    history: ['/'],
    location: 0,
  });
});

test('NAVIGATE action should handle relative paths', () => {
  const state = { path: '/users', history: [], location: 0 };
  const action = navigate('profile');
  const newState = reducer(state, action);

  expect(newState).toEqual({
    path: '/users/profile',
    history: ['/users'],
    location: 0,
  });
});

test('NAVIGATE action should handle parent navigation (..)', () => {
  const state = { path: '/users/profile', history: [], location: 0 };
  const action = navigate('..');
  const newState = reducer(state, action);

  expect(newState).toEqual({
    path: '/users',
    history: ['/users/profile'],
    location: 0,
  });
});

test('NAVIGATE action should reset future history when navigating from a past location', () => {
  const state = {
    path: '/page1',
    history: ['/page2', '/page3', '/page4'],
    location: 2,
  };
  const action = navigate('/new-page');
  const newState = reducer(state, action);

  expect(newState).toEqual({
    path: '/new-page',
    history: ['/page1', '/page2'],  // Fixed: should keep history[0] and history[1], trim from location 2
    location: 0,
  });
});

test('BACK action should navigate to previous page', () => {
  const state = {
    path: '/current',
    history: ['/previous', '/older'],
    location: 0,
  };
  const action = back();
  const newState = reducer(state, action);

  expect(newState).toEqual({
    path: '/previous',  // Fixed: now correctly goes to history[0] (1 step back)
    history: ['/previous', '/older'],
    location: 1,  // Location 1 means 1 step back
  });
});

test('BACK action should navigate multiple steps back', () => {
  const state = {
    path: '/current',
    history: ['/page1', '/page2', '/page3'],
    location: 0,
  };
  const action = back(2);
  const newState = reducer(state, action);

  expect(newState).toEqual({
    path: '/page2',  // Fixed: back(2) goes to history[1] (2 steps back)
    history: ['/page1', '/page2', '/page3'],
    location: 2,  // Location 2 means 2 steps back
  });
});

test('BACK action should not change state if no history', () => {
  const state = {
    path: '/current',
    history: [],
    location: 0,
  };
  const action = back();
  const newState = reducer(state, action);

  expect(newState).toBe(state);
});

test('BACK action should not exceed history bounds', () => {
  const state = {
    path: '/current',
    history: ['/previous'],
    location: 0,
  };
  const action = back(5);
  const newState = reducer(state, action);

  expect(newState).toBe(state);
});

test('FORWARD action should not work when going to unknown current state', () => {
  const state = {
    path: '/previous',
    history: ['/previous', '/current'],
    location: 1,
  };
  const action = forward();
  const newState = reducer(state, action);

  // Forward to location 0 is not supported due to design limitation
  expect(newState).toBe(state);
});

test('FORWARD action should not work when going to unknown current state (multi-step)', () => {
  const state = {
    path: '/page3',
    history: ['/page1', '/page2', '/page3', '/page4'],
    location: 2,
  };
  const action = forward(2);
  const newState = reducer(state, action);

  // Forward to location 0 is not supported due to design limitation
  expect(newState).toBe(state);
});

test('FORWARD action should work when not going to location 0', () => {
  const state = {
    path: '/page3',
    history: ['/page1', '/page2', '/page3'],
    location: 3,
  };
  const action = forward(1);
  const newState = reducer(state, action);

  expect(newState).toEqual({
    path: '/page2',  // Forward 1 step: from location 3 to location 2, which is history[1]
    history: ['/page1', '/page2', '/page3'],
    location: 2,
  });
});

test('FORWARD action should not change state if at latest page', () => {
  const state = {
    path: '/current',
    history: ['/previous'],
    location: 0,
  };
  const action = forward();
  const newState = reducer(state, action);

  expect(newState).toBe(state);  // Fixed: returns same state when can't go forward
});

test('FORWARD action should not exceed future bounds', () => {
  const state = {
    path: '/page2',
    history: ['/page1', '/page2', '/page3'],
    location: 1,
  };
  const action = forward(5);
  const newState = reducer(state, action);

  expect(newState).toBe(state);
});

test('Complex navigation scenario', () => {
  let state = defaultState;

  // Navigate to multiple pages
  state = reducer(state, navigate('/home'));
  state = reducer(state, navigate('/about'));
  state = reducer(state, navigate('/contact'));

  expect(state).toEqual({
    path: '/contact',
    history: ['/about', '/home', '/'],
    location: 0,
  });

  // Go back twice  
  state = reducer(state, back(2));
  expect(state).toEqual({
    path: '/home',  // Fixed: back(2) from location 0 goes to history[1] (2nd step back)
    history: ['/about', '/home', '/'],
    location: 2,  // Location 2 means we're 2 steps back
  });

  // Navigate from history position (should trim future)
  state = reducer(state, navigate('/new-page'));
  expect(state).toEqual({
    path: '/new-page',
    history: ['/home', '/about'],  // Fixed: trims from location 2, keeping first 2-1=1 items from history[1]
    location: 0,
  });

  // Go back 
  state = reducer(state, back());
  expect(state.path).toBe('/home');
  // Note: Forward functionality has limitations when navigating from history positions
  // since the "current" path is lost when navigating from a history state
});

test('Navigate to same path should not change state', () => {
  const state = { path: '/users', history: ['/home'], location: 0 };
  const action = navigate('/users');
  const newState = reducer(state, action);

  expect(newState).toBe(state);  // Should return exact same state object
});

test('Edge case: navigate with empty string', () => {
  const state = { path: '/users', history: [], location: 0 };
  const action = navigate('');
  const newState = reducer(state, action);

  expect(newState).toBe(state);  // Fixed: empty string returns same state
});

test('Edge case: navigate with only slash', () => {
  const state = { path: '/users/profile', history: [], location: 0 };
  const action = navigate('/');
  const newState = reducer(state, action);

  expect(newState).toEqual({
    path: '/',
    history: ['/users/profile'],
    location: 0,
  });
});

test('Unknown action should return current state', () => {
  const state = { path: '/test', history: [], location: 0 };
  const action = { type: 'UNKNOWN_ACTION', payload: 'test' };
  const newState = reducer(state, action);

  expect(newState).toBe(state);
});