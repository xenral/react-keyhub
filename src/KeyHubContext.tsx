import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { EventBus } from './EventBus';
import { ShortcutSettings, KeyHubProviderProps, ShortcutCallback, ShortcutContext, ShortcutConfig } from './types';
import { defaultShortcuts } from './shortcuts';

// Create a more specific context type that includes the shortcuts
interface KeyHubContextValue {
  eventBus: EventBus;
  shortcuts: ShortcutSettings;
}

// Create the context
const KeyHubContext = createContext<KeyHubContextValue | null>(null);

/**
 * Provider component for the KeyHub context
 */
export const KeyHubProvider: React.FC<KeyHubProviderProps> = ({
  shortcuts = defaultShortcuts,
  options = {},
  children,
}) => {
  // Create the event bus instance
  const [eventBus] = useState(() => new EventBus(shortcuts, options));

  // Create the context value with both eventBus and shortcuts
  const contextValue = {
    eventBus,
    shortcuts
  };

  // Clean up the event bus when the component unmounts
  useEffect(() => {
    return () => {
      eventBus.destroy();
    };
  }, [eventBus]);

  return (
    <KeyHubContext.Provider value={contextValue}>
      {children}
    </KeyHubContext.Provider>
  );
};

/**
 * Hook to access the KeyHub event bus
 * @returns The KeyHub event bus instance
 */
export const useKeyHub = (): EventBus => {
  const context = useContext(KeyHubContext);
  
  if (!context) {
    throw new Error('useKeyHub must be used within a KeyHubProvider');
  }
  
  return context.eventBus;
};

/**
 * Hook to access the shortcuts provided to the KeyHub provider
 * @returns The shortcuts provided to the KeyHub provider
 */
export const useKeyHubShortcuts = (): ShortcutSettings => {
  const context = useContext(KeyHubContext);
  
  if (!context) {
    throw new Error('useKeyHubShortcuts must be used within a KeyHubProvider');
  }
  
  return context.shortcuts;
};

/**
 * Hook to subscribe to a keyboard shortcut
 * @param shortcutId The ID of the shortcut to subscribe to
 * @param callback The callback to execute when the shortcut is triggered
 */
export const useShortcut = <T extends keyof ShortcutSettings>(
  shortcutId: T,
  callback?: ShortcutCallback
): void => {
  const eventBus = useKeyHub();
  
  useEffect(() => {
    if (!callback) return;
    
    const subscriptionId = eventBus.on(shortcutId as string, callback);
    
    return () => {
      if (subscriptionId) {
        eventBus.off(subscriptionId);
      }
    };
  }, [eventBus, shortcutId, callback]);
};

/**
 * Hook to get all registered shortcuts
 * @returns All registered shortcuts
 */
export const useShortcutSheet = (): ShortcutSettings => {
  const eventBus = useKeyHub();
  return eventBus.getShortcuts();
};

/**
 * Hook to get shortcuts by group
 * @param group The group to filter by
 * @returns The shortcuts in the specified group
 */
export const useShortcutsByGroup = (group: string): ShortcutSettings => {
  const eventBus = useKeyHub();
  return eventBus.getShortcutsByGroup(group);
};

/**
 * Hook to get all shortcut groups
 * @returns An array of unique group names
 */
export const useShortcutGroups = (): string[] => {
  const eventBus = useKeyHub();
  return eventBus.getShortcutGroups();
};

/**
 * Hook to enable or disable a shortcut
 * @param shortcutId The ID of the shortcut to enable or disable
 * @param enabled Whether the shortcut should be enabled
 */
export const useShortcutStatus = <T extends keyof ShortcutSettings>(
  shortcutId: T,
  enabled: boolean
): void => {
  const eventBus = useKeyHub();
  
  useEffect(() => {
    if (enabled) {
      eventBus.enableShortcut(shortcutId as string);
    } else {
      eventBus.disableShortcut(shortcutId as string);
    }
  }, [eventBus, shortcutId, enabled]);
};

/**
 * Hook to update a shortcut configuration
 * @param shortcutId The ID of the shortcut to update
 * @param config The new configuration
 */
export const useShortcutUpdate = <T extends keyof ShortcutSettings>(
  shortcutId: T,
  config: Partial<ShortcutSettings[T]>
): void => {
  const eventBus = useKeyHub();
  
  useEffect(() => {
    eventBus.updateShortcut(shortcutId as string, config);
  }, [eventBus, shortcutId, config]);
};

/**
 * Hook to register a new shortcut
 * @param shortcutId The ID of the shortcut to register
 * @param config The shortcut configuration
 */
export const useShortcutRegister = <T extends string>(
  shortcutId: T,
  config: ShortcutConfig
): void => {
  const eventBus = useKeyHub();
  
  useEffect(() => {
    eventBus.registerShortcut(shortcutId, config);
    
    return () => {
      eventBus.unregisterShortcut(shortcutId);
    };
  }, [eventBus, shortcutId, config]);
};

/**
 * Hook to set the active context
 * @param context The context to set as active
 */
export const useShortcutContext = (context: ShortcutContext | null): void => {
  const eventBus = useKeyHub();
  
  useEffect(() => {
    eventBus.setContext(context);
  }, [eventBus, context]);
};

/**
 * Hook to pause and resume the event bus
 * @param paused Whether the event bus should be paused
 */
export const useShortcutPause = (paused: boolean): void => {
  const eventBus = useKeyHub();
  
  useEffect(() => {
    if (paused) {
      eventBus.pause();
    } else {
      eventBus.resume();
    }
  }, [eventBus, paused]);
}; 