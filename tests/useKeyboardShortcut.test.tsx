import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  KeyHubProvider, 
  useKeyboardShortcut, 
  defaultShortcuts, 
  ShortcutScope,
  ShortcutStatus,
  ShortcutType,
  ShortcutSettings
} from '../src';

// Mock console.warn and console.error
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Custom shortcuts for testing
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

// Test component
const TestComponent = () => {
  const [lastTriggered, setLastTriggered] = React.useState<string | null>(null);
  
  // Register a valid shortcut
  const isSaveRegistered = useKeyboardShortcut('save', (e) => {
    setLastTriggered('save');
  });
  
  // Register a custom shortcut
  const isCustomRegistered = useKeyboardShortcut('customAction', (e) => {
    setLastTriggered('customAction');
  });
  
  // Register a non-existent shortcut (using type assertion to bypass TypeScript)
  const isNonExistentRegistered = useKeyboardShortcut('nonExistentShortcut' as any, (e) => {
    setLastTriggered('nonExistentShortcut');
  });
  
  return (
    <div>
      <div data-testid="save-status">{isSaveRegistered ? 'registered' : 'not-registered'}</div>
      <div data-testid="custom-status">{isCustomRegistered ? 'registered' : 'not-registered'}</div>
      <div data-testid="non-existent-status">{isNonExistentRegistered ? 'registered' : 'not-registered'}</div>
      {lastTriggered && <div data-testid="last-triggered">{lastTriggered}</div>}
    </div>
  );
};

describe('useKeyboardShortcut', () => {
  test('should register valid shortcuts', () => {
    render(
      <KeyHubProvider shortcuts={customShortcuts}>
        <TestComponent />
      </KeyHubProvider>
    );
    
    expect(screen.getByTestId('save-status')).toHaveTextContent('registered');
    expect(screen.getByTestId('custom-status')).toHaveTextContent('registered');
  });
  
  test('should not register non-existent shortcuts', () => {
    render(
      <KeyHubProvider shortcuts={customShortcuts}>
        <TestComponent />
      </KeyHubProvider>
    );
    
    expect(screen.getByTestId('non-existent-status')).toHaveTextContent('not-registered');
    expect(console.warn).toHaveBeenCalled();
  });
  
  test('should trigger callback when shortcut is pressed', () => {
    render(
      <KeyHubProvider shortcuts={customShortcuts}>
        <TestComponent />
      </KeyHubProvider>
    );
    
    // Simulate Ctrl+S keypress
    fireEvent.keyDown(document, { key: 's', ctrlKey: true });
    
    expect(screen.getByTestId('last-triggered')).toHaveTextContent('save');
    
    // Simulate Ctrl+Shift+C keypress for custom shortcut
    fireEvent.keyDown(document, { key: 'c', ctrlKey: true, shiftKey: true });
    
    expect(screen.getByTestId('last-triggered')).toHaveTextContent('customAction');
  });
  
  test('should handle errors gracefully', () => {
    // Mock useKeyHub to throw an error
    jest.mock('../src/KeyHubContext', () => ({
      ...jest.requireActual('../src/KeyHubContext'),
      useKeyHub: () => {
        throw new Error('Test error');
      },
    }));
    
    render(
      <KeyHubProvider shortcuts={customShortcuts}>
        <TestComponent />
      </KeyHubProvider>
    );
    
    expect(console.error).toHaveBeenCalled();
  });
}); 