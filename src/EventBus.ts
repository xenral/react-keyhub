import {
  ShortcutSettings,
  ShortcutCallback,
  ShortcutSubscription,
  EventBusOptions,
  ShortcutStatus,
  ShortcutContext,
  ShortcutSequence,
  ShortcutConfig,
  ShortcutRegular
} from './types';
import { normalizeKeyCombo, eventToKeyCombo, debounce, generateId } from './utils';

/**
 * Default options for the EventBus
 */
const DEFAULT_OPTIONS: EventBusOptions = {
  preventDefault: true,
  stopPropagation: true,
  target: typeof document !== 'undefined' ? document : undefined,
  debounceTime: 0,
  sequenceTimeout: 1000,
  ignoreInputFields: true,
  ignoreModifierOnlyEvents: true
};

/**
 * EventBus class for managing keyboard shortcuts
 */
export class EventBus {
  private shortcuts: ShortcutSettings;
  private subscriptions: Map<string, ShortcutSubscription[]>;
  private shortcutIdToSubscriptions: Map<string, ShortcutSubscription[]>;
  private options: Required<EventBusOptions>;
  private isListening: boolean;
  private handleKeyDown: (e: Event) => void;
  private activeContext: ShortcutContext | null = null;
  private sequenceBuffer: string[] = [];
  private sequenceTimer: ReturnType<typeof setTimeout> | null = null;
  private paused: boolean = false;
  private _shortcutIdToKeyCombo: Map<string, string> | null = null;

  /**
   * Creates a new EventBus instance
   * @param shortcuts The shortcut settings
   * @param options Options for the EventBus
   */
  constructor(shortcuts: ShortcutSettings, options: EventBusOptions = {}) {
    this.shortcuts = shortcuts;
    this.subscriptions = new Map();
    this.shortcutIdToSubscriptions = new Map();
    this.options = { ...DEFAULT_OPTIONS, ...options } as Required<EventBusOptions>;
    this.isListening = false;

    // Create the keydown handler
    const keydownHandler = (e: Event) => {
      if (this.paused) return;

      const event = e as KeyboardEvent;

      // Skip if we should ignore input fields and the event is from an input field
      if (
        this.options.ignoreInputFields &&
        (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          (event.target instanceof HTMLElement && event.target.isContentEditable))
      ) {
        return;
      }

      const keyCombo = eventToKeyCombo(event);

      // Skip if we should ignore modifier-only events and this is a modifier-only event
      if (
        this.options.ignoreModifierOnlyEvents &&
        ['ctrl', 'alt', 'shift', 'meta', 'ctrl+alt', 'ctrl+shift', 'ctrl+meta', 'alt+shift', 'alt+meta', 'shift+meta'].includes(keyCombo)
      ) {
        return;
      }

      // Handle sequence shortcuts
      this.handleSequence(keyCombo, event);

      // Handle regular shortcuts
      this.emit(keyCombo, event);
    };

    // Apply debounce if needed
    this.handleKeyDown = this.options.debounceTime > 0
      ? debounce(keydownHandler, this.options.debounceTime)
      : keydownHandler;

    // Start listening for keyboard events
    this.startListening();
  }

  /**
   * Starts listening for keyboard events
   */
  private startListening(): void {
    if (this.isListening || !this.options.target) return;

    this.options.target.addEventListener('keydown', this.handleKeyDown);
    this.isListening = true;
  }

  /**
   * Stops listening for keyboard events
   */
  public stopListening(): void {
    if (!this.isListening || !this.options.target) return;

    this.options.target.removeEventListener('keydown', this.handleKeyDown);
    this.isListening = false;
  }

  /**
   * Pauses the event bus (temporarily disables all shortcuts)
   */
  public pause(): void {
    this.paused = true;
  }

  /**
   * Resumes the event bus
   */
  public resume(): void {
    this.paused = false;
  }

  /**
   * Sets the active context
   * @param context The context to set as active
   */
  public setContext(context: ShortcutContext | null): void {
    this.activeContext = context;
  }

  /**
   * Gets the active context
   * @returns The active context
   */
  public getContext(): ShortcutContext | null {
    return this.activeContext;
  }

