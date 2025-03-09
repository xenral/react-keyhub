# React KeyHub

A lightweight, scalable keyboard shortcut manager for React applications with TypeScript support.

[![npm version](https://img.shields.io/npm/v/react-keyhub.svg)](https://www.npmjs.com/package/react-keyhub)
[![npm downloads](https://img.shields.io/npm/dm/react-keyhub.svg)](https://www.npmjs.com/package/react-keyhub)
[![license](https://img.shields.io/npm/l/react-keyhub.svg)](https://github.com/alimorshedzadeh/react-keyhub/blob/main/LICENSE)
[![CI](https://github.com/alimorshedzadeh/react-keyhub/actions/workflows/ci.yml/badge.svg)](https://github.com/alimorshedzadeh/react-keyhub/actions/workflows/ci.yml)

## Features

- 🔑 **Central Configuration**: Define all keyboard shortcuts in one place
- 🔄 **Type Safety**: Full TypeScript support for shortcut definitions and hooks
- 🎯 **Optimized Performance**: Single event listener with efficient lookup
- 🧩 **Modular API**: Subscribe to shortcuts from any component
- 📋 **Built-in Shortcut Sheet**: Display all registered shortcuts in a user-friendly format
- 🔌 **Zero Dependencies**: No external dependencies (aside from React)
- 🔄 **Dynamic Updates**: Enable, disable, or modify shortcuts at runtime
- 🌐 **Context Awareness**: Define shortcuts that only work in specific contexts
- 🔢 **Sequence Support**: Create shortcuts that require a sequence of key presses
- 🎨 **Theming Support**: Light, dark, and auto themes for the shortcut sheet
- 📱 **Responsive Layouts**: Modal, sidebar, and inline layouts for the shortcut sheet

## Installation

```bash
npm install react-keyhub
# or
yarn add react-keyhub
```

## Quick Start

```tsx
import React, { useState } from 'react';
import { 
  KeyHubProvider, 
  useShortcut, 
  ShortcutSheet,
  defaultShortcuts 
} from 'react-keyhub';

// Define your shortcuts (or use the default ones)
const myShortcuts = {
  ...defaultShortcuts,
  customAction: {
    keyCombo: 'ctrl+k',
    name: 'Custom Action',
    description: 'Perform a custom action',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Custom',
    type: 'regular'
  },
};

// Your app component
function App() {
  return (
    <KeyHubProvider shortcuts={myShortcuts}>
      <MyComponent />
    </KeyHubProvider>
  );
}

// A component that uses shortcuts
function MyComponent() {
  const [count, setCount] = useState(0);
  const [isShortcutSheetOpen, setIsShortcutSheetOpen] = useState(false);
  
  // Subscribe to the "save" shortcut
  useShortcut('save', (e) => {
    console.log('Save shortcut triggered!');
    // Your save logic here
  });
  
  // Subscribe to the "customAction" shortcut
  useShortcut('customAction', () => {
    setCount(count + 1);
  });
  
  // Subscribe to the "showShortcuts" shortcut to toggle the shortcut sheet
  useShortcut('showShortcuts', () => {
    setIsShortcutSheetOpen(!isShortcutSheetOpen);
  });
  
  return (
    <div>
      <h1>React KeyHub Demo</h1>
      <p>Count: {count}</p>
      <p>Press Ctrl+K to increment the count</p>
      <p>Press Ctrl+/ to show the shortcut sheet</p>
      
      {/* Render the shortcut sheet */}
      <ShortcutSheet 
        isOpen={isShortcutSheetOpen} 
        onClose={() => setIsShortcutSheetOpen(false)} 
      />
    </div>
  );
}
```

## API Reference

### `KeyHubProvider`

The provider component that makes shortcuts available throughout your application.

```tsx
<KeyHubProvider 
  shortcuts={myShortcuts} 
  options={{ 
    preventDefault: true,
    stopPropagation: true,
    debounceTime: 0,
    sequenceTimeout: 1000,
    ignoreInputFields: true,
    ignoreModifierOnlyEvents: true
  }}
>
  {children}
</KeyHubProvider>
```

#### Props

- `shortcuts`: A record of shortcut configurations
- `options` (optional):
  - `preventDefault`: Whether to prevent the default browser behavior (default: `true`)
  - `stopPropagation`: Whether to stop event propagation (default: `true`)
  - `target`: The element to attach the event listener to (default: `document`)
  - `debounceTime`: Debounce time in milliseconds (default: `0`)
  - `sequenceTimeout`: Timeout for sequence shortcuts in milliseconds (default: `1000`)
  - `ignoreInputFields`: Whether to ignore keyboard events from input fields (default: `true`)
  - `ignoreModifierOnlyEvents`: Whether to ignore keyboard events that only contain modifier keys (default: `true`)

### `useShortcut`

A hook to subscribe to a keyboard shortcut.

```tsx
useShortcut('save', (e) => {
  console.log('Save shortcut triggered!');
  // Your save logic here
});
```

#### Parameters

- `shortcutId`: The ID of the shortcut to subscribe to
- `callback`: The callback to execute when the shortcut is triggered

### `useShortcutSheet`

A hook to get all registered shortcuts.

```tsx
const shortcuts = useShortcutSheet();
```

### `useShortcutStatus`

A hook to enable or disable a shortcut.

```tsx
useShortcutStatus('save', true); // Enable the "save" shortcut
useShortcutStatus('save', false); // Disable the "save" shortcut
```

### `useShortcutUpdate`

A hook to update a shortcut configuration.

```tsx
useShortcutUpdate('save', {
  keyCombo: 'ctrl+shift+s',
  priority: 200,
});
```

### `useShortcutRegister`

A hook to register a new shortcut dynamically.

```tsx
useShortcutRegister('myDynamicShortcut', {
  keyCombo: 'ctrl+d',
  name: 'Dynamic Shortcut',
  description: 'A dynamically registered shortcut',
  scope: 'global',
  priority: 100,
  status: 'enabled',
  group: 'Dynamic',
  type: 'regular'
});
```

### `useShortcutContext`

A hook to set the active context.

```tsx
useShortcutContext('editor'); // Set the active context to "editor"
useShortcutContext(null); // Clear the active context
```

### `useShortcutPause`

A hook to pause and resume the event bus.

```tsx
useShortcutPause(true); // Pause all shortcuts
useShortcutPause(false); // Resume all shortcuts
```

### `useShortcutGroups`

A hook to get all shortcut groups.

```tsx
const groups = useShortcutGroups(); // Returns an array of group names
```

### `useShortcutsByGroup`

A hook to get shortcuts by group.

```tsx
const fileShortcuts = useShortcutsByGroup('File'); // Returns all shortcuts in the "File" group
```

### `useKeyHub`

A hook to access the KeyHub event bus directly.

```tsx
const eventBus = useKeyHub();

// Now you can use the event bus methods
eventBus.on('save', callback);
eventBus.off(subscriptionId);
eventBus.enableShortcut('save');
eventBus.disableShortcut('save');
eventBus.updateShortcut('save', { priority: 200 });
eventBus.registerShortcut('myShortcut', { ... });
eventBus.unregisterShortcut('myShortcut');
eventBus.setContext('editor');
eventBus.getContext();
eventBus.pause();
eventBus.resume();
eventBus.getShortcuts();
eventBus.getShortcutsByGroup('File');
eventBus.getShortcutGroups();
```

### `ShortcutSheet`

A component to display all registered shortcuts.

```tsx
<ShortcutSheet 
  isOpen={isOpen} 
  onClose={handleClose} 
  filter={{ 
    scope: 'global',
    search: 'save',
    group: 'File',
    context: 'editor'
  }}
  className="custom-class"
  theme="dark" // 'light', 'dark', or 'auto'
  layout="modal" // 'modal', 'sidebar', or 'inline'
/>
```

#### Props

- `isOpen`: Whether the shortcut sheet is open
- `onClose`: Callback to close the shortcut sheet
- `filter` (optional):
  - `scope`: Filter shortcuts by scope (`'global'`, `'local'`, or `undefined`)
  - `search`: Filter shortcuts by search term
  - `group`: Filter shortcuts by group
  - `context`: Filter shortcuts by context
- `className` (optional): Custom class name for the shortcut sheet
- `theme` (optional): Theme for the shortcut sheet (`'light'`, `'dark'`, or `'auto'`)
- `layout` (optional): Layout for the shortcut sheet (`'modal'`, `'sidebar'`, or `'inline'`)

### `ShortcutSheetStyles`

A string of CSS styles for the ShortcutSheet component.

```tsx
import { ShortcutSheetStyles } from 'react-keyhub';

// Add the styles to your app
const App = () => (
  <>
    <style>{ShortcutSheetStyles}</style>
    {/* Your app content */}
  </>
);
```

## Shortcut Configuration

Each shortcut is defined with the following properties:

### Regular Shortcut

```tsx
{
  keyCombo: 'ctrl+s',
  name: 'Save',
  description: 'Save the current document',
  scope: 'global',
  priority: 100,
  status: 'enabled',
  group: 'File',
  context: 'editor', // Optional
  type: 'regular',
  action: (e) => { /* Optional default action */ }
}
```

### Sequence Shortcut

```tsx
{
  sequence: 'g c', // 'g' followed by 'c'
  name: 'Git Commands',
  description: 'Show git commands menu',
  scope: 'global',
  priority: 100,
  status: 'enabled',
  group: 'Git',
  context: 'editor', // Optional
  type: 'sequence',
  action: (e) => { /* Optional default action */ }
}
```

### Properties

- `keyCombo` (for regular shortcuts): The key combination (e.g., `'ctrl+s'`, `'ctrl+shift+n'`)
- `sequence` (for sequence shortcuts): The sequence of key combinations (e.g., `'g c'` for "g" followed by "c")
- `name`: A human-readable name for the shortcut
- `description`: A detailed description of what the shortcut does
- `scope`: Either `'global'` or `'local'`
- `priority`: The priority of the shortcut (higher numbers take precedence)
- `status`: Either `'enabled'` or `'disabled'`
- `group`: A group for the shortcut (used for organizing in the shortcut sheet)
- `context` (optional): A context for the shortcut (only active when the context matches)
- `type`: Either `'regular'` or `'sequence'`
- `action` (optional): A default action to execute when the shortcut is triggered

## Default Shortcuts

React KeyHub comes with a set of default shortcuts organized by groups:

### File Operations
- `save`: Ctrl+S
- `saveAs`: Ctrl+Shift+S
- `print`: Ctrl+P
- `newWindow`: Ctrl+Shift+N

### Edit Operations
- `find`: Ctrl+F
- `replace`: Ctrl+H
- `undo`: Ctrl+Z
- `redo`: Ctrl+Y
- `cut`: Ctrl+X
- `copy`: Ctrl+C
- `paste`: Ctrl+V
- `selectAll`: Ctrl+A

### Navigation
- `goToLine`: Ctrl+G
- `goToFile`: Ctrl+P (lower priority than print)

### Help
- `help`: F1
- `showShortcuts`: Ctrl+/

### Git (Sequence Shortcuts)
- `gitCommands`: g c (press "g" then "c")
- `gitStatus`: g s (press "g" then "s")

### Vim Navigation (Context-Specific)
- `vimUp`: k (only active in "vim" context)
- `vimDown`: j (only active in "vim" context)
- `vimLeft`: h (only active in "vim" context)
- `vimRight`: l (only active in "vim" context)

You can use these as a starting point and override or extend them as needed.

## Advanced Usage

### Context-Aware Shortcuts

```tsx
// Define shortcuts with contexts
const myShortcuts = {
  ...defaultShortcuts,
  editorSave: {
    keyCombo: 'ctrl+s',
    name: 'Save',
    description: 'Save the current document',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'File',
    context: 'editor', // Only active in "editor" context
    type: 'regular'
  },
  terminalClear: {
    keyCombo: 'ctrl+l',
    name: 'Clear Terminal',
    description: 'Clear the terminal',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Terminal',
    context: 'terminal', // Only active in "terminal" context
    type: 'regular'
  }
};

// In your component, set the active context
function EditorComponent() {
  // Set the active context to "editor"
  useShortcutContext('editor');
  
  // ...
}

function TerminalComponent() {
  // Set the active context to "terminal"
  useShortcutContext('terminal');
  
  // ...
}
```

### Sequence Shortcuts

```tsx
// Define sequence shortcuts
const myShortcuts = {
  ...defaultShortcuts,
  gitCommit: {
    sequence: 'g c', // Press "g" then "c"
    name: 'Git Commit',
    description: 'Open git commit dialog',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Git',
    type: 'sequence'
  }
};

// Subscribe to the sequence shortcut
function MyComponent() {
  useShortcut('gitCommit', () => {
    console.log('Git commit dialog opened');
  });
  
  // ...
}
```

### Dynamic Shortcut Registration

```tsx
function MyComponent() {
  // Register a dynamic shortcut
  useShortcutRegister('dynamicShortcut', {
    keyCombo: 'ctrl+d',
    name: 'Dynamic Shortcut',
    description: 'A dynamically registered shortcut',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Dynamic',
    type: 'regular',
    action: () => {
      console.log('Dynamic shortcut triggered!');
    }
  });
  
  // The shortcut will be automatically unregistered when the component unmounts
  
  // ...
}
```

### Pausing and Resuming Shortcuts

```tsx
function MyComponent() {
  const [isPaused, setIsPaused] = useState(false);
  
  // Pause or resume all shortcuts
  useShortcutPause(isPaused);
  
  return (
    <div>
      <button onClick={() => setIsPaused(!isPaused)}>
        {isPaused ? 'Resume Shortcuts' : 'Pause Shortcuts'}
      </button>
    </div>
  );
}
```

### Themed Shortcut Sheet

```tsx
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Show Shortcuts</button>
      
      <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto (System)</option>
      </select>
      
      <ShortcutSheet 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        theme={theme}
      />
    </div>
  );
}
```

### Different Layouts

```tsx
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [layout, setLayout] = useState<'modal' | 'sidebar' | 'inline'>('modal');
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Show Shortcuts</button>
      
      <select value={layout} onChange={(e) => setLayout(e.target.value as any)}>
        <option value="modal">Modal</option>
        <option value="sidebar">Sidebar</option>
        <option value="inline">Inline</option>
      </select>
      
      {layout === 'inline' && isOpen ? (
        <div className="inline-container">
          <ShortcutSheet 
            isOpen={true} 
            onClose={() => setIsOpen(false)} 
            layout="inline"
          />
        </div>
      ) : (
        <ShortcutSheet 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          layout={layout}
        />
      )}
    </div>
  );
}
```


## Browser Support

React KeyHub works in all modern browsers that support React.

## License

MIT 