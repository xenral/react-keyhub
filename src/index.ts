// Export types
export * from './types';

// Export core functionality
export { EventBus } from './EventBus';
export { defaultShortcuts } from './shortcuts';

// Export React components and hooks
export {
  KeyHubProvider,
  useKeyHub,
  useShortcutSheet,
  useShortcutStatus,
  useShortcutUpdate,
  useShortcutRegister,
  useShortcutContext,
  useShortcutPause,
  useShortcutGroups,
  useShortcutsByGroup,
} from './KeyHubContext';

// Export enhanced keyboard shortcut hook
export {
  useShortcut,
  AvailableShortcuts,
  getRegisteredShortcuts,
} from './useShortcut';

// For backward compatibility
export { useShortcut as useKeyboardShortcut } from './useShortcut';
export { useShortcut as useKey } from './useShortcut';

export { ShortcutSheet, ShortcutSheetStyles } from './ShortcutSheet';

// Export utilities
export {
  normalizeKeyCombo,
  eventToKeyCombo,
  debounce,
  generateId,
} from './utils'; 