/**
 * Represents the scope of a keyboard shortcut
 */
export enum ShortcutScope {
  GLOBAL = 'global',
  LOCAL = 'local'
}

/**
 * Represents the status of a keyboard shortcut
 */
export enum ShortcutStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled'
}

/**
 * Represents a context for keyboard shortcuts
 */
export type ShortcutContext = string;

/**
 * Represents the type of a keyboard shortcut
 */
export enum ShortcutType {
  REGULAR = 'regular',
  SEQUENCE = 'sequence'
}

/**
 * Base interface for all shortcut configurations
 */
export interface ShortcutConfigBase {
  /**
   * A human-readable name for the shortcut
   */
  name: string;
  
  /**
   * A detailed description of what the shortcut does
   */
  description: string;
  
  /**
   * The scope of the shortcut (global or local)
   */
  scope: ShortcutScope;
  
  /**
   * The priority of the shortcut (higher numbers take precedence)
   */
  priority: number;
  
  /**
   * The current status of the shortcut
   */
  status: ShortcutStatus;
  
  /**
   * An optional default action to execute when the shortcut is triggered
   */
  action?: (e: KeyboardEvent) => void;
  
  /**
   * An optional group for the shortcut
   */
  group?: string;
  
  /**
   * An optional context for the shortcut
   */
  context?: ShortcutContext;
  
  /**
   * The type of shortcut
   */
  type: ShortcutType;
}

/**
 * Represents a regular keyboard shortcut configuration
 */
export interface ShortcutRegular extends ShortcutConfigBase {
  /**
   * The key combination for the shortcut (e.g., "ctrl+s", "ctrl+shift+n")
   */
  keyCombo: string;
  
  /**
   * The type of shortcut
   */
  type: ShortcutType.REGULAR;
}

/**
 * Represents a sequence keyboard shortcut configuration
 */
export interface ShortcutSequence extends ShortcutConfigBase {
  /**
   * The sequence of key combinations for the shortcut (e.g., "g i" for "g" followed by "i")
   */
  sequence: string;
  
  /**
   * The type of shortcut
   */
  type: ShortcutType.SEQUENCE;
}

/**
 * Represents a keyboard shortcut configuration
 */
export type ShortcutConfig = ShortcutRegular | ShortcutSequence;

/**
 * Represents a collection of keyboard shortcuts
 */
export interface ShortcutSettings {
  [key: string]: ShortcutConfig;
}

/**
 * Represents a callback function for a keyboard shortcut
 */
export type ShortcutCallback = (e: KeyboardEvent) => void;

/**
 * Represents a subscription to a keyboard shortcut
 */
export interface ShortcutSubscription {
  id: string;
  callback: ShortcutCallback;
  priority: number;
  shortcutId: string;
}

/**
 * Options for the EventBus
 */
export interface EventBusOptions {
  /**
   * Whether to prevent the default browser behavior when a shortcut is triggered
   */
  preventDefault?: boolean;
  
  /**
   * Whether to stop the propagation of the event when a shortcut is triggered
   */
  stopPropagation?: boolean;
  
  /**
   * The element to attach the event listener to (defaults to document)
   */
  target?: HTMLElement | Document;
  
  /**
   * The debounce time in milliseconds (defaults to 0, no debounce)
   */
  debounceTime?: number;
  
  /**
   * The timeout for sequence shortcuts in milliseconds (defaults to 1000)
   */
  sequenceTimeout?: number;
  
  /**
   * Whether to ignore keyboard events from input fields (defaults to true)
   */
  ignoreInputFields?: boolean;
  
  /**
   * Whether to ignore keyboard events that only contain modifier keys (defaults to true)
   */
  ignoreModifierOnlyEvents?: boolean;
}

/**
 * Options for the KeyHubProvider
 */
export interface KeyHubProviderProps {
  /**
   * The shortcut settings to use
   */
  shortcuts: ShortcutSettings;
  
  /**
   * Options for the EventBus
   */
  options?: EventBusOptions;
  
  /**
   * Children components
   */
  children: React.ReactNode;
}

/**
 * Options for the ShortcutSheet component
 */
export interface ShortcutSheetProps {
  /**
   * Whether to show the shortcut sheet
   */
  isOpen: boolean;
  
  /**
   * Callback to close the shortcut sheet
   */
  onClose: () => void;
  
  /**
   * Optional filter for the shortcuts to display
   */
  filter?: {
    scope?: ShortcutScope;
    search?: string;
    group?: string;
    context?: ShortcutContext;
  };
  
  /**
   * Optional custom class name for the shortcut sheet
   */
  className?: string;
  
  /**
   * Optional theme for the shortcut sheet
   */
  theme?: 'light' | 'dark' | 'auto';
  
  /**
   * Optional layout for the shortcut sheet
   */
  layout?: 'modal' | 'sidebar';
} 