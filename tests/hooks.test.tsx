import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { render, screen } from '@testing-library/react';
import { 
  KeyHubProvider, 
  useKeyHub, 
  useShortcut, 
  useShortcutSheet,
  useShortcutStatus,
  useShortcutUpdate
} from '../src/KeyHubContext';
import { ShortcutSettings } from '../src/types';

// Mock shortcuts for testing
const mockShortcuts: ShortcutSettings = {
  save: {
    keyCombo: 'ctrl+s',
    name: 'Save',
    description: 'Save the current document',
    scope: 'global',
    priority: 100,
    status: 'enabled',
  },
  print: {
    keyCombo: 'ctrl+p',
    name: 'Print',
    description: 'Print the current document',
    scope: 'global',
    priority: 100,
    status: 'enabled',
  },
};

// Wrapper component for testing hooks
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <KeyHubProvider shortcuts={mockShortcuts}>
    {children}
  </KeyHubProvider>
);

describe('KeyHub Hooks', () => {
  test('useKeyHub should return the event bus instance', () => {
    const { result } = renderHook(() => useKeyHub(), { wrapper: Wrapper });
    expect(result.current).toBeDefined();
  });

  test('useKeyHub should throw an error when used outside of KeyHubProvider', () => {
    const { result } = renderHook(() => useKeyHub());
    expect(result.error).toEqual(Error('useKeyHub must be used within a KeyHubProvider'));
  });

  test('useShortcut should subscribe to a shortcut', () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useShortcut('save', callback), { wrapper: Wrapper });
    
    // No direct way to test the subscription, but we can verify it doesn't throw
    expect(callback).not.toHaveBeenCalled();
    unmount();
  });

  test('useShortcutSheet should return all shortcuts', () => {
    const { result } = renderHook(() => useShortcutSheet(), { wrapper: Wrapper });
    expect(result.current).toEqual(mockShortcuts);
  });

  test('useShortcutStatus should enable and disable shortcuts', () => {
    const { result: eventBusResult } = renderHook(() => useKeyHub(), { wrapper: Wrapper });
    const { rerender } = renderHook(
      ({ enabled }) => useShortcutStatus('save', enabled),
      { 
        initialProps: { enabled: false },
        wrapper: Wrapper 
      }
    );
    
    expect(eventBusResult.current.getShortcuts().save.status).toBe('disabled');
    
    rerender({ enabled: true });
    expect(eventBusResult.current.getShortcuts().save.status).toBe('enabled');
  });

  test('useShortcutUpdate should update shortcut configuration', () => {
    const { result: eventBusResult } = renderHook(() => useKeyHub(), { wrapper: Wrapper });
    renderHook(
      () => useShortcutUpdate('save', { priority: 200 }),
      { wrapper: Wrapper }
    );
    
    expect(eventBusResult.current.getShortcuts().save.priority).toBe(200);
  });
}); 