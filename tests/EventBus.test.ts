import { EventBus } from '../src/EventBus';
import { ShortcutSettings } from '../src/types';

// Mock document for testing
const mockDocument = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Mock shortcuts for testing
const mockShortcuts: ShortcutSettings = {
  save: {
    keyCombo: 'ctrl+s',
    name: 'Save',
    description: 'Save the current document',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    action: jest.fn(),
    type: 'regular',
  },
  print: {
    keyCombo: 'ctrl+p',
    name: 'Print',
    description: 'Print the current document',
    scope: 'global',
    priority: 100,
    status: 'enabled',
    action: jest.fn(),
    type: 'regular',
  },
};

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    jest.clearAllMocks();
    eventBus = new EventBus(mockShortcuts, { target: mockDocument as any });
  });

  afterEach(() => {
    eventBus.destroy();
  });

  test('should initialize with shortcuts', () => {
    expect(eventBus).toBeDefined();
    expect(mockDocument.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  test('should stop listening when destroyed', () => {
    eventBus.destroy();
    expect(mockDocument.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  test('should update shortcut configuration', () => {
    eventBus.updateShortcut('save', { priority: 200 });
    const shortcuts = eventBus.getShortcuts();
    expect(shortcuts.save.priority).toBe(200);
  });

  test('should enable and disable shortcuts', () => {
    eventBus.disableShortcut('save');
    let shortcuts = eventBus.getShortcuts();
    expect(shortcuts.save.status).toBe('disabled');

    eventBus.enableShortcut('save');
    shortcuts = eventBus.getShortcuts();
    expect(shortcuts.save.status).toBe('enabled');
  });

  test('should subscribe to shortcuts and return subscription ID', () => {
    const callback = jest.fn();
    const subscriptionId = eventBus.on('save', callback);
    expect(subscriptionId).toBeTruthy();
  });

  test('should unsubscribe from shortcuts', () => {
    const callback = jest.fn();
    const subscriptionId = eventBus.on('save', callback);
    eventBus.off(subscriptionId);
    // No direct way to test this, but we can verify it doesn't throw
    expect(() => eventBus.off(subscriptionId)).not.toThrow();
  });

  test('should warn when subscribing to undefined shortcut', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    eventBus.on('nonexistent', jest.fn());
    expect(consoleSpy).toHaveBeenCalledWith('Shortcut "nonexistent" is not defined');
    consoleSpy.mockRestore();
  });

  test('should warn when updating undefined shortcut', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    eventBus.updateShortcut('nonexistent', { priority: 200 });
    expect(consoleSpy).toHaveBeenCalledWith('Shortcut "nonexistent" is not defined');
    consoleSpy.mockRestore();
  });
}); 