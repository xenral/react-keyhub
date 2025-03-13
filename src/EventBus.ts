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

        // Get the subscriptions for this shortcut
        const normalizedKeyCombo = shortcutId;
        // Make sure we get a fresh reference to the array
        const subscriptions = [...(this.subscriptions.get(normalizedKeyCombo) || [])];

        // Execute all subscribed callbacks in priority order
        let handled = false;

        for (const subscription of subscriptions) {
          try {
            subscription.callback(event);
            handled = true;
            break; // Only execute the highest priority callback
          } catch (error) {
            console.error(`Error executing callback for sequence subscription: "${subscription.id}"`, error);
          }
        }

        // If no callbacks were executed and there's a default action, execute it
        if (!handled && config.action) {
          try {
            config.action(event);
          } catch (error) {
            console.error(`Error executing default action for sequence shortcut: "${shortcutId}"`, error);
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
      console.warn(`Shortcut "${shortcutId}" is not defined`);
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
    // This ensures the array reference in the Map is updated
    const subscriptions = this.subscriptions.get(normalizedKeyCombo)!;
    subscriptions.push(subscription);
    subscriptions.sort((a, b) => b.priority - a.priority);
    
    // Make sure the Map is updated with the modified array
    this.subscriptions.set(normalizedKeyCombo, subscriptions);

    // Also store a mapping from shortcut ID to normalized key combo
    this._shortcutIdToKeyCombo = this._shortcutIdToKeyCombo || new Map();
    this._shortcutIdToKeyCombo.set(shortcutId, normalizedKeyCombo);

    console.log(`Registered shortcut "${shortcutId}" with key combo "${normalizedKeyCombo}" and subscription ID "${subscriptionId}"`);
    console.log(`Current subscriptions for "${normalizedKeyCombo}":`, subscriptions.length);

    // Debug: Log all current subscriptions
    console.log('All current subscriptions:');
    this.subscriptions.forEach((subs, keyCombo) => {
      console.log(`- ${keyCombo}: ${subs.length} subscriptions`);
      subs.forEach(sub => {
        console.log(`  - Subscription ID: ${sub.id}, ShortcutId: ${sub.shortcutId}`);
      });
    });
    
    return subscriptionId;
  }

  private logAll() {
    console.log('All current subscriptions (detailed):');
    this.subscriptions.forEach((subs, keyCombo) => {
      console.log(`- ${keyCombo}: ${subs.length} subscriptions`);
      subs.forEach(sub => {
        console.log(`  - Subscription ID: ${sub.id}, ShortcutId: ${sub.shortcutId}`);
      });
    });
  }

  /**
   * Unsubscribes from a keyboard shortcut
   * @param subscriptionId The ID of the subscription to remove
   */
  public off(subscriptionId: string): void {
    // Find the subscription in all key combos
    for (const [keyCombo, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);

      if (index !== -1) {
        console.log(`Removing subscription "${subscriptionId}" from key combo "${keyCombo}"`);
        // Create a new array without the subscription
        const updatedSubscriptions = [
          ...subscriptions.slice(0, index),
          ...subscriptions.slice(index + 1)
        ];
        
        // Update the Map with the new array
        this.subscriptions.set(keyCombo, updatedSubscriptions);
        
        console.log(`Updated subscriptions for "${keyCombo}":`, updatedSubscriptions.length);
        return;
      }
    }
    
    console.warn(`Subscription "${subscriptionId}" not found`);
  }

  /**
   * Emits a keyboard shortcut event
   * @param keyCombo The key combination that was triggered
   * @param event The original keyboard event
   */
  private emit(keyCombo: string, event: KeyboardEvent): void {
    const normalizedKeyCombo = normalizeKeyCombo(keyCombo);

    console.log(`Emitting event for key combo: "${normalizedKeyCombo}"`);

    // Debug: Log all current subscriptions
    console.log('All current subscriptions at emit time:');
    this.subscriptions.forEach((subs, keyCombo) => {
      console.log(`- ${keyCombo}: ${subs.length} subscriptions`);
      // Log each subscription in detail
      subs.forEach(sub => {
        console.log(`  - Subscription ID: ${sub.id}, ShortcutId: ${sub.shortcutId}`);
      });
    });

    // Get the subscriptions for this key combo
    // Make sure we get a fresh reference to the array
    const subscriptions = [...(this.subscriptions.get(normalizedKeyCombo) || [])];
    console.log(`Found ${subscriptions.length} direct subscriptions for key combo: "${normalizedKeyCombo}"`);

    // If we have subscriptions, execute them
    if (subscriptions.length > 0) {
      // Execute the highest priority subscription
      const subscription = subscriptions[0]; // Already sorted by priority
      console.log(`Executing callback for subscription: "${subscription.id}" for shortcut: "${subscription.shortcutId}"`);

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
        console.error(`Error executing callback for subscription: "${subscription.id}"`, error);
      }
      return;
    }

    // If no direct subscriptions, try to find subscriptions by shortcut ID
    // This is a fallback mechanism in case the key combo mapping is inconsistent
    let foundByShortcutId = false;
    
    // Check all subscriptions to see if any match the current key combo
    this.subscriptions.forEach((subs, storedKeyCombo) => {
      if (foundByShortcutId) return; // Skip if we already found a match
      
      subs.forEach(sub => {
        if (foundByShortcutId) return; // Skip if we already found a match
        
        // Get the shortcut config for this subscription
        const shortcut = this.shortcuts[sub.shortcutId];
        if (!shortcut) return;
        
        // Check if this shortcut's key combo matches the current key combo
        const shortcutKeyCombo = shortcut.type === 'sequence' 
          ? shortcut.sequence 
          : shortcut.keyCombo;
        
        if (normalizeKeyCombo(shortcutKeyCombo) === normalizedKeyCombo) {
          console.log(`Found subscription by shortcut ID: ${sub.shortcutId}, executing callback`);
          
          // Prevent default and stop propagation if configured
          if (this.options.preventDefault) {
            event.preventDefault();
          }
          if (this.options.stopPropagation) {
            event.stopPropagation();
          }
          
          try {
            // Execute the callback
            sub.callback(event);
            foundByShortcutId = true;
          } catch (error) {
            console.error(`Error executing callback for subscription: "${sub.id}"`, error);
          }
        }
      });
    });
    
    if (foundByShortcutId) return;

    // If no direct subscriptions, find the shortcut configuration for this key combo
    const shortcutEntries = Object.entries(this.shortcuts).filter(
      ([_, config]) => {
        if (config.type === 'sequence') return false;
        
        const shortcutKeyCombo = normalizeKeyCombo(config.keyCombo);
        const matches = shortcutKeyCombo === normalizedKeyCombo;
        
        console.log(`Checking shortcut: ${config.name}, Key Combo: ${config.keyCombo}, Normalized: ${shortcutKeyCombo}, Matches: ${matches}`);
        
        return matches;
      }
    );

    if (shortcutEntries.length === 0) {
      console.log(`No shortcuts found for key combo: "${normalizedKeyCombo}"`);
      return;
    }

    console.log(`Found ${shortcutEntries.length} shortcuts for key combo: "${normalizedKeyCombo}"`);

    // Debug: Log the shortcut entries found
    shortcutEntries.forEach(([id, config]) => {
      const keyCombo = config.type === 'sequence' ? (config as any).sequence : (config as any).keyCombo;
      console.log(`- Shortcut: ${id}, Key Combo: ${keyCombo}, Normalized: ${normalizeKeyCombo(keyCombo)}`);
    });

    // Sort shortcuts by priority (highest first)
    shortcutEntries.sort((a, b) => b[1].priority - a[1].priority);

    // Find the first shortcut that matches the active context
    const matchingShortcut = shortcutEntries.find(
      ([_, config]) =>
        config.status === 'enabled' &&
        (!config.context || this.activeContext === config.context)
    );

    if (!matchingShortcut) {
      console.log(`No matching shortcut found for key combo: "${normalizedKeyCombo}" with current context: "${this.activeContext}"`);
      return;
    }

    const [shortcutId, shortcut] = matchingShortcut;
    console.log(`Matched shortcut: "${shortcutId}" for key combo: "${normalizedKeyCombo}"`);

    // Prevent default browser behavior if configured
    if (this.options.preventDefault) {
      event.preventDefault();
    }

    // Stop propagation if configured
    if (this.options.stopPropagation) {
      event.stopPropagation();
    }

    // If the shortcut has a default action, execute it
    if (shortcut.action) {
      console.log(`Executing default action for shortcut: "${shortcutId}"`);
      try {
        shortcut.action(event);
      } catch (error) {
        console.error(`Error executing default action for shortcut: "${shortcutId}"`, error);
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
      console.warn(`Shortcut "${shortcutId}" is not defined`);
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
    if (this.shortcuts[shortcutId]) {
      console.warn(`Shortcut "${shortcutId}" is already defined and will be overwritten`);
    }

    this.shortcuts[shortcutId] = config;
  }

  /**
   * Unregisters a shortcut
   * @param shortcutId The ID of the shortcut to unregister
   */
  public unregisterShortcut(shortcutId: string): void {
    if (!this.shortcuts[shortcutId]) {
      console.warn(`Shortcut "${shortcutId}" is not defined`);
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