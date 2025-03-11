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
  useKey,
  AvailableShortcuts,
  getRegisteredShortcuts,
} from './useKey';

// For backward compatibility (deprecated)
export { useKey as useKeyboardShortcut } from './useKey';

export { ShortcutSheet, ShortcutSheetStyles } from './ShortcutSheet';

// Export utilities
export {
  normalizeKeyCombo,
  eventToKeyCombo,
  debounce,
  generateId,
} from './utils'; 