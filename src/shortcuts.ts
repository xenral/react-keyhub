import { ShortcutSettings } from './types';

/**
 * Default keyboard shortcuts
 */
export const defaultShortcuts: ShortcutSettings = {
  // File operations
  save: {
    keyCombo: 'ctrl+s',
    name: 'Save',
    description: 'Save the current document',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'File',
    type: 'regular'
  },
  saveAs: {
    keyCombo: 'ctrl+shift+s',
    name: 'Save As',
    description: 'Save the current document with a new name',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'File',
    type: 'regular'
  },
  print: {
    keyCombo: 'ctrl+p',
    name: 'Print',
    description: 'Print the current document',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'File',
    type: 'regular'
  },
  newWindow: {
    keyCombo: 'ctrl+shift+n',
    name: 'New Window',
    description: 'Open a new window or tab',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'File',
    type: 'regular'
  },
  
  // Edit operations
  find: {
    keyCombo: 'ctrl+f',
    name: 'Find',
    description: 'Find text in the current document',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Edit',
    type: 'regular'
  },
  replace: {
    keyCombo: 'ctrl+h',
    name: 'Replace',
    description: 'Replace text in the current document',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Edit',
    type: 'regular'
  },
  undo: {
    keyCombo: 'ctrl+z',
    name: 'Undo',
    description: 'Undo the last action',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Edit',
    type: 'regular'
  },
  redo: {
    keyCombo: 'ctrl+y',
    name: 'Redo',
    description: 'Redo the last undone action',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Edit',
    type: 'regular'
  },
  cut: {
    keyCombo: 'ctrl+x',
    name: 'Cut',
    description: 'Cut the selected content to the clipboard',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Edit',
    type: 'regular'
  },
  copy: {
    keyCombo: 'ctrl+c',
    name: 'Copy',
    description: 'Copy the selected content to the clipboard',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Edit',
    type: 'regular'
  },
  paste: {
    keyCombo: 'ctrl+v',
    name: 'Paste',
    description: 'Paste content from the clipboard',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Edit',
    type: 'regular'
  },
  selectAll: {
    keyCombo: 'ctrl+a',
    name: 'Select All',
    description: 'Select all content in the current document',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Edit',
    type: 'regular'
  },
  
  // Navigation
  goToLine: {
    keyCombo: 'ctrl+g',
    name: 'Go to Line',
    description: 'Navigate to a specific line',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Navigation',
    type: 'regular'
  },
  goToFile: {
    keyCombo: 'ctrl+p',
    name: 'Go to File',
    description: 'Navigate to a specific file',
    scope: 'global',
    priority: 90, // Lower priority than print
    status: 'enabled',
    group: 'Navigation',
    context: 'editor', // Only active in editor context
    type: 'regular'
  },
  
  // Help
  help: {
    keyCombo: 'f1',
    name: 'Help',
    description: 'Show help information',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Help',
    type: 'regular'
  },
  showShortcuts: {
    keyCombo: 'ctrl+/',
    name: 'Show Shortcuts',
    description: 'Show all available keyboard shortcuts',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Help',
    type: 'regular'
  },
  
  // Sequence shortcuts
  gitCommands: {
    sequence: 'g c',
    name: 'Git Commands',
    description: 'Show git commands menu',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Git',
    type: 'sequence'
  },
  gitStatus: {
    sequence: 'g s',
    name: 'Git Status',
    description: 'Show git status',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    group: 'Git',
    type: 'sequence'
  },
  
  // Vim-like navigation (only active in vim context)
  vimUp: {
    keyCombo: 'k',
    name: 'Move Up',
    description: 'Move cursor up',
    scope: 'local',
    priority: 100,
    status: 'enabled',
    group: 'Vim Navigation',
    context: 'vim',
    type: 'regular'
  },
  vimDown: {
    keyCombo: 'j',
    name: 'Move Down',
    description: 'Move cursor down',
    scope: 'local',
    priority: 100,
    status: 'enabled',
    group: 'Vim Navigation',
    context: 'vim',
    type: 'regular'
  },
  vimLeft: {
    keyCombo: 'h',
    name: 'Move Left',
    description: 'Move cursor left',
    scope: 'local',
    priority: 100,
    status: 'enabled',
    group: 'Vim Navigation',
    context: 'vim',
    type: 'regular'
  },
  vimRight: {
    keyCombo: 'l',
    name: 'Move Right',
    description: 'Move cursor right',
    scope: 'local',
    priority: 100,
    status: 'enabled',
    group: 'Vim Navigation',
    context: 'vim',
    type: 'regular'
  }
}; 