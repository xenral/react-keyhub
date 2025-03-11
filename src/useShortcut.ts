import { useEffect, useRef } from 'react';
import { useKeyHub, useKeyHubShortcuts } from './KeyHubContext';
import { ShortcutCallback, ShortcutSettings } from './types';
import { normalizeKeyCombo } from './utils';

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
  const subscriptionIdRef = useRef<string | null>(null);
  const isRegisteredRef = useRef<boolean>(false);
  
  // Store the callback in a ref to avoid dependency issues
  const callbackRef = useRef(callback);
  
  // Update the callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // This effect handles the subscription and only runs when shortcutId or eventBus changes
  useEffect(() => {
    try {
      // Check if the shortcut exists in the registered shortcuts
      isRegisteredRef.current = shortcutId in shortcuts;

      if (!isRegisteredRef.current) {
        console.warn(`Shortcut "${String(shortcutId)}" is not registered. Available shortcuts: ${Object.keys(shortcuts).join(', ')}`);
        return;
      }

      // Get the shortcut configuration
      const shortcut = shortcuts[shortcutId];
      const normalizedKeyCombo = shortcut.type === 'sequence' 
        ? shortcutId as string 
        : normalizeKeyCombo(shortcut.keyCombo);
      
      console.log(`Registering shortcut "${String(shortcutId)}" with key combo "${normalizedKeyCombo}"`);
      
      // Create a stable wrapper function that calls the current callback from the ref
      const stableCallback: ShortcutCallback = (event) => {
        callbackRef.current(event);
      };
      
      // Register the callback - this is the critical part
      const id = eventBus.on(shortcutId as string, stableCallback);
      subscriptionIdRef.current = id;
      
      // Log for debugging
      console.log(`Registered shortcut "${String(shortcutId)}" with subscription ID: ${id}`);
      
      // Cleanup function
      return () => {
        if (subscriptionIdRef.current) {
          console.log(`Unregistering shortcut "${String(shortcutId)}" with subscription ID: ${subscriptionIdRef.current}`);
          eventBus.off(subscriptionIdRef.current);
          subscriptionIdRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error in useShortcut:', error);
      return undefined;
    }
  }, [eventBus, shortcutId, shortcuts]); // Removed callback from dependencies

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