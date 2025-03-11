import { useEffect, useRef } from 'react';
import { useKeyHub, useKeyHubShortcuts } from './KeyHubContext';
import { ShortcutCallback, ShortcutSettings } from './types';

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
 * const isSaveRegistered = useKey('save', (e) => {
 *   console.log('Save triggered!');
 * });
 */
export function useKey<T extends AvailableShortcuts>(
  shortcutId: T,
  callback: ShortcutCallback
): boolean {
  const eventBus = useKeyHub();
  const shortcuts = useKeyHubShortcuts();
  const subscriptionIdRef = useRef<string | null>(null);
  const isRegisteredRef = useRef<boolean>(false);

  useEffect(() => {
    try {
      // Check if the shortcut exists in the registered shortcuts
      isRegisteredRef.current = shortcutId in shortcuts;

      if (!isRegisteredRef.current) {
        console.warn(`Shortcut "${String(shortcutId)}" is not registered. Available shortcuts: ${Object.keys(shortcuts).join(', ')}`);
        return;
      }

      // Register the callback
      subscriptionIdRef.current = eventBus.on(shortcutId as string, callback);
      
      // Cleanup function
      return () => {
        if (subscriptionIdRef.current) {
          eventBus.off(subscriptionIdRef.current);
          subscriptionIdRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error in useKey:', error);
      return undefined;
    }
  }, [eventBus, shortcutId, callback, shortcuts]);

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