  /**
   * Handles sequence shortcuts
   * @param keyCombo The key combination that was triggered
   * @param event The original keyboard event
   */
  private handleSequence(keyCombo: string, event: KeyboardEvent): void {
    // Add the key combo to the sequence buffer
    this.sequenceBuffer.push(keyCombo);

    // Reset the sequence timer
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer);
    }

    // Set a new timer to clear the sequence buffer after the timeout
    this.sequenceTimer = setTimeout(() => {
      this.sequenceBuffer = [];
    }, this.options.sequenceTimeout);

    // Check if the current sequence matches any sequence shortcuts
    const currentSequence = this.sequenceBuffer.join(' ');

    // Find sequence shortcuts that match the current sequence
    const sequenceShortcuts = Object.entries(this.shortcuts)
      .filter(([_, config]) =>
        config.type === 'sequence' &&
        (config as ShortcutSequence).sequence === currentSequence
      );

    // If we found a match, emit the event and clear the sequence buffer
    if (sequenceShortcuts.length > 0) {
      sequenceShortcuts.forEach(([shortcutId, config]) => {
        // Skip if the shortcut is disabled
        if (config.status === 'disabled') return;

        // Skip if the shortcut has a context and it doesn't match the active context
        if (config.context && this.activeContext !== config.context) return;

        // Prevent default browser behavior if configured
        if (this.options.preventDefault) {
          event.preventDefault();
        }

        // Stop propagation if configured
        if (this.options.stopPropagation) {
          event.stopPropagation();
        }

        // Check if there are any subscriptions for this shortcut ID
        const shortcutSubscriptions = this.shortcutIdToSubscriptions.get(shortcutId) || [];
        
        if (shortcutSubscriptions.length > 0) {
          // Execute the highest priority subscription
          const subscription = shortcutSubscriptions[0]; // Already sorted by priority
          
          try {
            subscription.callback(event);
          } catch (error) {
            // Silent error handling
          }
        } else if (config.action) {
          // If no subscriptions but there's a default action, execute it
          try {
            config.action(event);
          } catch (error) {
            // Silent error handling
          }
        }
      });

      // Clear the sequence buffer
      this.sequenceBuffer = [];
      if (this.sequenceTimer) {
        clearTimeout(this.sequenceTimer);
        this.sequenceTimer = null;
      }
    }
  }

  /**
   * Subscribes to a keyboard shortcut
   * @param shortcutId The ID of the shortcut to subscribe to
   * @param callback The callback to execute when the shortcut is triggered
   * @returns A subscription ID that can be used to unsubscribe
   */
  public on(shortcutId: string, callback: ShortcutCallback): string {
    const shortcut = this.shortcuts[shortcutId];

    if (!shortcut) {
      return '';
    }

    // Get the key combo based on the shortcut type
    const keyCombo = shortcut.type === 'sequence'
      ? shortcutId
      : shortcut.keyCombo;

    // Normalize the key combo
    const normalizedKeyCombo = normalizeKeyCombo(keyCombo);

    const subscriptionId = generateId();

    const subscription: ShortcutSubscription = {
      id: subscriptionId,
      callback,
      priority: shortcut.priority,
      shortcutId // Store the shortcut ID with the subscription
    };

    // Store by normalized key combo
    if (!this.subscriptions.has(normalizedKeyCombo)) {
      this.subscriptions.set(normalizedKeyCombo, []);
    }
    
    // Get a reference to the array and then modify it
    const subscriptions = this.subscriptions.get(normalizedKeyCombo)!;
    subscriptions.push(subscription);
    subscriptions.sort((a, b) => b.priority - a.priority);
    
    // Also store by shortcut ID for direct lookup
    if (!this.shortcutIdToSubscriptions.has(shortcutId)) {
      this.shortcutIdToSubscriptions.set(shortcutId, []);
    }
    
    const shortcutSubscriptions = this.shortcutIdToSubscriptions.get(shortcutId)!;
    shortcutSubscriptions.push(subscription);
    shortcutSubscriptions.sort((a, b) => b.priority - a.priority);

    // Also store a mapping from shortcut ID to normalized key combo
    this._shortcutIdToKeyCombo = this._shortcutIdToKeyCombo || new Map();
    this._shortcutIdToKeyCombo.set(shortcutId, normalizedKeyCombo);

    // Debug logging removed
    
    return subscriptionId;
  }

  /**
   * Log all current subscriptions for debugging
   */
  private logSubscriptions(): void {
    // Logging removed
  }

  /**
   * Unsubscribes from a keyboard shortcut
   * @param subscriptionId The ID of the subscription to remove
   */
  public off(subscriptionId: string): void {
    let found = false;
    
    // Remove from key combo map
    for (const [keyCombo, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);

      if (index !== -1) {
        // Create a new array without the subscription
        const updatedSubscriptions = [
          ...subscriptions.slice(0, index),
          ...subscriptions.slice(index + 1)
        ];
        
        // Update the Map with the new array
        this.subscriptions.set(keyCombo, updatedSubscriptions);
        found = true;
        // Don't return yet, we need to remove from the shortcut ID map too
      }
    }
    
    // Remove from shortcut ID map
    for (const [shortcutId, subscriptions] of this.shortcutIdToSubscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);

      if (index !== -1) {
        // Create a new array without the subscription
        const updatedSubscriptions = [
          ...subscriptions.slice(0, index),
          ...subscriptions.slice(index + 1)
        ];
        
        // Update the Map with the new array
        this.shortcutIdToSubscriptions.set(shortcutId, updatedSubscriptions);
        found = true;
        // We found and removed the subscription, so we can break out of the loop
        break;
      }
    }
  }

  /**
   * Emits a keyboard shortcut event
   * @param keyCombo The key combination that was triggered
   * @param event The original keyboard event
   */
  private emit(keyCombo: string, event: KeyboardEvent): void {
    const normalizedKeyCombo = normalizeKeyCombo(keyCombo);

    // Debug logging removed

    // Get the subscriptions for this key combo
    const subscriptions = [...(this.subscriptions.get(normalizedKeyCombo) || [])];

    // If we have subscriptions, execute them
    if (subscriptions.length > 0) {
      // Execute the highest priority subscription
      const subscription = subscriptions[0]; // Already sorted by priority

      // Prevent default and stop propagation if configured
      if (this.options.preventDefault) {
        event.preventDefault();
      }
      if (this.options.stopPropagation) {
        event.stopPropagation();
      }

      try {
        // Execute the callback
        subscription.callback(event);
      } catch (error) {
        // Silent error handling
      }
      return;
    }

    // Find shortcuts that match this key combo
    const matchingShortcuts = Object.entries(this.shortcuts).filter(([_, config]) => {
      if (config.type === 'sequence') return false;
      
      const shortcutKeyCombo = normalizeKeyCombo(config.keyCombo);
      return shortcutKeyCombo === normalizedKeyCombo;
    });

    if (matchingShortcuts.length === 0) {
      return;
    }

    // Check if any of these shortcuts have subscriptions
    for (const [shortcutId, config] of matchingShortcuts) {
      // Skip if the shortcut is disabled
      if (config.status === 'disabled') continue;

      // Skip if the shortcut has a context and it doesn't match the active context
      if (config.context && this.activeContext !== config.context) continue;

      // Check if there are any subscriptions for this shortcut ID
      const shortcutSubscriptions = this.shortcutIdToSubscriptions.get(shortcutId) || [];
      
      if (shortcutSubscriptions.length > 0) {
        // Execute the highest priority subscription
        const subscription = shortcutSubscriptions[0]; // Already sorted by priority
        
        // Prevent default and stop propagation if configured
        if (this.options.preventDefault) {
          event.preventDefault();
        }
        if (this.options.stopPropagation) {
          event.stopPropagation();
        }
        
        try {
          // Execute the callback
          subscription.callback(event);
          return; // We've handled the event, so we can return
        } catch (error) {
          // Silent error handling
        }
      }
      
      // If no subscriptions but there's a default action, execute it
      if (config.action) {
        // Prevent default and stop propagation if configured
        if (this.options.preventDefault) {
          event.preventDefault();
        }
        if (this.options.stopPropagation) {
          event.stopPropagation();
        }
        
        try {
          config.action(event);
          return; // We've handled the event, so we can return
        } catch (error) {
          // Silent error handling
        }
      }
    }
  }

  /**
   * Updates a shortcut configuration
   * @param shortcutId The ID of the shortcut to update
   * @param config The new configuration
   */
  public updateShortcut(shortcutId: string, config: Partial<ShortcutConfig>): void {
    if (!this.shortcuts[shortcutId]) {
      return;
    }

    const currentConfig = this.shortcuts[shortcutId];

    if (currentConfig.type === 'regular') {
      this.shortcuts[shortcutId] = {
        ...currentConfig,
        ...config
      } as ShortcutRegular;
    } else {
      this.shortcuts[shortcutId] = {
        ...currentConfig,
        ...config
      } as ShortcutSequence;
    }
  }

  /**
   * Registers a new shortcut
   * @param shortcutId The ID of the shortcut to register
   * @param config The shortcut configuration
   */
  public registerShortcut(shortcutId: string, config: ShortcutConfig): void {
    this.shortcuts[shortcutId] = config;
  }

  /**
   * Unregisters a shortcut
   * @param shortcutId The ID of the shortcut to unregister
   */
  public unregisterShortcut(shortcutId: string): void {
    if (!this.shortcuts[shortcutId]) {
      return;
    }

    delete this.shortcuts[shortcutId];
  }

  /**
   * Enables a shortcut
   * @param shortcutId The ID of the shortcut to enable
   */
  public enableShortcut(shortcutId: string): void {
    this.updateShortcut(shortcutId, { status: ShortcutStatus.ENABLED });
  }

  /**
   * Disables a shortcut
   * @param shortcutId The ID of the shortcut to disable
   */
  public disableShortcut(shortcutId: string): void {
    this.updateShortcut(shortcutId, { status: ShortcutStatus.DISABLED });
  }

  /**
   * Gets all registered shortcuts
   * @returns The shortcut settings
   */
  public getShortcuts(): ShortcutSettings {
    return { ...this.shortcuts };
  }

  /**
   * Gets shortcuts by group
   * @param group The group to filter by
   * @returns The shortcuts in the specified group
   */
  public getShortcutsByGroup(group: string): ShortcutSettings {
    return Object.entries(this.shortcuts)
      .filter(([_, config]) => config.group === group)
      .reduce((acc, [id, config]) => {
        acc[id] = config;
        return acc;
      }, {} as ShortcutSettings);
  }

  /**
   * Gets all shortcut groups
   * @returns An array of unique group names
   */
  public getShortcutGroups(): string[] {
    const groups = new Set<string>();

    Object.values(this.shortcuts).forEach(config => {
      if (config.group) {
        groups.add(config.group);
      }
    });

    return Array.from(groups);
  }

  /**
   * Cleans up the EventBus
   */
  public destroy(): void {
    this.stopListening();
    this.subscriptions.clear();

    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
  }
} 