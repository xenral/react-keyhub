# KeyHub Examples

This directory contains examples of how to use the KeyHub library.

## Enhanced Keyboard Shortcut Hook

The `useKeyboardShortcut` hook is an enhanced version of the `useShortcut` hook that provides type suggestions for registered shortcuts and ensures proper functionality.

### Features

- **Type Safety**: The hook provides type suggestions for registered shortcuts on the first argument, with compile-time checking against the actual shortcuts provided to the KeyHubProvider.
- **Error Handling**: The hook checks if the shortcut is registered and provides a warning if it's not.
- **Return Value**: The hook returns a boolean indicating if the shortcut is registered.

### Usage

```tsx
import { useKeyboardShortcut } from 'react-keyhub';

function MyComponent() {
  // The shortcutId will have type suggestions for all registered shortcuts
  // TypeScript will show an error for non-existent shortcuts
  const isSaveRegistered = useKeyboardShortcut('save', (e) => {
    e.preventDefault();
    console.log('Save shortcut triggered!');
  });

  return (
    <div>
      <p>Save shortcut registered: {isSaveRegistered ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Type Safety

The hook uses the actual shortcuts provided to the KeyHubProvider for type checking:

```tsx
import { 
  ShortcutScope, 
  ShortcutStatus, 
  ShortcutType, 
  ShortcutSettings 
} from 'react-keyhub';

// Define custom shortcuts
const myShortcuts = {
  ...defaultShortcuts,
  customAction: {
    keyCombo: 'ctrl+shift+c',
    name: 'Custom Action',
    description: 'A custom action shortcut',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Custom',
    type: ShortcutType.REGULAR
  }
} as ShortcutSettings;

// In your component
function MyComponent() {
  // This will work fine
  useKeyboardShortcut('customAction', () => {});
  
  // This will cause a TypeScript error
  useKeyboardShortcut('nonExistentShortcut', () => {});
}
```

### Available Shortcuts

You can use the `AvailableShortcuts` type to get type suggestions for all registered shortcuts:

```tsx
import { AvailableShortcuts } from 'react-keyhub';

// This will have type suggestions for all registered shortcuts
// based on what's provided to the KeyHubProvider
const shortcutId: AvailableShortcuts = 'save';
```

### Getting All Registered Shortcuts

You can use the `getRegisteredShortcuts` function to get all registered shortcuts:

```tsx
import { getRegisteredShortcuts } from 'react-keyhub';

function MyComponent() {
  const shortcuts = getRegisteredShortcuts();
  
  return (
    <div>
      <h2>Registered Shortcuts</h2>
      <ul>
        {Object.entries(shortcuts).map(([id, config]) => (
          <li key={id}>
            {id}: {config.name} - {config.type === ShortcutType.REGULAR 
              ? (config as any).keyCombo 
              : (config as any).sequence}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Running the Examples

To run the examples, follow these steps:

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser and navigate to `http://localhost:3000`

## Example Components

- `UseKeyboardShortcutExample.tsx`: Demonstrates how to use the `useKeyboardShortcut` hook with type suggestions. 