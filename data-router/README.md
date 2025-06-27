# @standardbeagle/data-router

A memory-only, XPath-based router for React that operates with data structures instead of URLs. Perfect for complex React components that need internal routing and data manipulation without interfering with the parent application's routing system.

## Features

- **XPath Navigation**: Navigate through data structures using XPath expressions
- **Data Manipulation**: Built-in CRUD operations (merge, replace, append, delete)
- **Form Integration**: Form components that automatically update data at specified XPaths
- **Memory-only**: No browser URL integration - purely internal routing
- **TypeScript Support**: Full TypeScript support with strict typing
- **React Hooks**: Hook-based API for easy integration

## Installation

```bash
npm install @standardbeagle/data-router
```

## Basic Usage

```tsx
import { DataProvider, useXPath, useData, Link, Form, Button } from '@standardbeagle/data-router';

// Initialize with some data
const initialData = {
  users: [
    { id: 1, name: 'John', profile: { email: 'john@example.com' } }
  ],
  settings: { theme: 'light' }
};

function App() {
  return (
    <DataProvider initialData={initialData} initialXPath="/users[0]">
      <UserProfile />
    </DataProvider>
  );
}

function UserProfile() {
  const xpath = useXPath(); // "/users[0]"
  const targetData = useTargetData(); // { id: 1, name: 'John', profile: {...} }
  
  return (
    <div>
      <h1>Current Location: {xpath}</h1>
      <p>User: {targetData.name}</p>
      
      {/* Navigate to user's profile */}
      <Link to="profile">View Profile</Link>
      
      {/* Navigate to settings */}
      <Link to="/settings">Go to Settings</Link>
      
      {/* Form to update user data */}
      <Form targetXPath="/users[0]" operation="merge">
        <input name="name" defaultValue={targetData.name} />
        <Button dataAction="merge">Update User</Button>
      </Form>
    </div>
  );
}
```

## Core Concepts

### XPath Navigation
- **Absolute paths**: `/users[0]/profile/email`
- **Relative paths**: `profile/settings` (relative to current XPath)
- **Parent navigation**: `..` (go up one level), `../..` (go up two levels)

### Data Operations
- **merge**: Combine form data with existing object
- **replace**: Replace entire object/value at XPath
- **append**: Add to arrays or create new properties
- **delete**: Remove properties/array elements

### Components

#### DataProvider
Provides the data context and routing state.

```tsx
<DataProvider 
  initialData={myData} 
  initialXPath="/users[0]"
>
  {children}
</DataProvider>
```

#### Link
Navigate to different XPaths (read-only navigation).

```tsx
<Link to="/users[1]">Go to User 1</Link>
<Link to="../settings">Go to Settings</Link>
```

#### Form
Wrap form elements for data manipulation.

```tsx
<Form targetXPath="/users[0]" operation="merge">
  <input name="email" />
  <Button dataAction="merge">Save</Button>
</Form>
```

#### Button
Submit button with data manipulation capabilities.

```tsx
<Button 
  dataAction="replace" 
  targetXPath="/settings/theme"
  navigateTo="/settings"
>
  Update Theme
</Button>
```

### Hooks

- `useXPath()` - Get current XPath
- `useData()` - Get entire data object
- `useTargetData()` - Get data at current XPath
- `useNavigate()` - Get navigation function
- `useDataManipulation()` - Get data manipulation functions

## License

ISC