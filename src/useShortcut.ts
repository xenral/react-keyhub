import { useEffect, useRef, useCallback } from 'react';
import { useKeyHub, useKeyHubShortcuts } from './KeyHubContext';
import { ShortcutCallback, ShortcutSettings, EventBusOptions } from './types';
import { normalizeKeyCombo, eventToKeyCombo } from './utils';

/**
 * Type helper to get the available shortcuts from the current provider
 */
export type ProviderShortcuts = ReturnType<typeof useKeyHubShortcuts>;

/**
 * Type for available shortcut keys in the current provider
 */
export type AvailableShortcuts = keyof ProviderShortcuts;

/**
 * Enhanced hook to subscribe to a keyboard shortcut with type suggestions
 * @param shortcutId The ID of the shortcut to subscribe to (with autocomplete)
 * @param callback The callback to execute when the shortcut is triggered
 * @returns A boolean indicating if the shortcut is registered
 * @example
 * // Will suggest all registered shortcuts like 'save', 'undo', etc.
 * const isSaveRegistered = useShortcut('save', (e) => {
 *   console.log('Save triggered!');
 * });
 */
export function useShortcut<T extends AvailableShortcuts>(
  shortcutId: T,
  callback: ShortcutCallback
): boolean {
  const eventBus = useKeyHub();
  const shortcuts = useKeyHubShortcuts();
  const isRegisteredRef = useRef<boolean>(false);
  
  // Store the callback in a ref to avoid dependency issues
  const callbackRef = useRef(callback);
  
  // Update the callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Create a stable handler function
  const keyboardHandler = useCallback((event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    
    // Skip if eventBus is paused
    if (!eventBus || (eventBus as any).paused) return;

    // Get the shortcut configuration
    const shortcut = shortcuts[shortcutId as string];
    if (!shortcut) return;

    // Skip if the shortcut is disabled
    if (shortcut.status === 'disabled') return;

    // Skip if the shortcut has a context and it doesn't match the active context
    const activeContext = eventBus.getContext?.();
    if (shortcut.context && activeContext !== shortcut.context) return;

    // Get the key combo from the event
    const keyCombo = eventToKeyCombo(keyboardEvent);
    const normalizedKeyCombo = normalizeKeyCombo(keyCombo);

    // Check if the key combo matches the shortcut
    let matches = false;
    
    if (shortcut.type === 'regular') {
      const shortcutKeyCombo = normalizeKeyCombo(shortcut.keyCombo);
      matches = shortcutKeyCombo === normalizedKeyCombo;
    } else if (shortcut.type === 'sequence') {
      // For sequence shortcuts, we need to check the sequence buffer
      // This is handled by the EventBus, so we'll skip it for now
      return;
    }

    if (!matches) return;

    // Get the EventBus options
    const options = (eventBus as any).options as EventBusOptions;

    // Prevent default browser behavior if configured
    if (options?.preventDefault) {
      keyboardEvent.preventDefault();
    }

    // Stop propagation if configured
    if (options?.stopPropagation) {
      keyboardEvent.stopPropagation();
    }

    // Execute the callback
    try {
      callbackRef.current(keyboardEvent);
    } catch (error) {
      console.error(`Error executing callback for shortcut ${String(shortcutId)}:`, error);
    }
  }, [eventBus, shortcutId, shortcuts]);

  // This effect handles the direct event listener setup
  useEffect(() => {
    // Get the EventBus options
    const options = (eventBus as any)?.options as EventBusOptions | undefined;
    const target = options?.target;

    // Skip if eventBus is not available
    if (!eventBus || !target) {
      console.error('EventBus is not available. Make sure useShortcut is used within a KeyHubProvider.');
      isRegisteredRef.current = false;
      return;
    }

    try {
      // Check if the shortcut exists in the registered shortcuts
      isRegisteredRef.current = shortcutId in shortcuts;

      if (!isRegisteredRef.current) {
        console.warn(`Shortcut "${String(shortcutId)}" is not registered. Available shortcuts: ${Object.keys(shortcuts).join(', ')}`);
        return;
      }
      
      // Add the event listener
      target.addEventListener('keydown', keyboardHandler);
      
      // Return cleanup function
      return () => {
        target.removeEventListener('keydown', keyboardHandler);
      };
    } catch (error) {
      console.error(`Error in useShortcut for ${String(shortcutId)}:`, error);
      isRegisteredRef.current = false;
      return;
    }
  }, [eventBus, shortcutId, shortcuts, keyboardHandler]);

  return isRegisteredRef.current;
}

/**
 * Helper function to get all registered shortcuts
 * @returns All registered shortcuts from the provider
 */
export function getRegisteredShortcuts(): ShortcutSettings {
  try {
    const shortcuts = useKeyHubShortcuts();
    return shortcuts;
  } catch (error) {
    console.warn('Unable to get registered shortcuts:', error);
    return {};
  }
} 