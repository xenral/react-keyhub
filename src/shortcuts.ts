import { ShortcutSettings, ShortcutScope, ShortcutStatus, ShortcutType } from './types';

/**
 * Default keyboard shortcuts
 */
export const defaultShortcuts: ShortcutSettings = {
  // File operations
  save: {
    keyCombo: 'ctrl+s',
    name: 'Save',
    description: 'Save the current document',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'File',
    type: ShortcutType.REGULAR
  },
  saveAs: {
    keyCombo: 'ctrl+shift+s',
    name: 'Save As',
    description: 'Save the current document with a new name',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'File',
    type: ShortcutType.REGULAR
  },
  print: {
    keyCombo: 'ctrl+p',
    name: 'Print',
    description: 'Print the current document',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'File',
    type: ShortcutType.REGULAR
  },
  newWindow: {
    keyCombo: 'ctrl+shift+n',
    name: 'New Window',
    description: 'Open a new window or tab',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'File',
    type: ShortcutType.REGULAR
  },
  
  // Edit operations
  find: {
    keyCombo: 'ctrl+f',
    name: 'Find',
    description: 'Find text in the current document',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Edit',
    type: ShortcutType.REGULAR
  },
  replace: {
    keyCombo: 'ctrl+h',
    name: 'Replace',
    description: 'Replace text in the current document',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Edit',
    type: ShortcutType.REGULAR
  },
  undo: {
    keyCombo: 'ctrl+z',
    name: 'Undo',
    description: 'Undo the last action',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Edit',
    type: ShortcutType.REGULAR
  },
  redo: {
    keyCombo: 'ctrl+y',
    name: 'Redo',
    description: 'Redo the last undone action',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Edit',
    type: ShortcutType.REGULAR
  },
  cut: {
    keyCombo: 'ctrl+x',
    name: 'Cut',
    description: 'Cut the selected content to the clipboard',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Edit',
    type: ShortcutType.REGULAR
  },
  copy: {
    keyCombo: 'ctrl+c',
    name: 'Copy',
    description: 'Copy the selected content to the clipboard',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Edit',
    type: ShortcutType.REGULAR
  },
  paste: {
    keyCombo: 'ctrl+v',
    name: 'Paste',
    description: 'Paste content from the clipboard',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Edit',
    type: ShortcutType.REGULAR
  },
  selectAll: {
    keyCombo: 'ctrl+a',
    name: 'Select All',
    description: 'Select all content in the current document',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Edit',
    type: ShortcutType.REGULAR
  },
  
  // Navigation
  goToLine: {
    keyCombo: 'ctrl+g',
    name: 'Go to Line',
    description: 'Navigate to a specific line',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Navigation',
    type: ShortcutType.REGULAR
  },
  goToFile: {
    keyCombo: 'ctrl+p',
    name: 'Go to File',
    description: 'Navigate to a specific file',
    scope: ShortcutScope.GLOBAL,
    priority: 90, // Lower priority than print
    status: ShortcutStatus.ENABLED,
    group: 'Navigation',
    context: 'editor', // Only active in editor context
    type: ShortcutType.REGULAR
  },
  
  // Help
  help: {
    keyCombo: 'f1',
    name: 'Help',
    description: 'Show help information',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Help',
    type: ShortcutType.REGULAR
  },
  showShortcuts: {
    keyCombo: 'ctrl+/',
    name: 'Show Shortcuts',
    description: 'Show all available keyboard shortcuts',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Help',
    type: ShortcutType.REGULAR
  },
  
  // Sequence shortcuts
  gitCommands: {
    sequence: 'g c',
    name: 'Git Commands',
    description: 'Show git commands menu',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Git',
    type: ShortcutType.SEQUENCE
  },
  gitStatus: {
    sequence: 'g s',
    name: 'Git Status',
    description: 'Show git status',
    scope: ShortcutScope.GLOBAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Git',
    type: ShortcutType.SEQUENCE
  },
  
  // Vim-like navigation (only active in vim context)
  vimUp: {
    keyCombo: 'k',
    name: 'Move Up',
    description: 'Move cursor up',
    scope: ShortcutScope.LOCAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Vim Navigation',
    context: 'vim',
    type: ShortcutType.REGULAR
  },
  vimDown: {
    keyCombo: 'j',
    name: 'Move Down',
    description: 'Move cursor down',
    scope: ShortcutScope.LOCAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Vim Navigation',
    context: 'vim',
    type: ShortcutType.REGULAR
  },
  vimLeft: {
    keyCombo: 'h',
    name: 'Move Left',
    description: 'Move cursor left',
    scope: ShortcutScope.LOCAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Vim Navigation',
    context: 'vim',
    type: ShortcutType.REGULAR
  },
  vimRight: {
    keyCombo: 'l',
    name: 'Move Right',
    description: 'Move cursor right',
    scope: ShortcutScope.LOCAL,
    priority: 100,
    status: ShortcutStatus.ENABLED,
    group: 'Vim Navigation',
    context: 'vim',
    type: ShortcutType.REGULAR
  }
}; 