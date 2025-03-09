import React, { useState } from 'react';
import { 
  KeyHubProvider, 
  useKeyboardShortcut, 
  defaultShortcuts,
  AvailableShortcuts,
  getRegisteredShortcuts,
  ShortcutScope,
  ShortcutStatus,
  ShortcutType,
  ShortcutSettings
} from '../src';

// Example component using the enhanced hook
const ShortcutDemo: React.FC = () => {
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  
  // The shortcutId will have type suggestions for all registered shortcuts
  // TypeScript will now show an error for non-existent shortcuts
  const isSaveRegistered = useKeyboardShortcut('save', (e) => {
    e.preventDefault();
    setLastTriggered('save');
    console.log('Save shortcut triggered!');
  });

  // Another example with a different shortcut
  const isUndoRegistered = useKeyboardShortcut('undo', (e) => {
    e.preventDefault();
    setLastTriggered('undo');
    setCount(prev => Math.max(0, prev - 1));
    console.log('Undo shortcut triggered!');
  });

  // Example with a sequence shortcut
  const isGitCommandsRegistered = useKeyboardShortcut('gitCommands', (e) => {
    e.preventDefault();
    setLastTriggered('gitCommands');
    console.log('Git Commands shortcut triggered!');
  });

  // Example with a button that increments counter
  const handleIncrement = () => {
    setCount(prev => prev + 1);
  };

  // Get all registered shortcuts for display
  const shortcuts = getRegisteredShortcuts();
  const shortcutList = Object.entries(shortcuts).map(([id, config]) => {
    const combo = config.type === ShortcutType.REGULAR 
      ? (config as any).keyCombo 
      : (config as any).sequence;
    return { id, name: config.name, combo };
  });

  // Example of type checking - this would cause a TypeScript error
  // Uncomment to see the error:
  // const invalidShortcut = useKeyboardShortcut('nonExistentShortcut', () => {});

  return (
    <div style={{ padding: '20px' }}>
      <h2>Keyboard Shortcut Demo</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Press the following shortcuts:</p>
        <ul>
          <li><strong>Ctrl+S</strong> - Save (registered: {isSaveRegistered ? 'Yes' : 'No'})</li>
          <li><strong>Ctrl+Z</strong> - Undo (registered: {isUndoRegistered ? 'Yes' : 'No'})</li>
          <li><strong>G then C</strong> - Git Commands (registered: {isGitCommandsRegistered ? 'Yes' : 'No'})</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Counter: {count}</p>
        <button onClick={handleIncrement}>Increment</button>
        <p><small>Use Ctrl+Z to undo increment</small></p>
      </div>
      
      {lastTriggered && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <p>Last triggered shortcut: <strong>{lastTriggered}</strong></p>
        </div>
      )}
      
      <div>
        <h3>All Registered Shortcuts</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Key Combo</th>
            </tr>
          </thead>
          <tbody>
            {shortcutList.map(shortcut => (
              <tr key={shortcut.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{shortcut.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{shortcut.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{shortcut.combo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Custom shortcuts example
const customShortcuts = {
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

// Main app with provider
const UseKeyboardShortcutExample: React.FC = () => {
  return (
    <KeyHubProvider shortcuts={customShortcuts}>
      <ShortcutDemo />
    </KeyHubProvider>
  );
};

export default UseKeyboardShortcutExample; 