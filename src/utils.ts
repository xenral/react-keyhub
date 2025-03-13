/**
 * Normalizes a key combination string to a consistent format
 * @param keyCombo The key combination to normalize
 * @returns The normalized key combination
 */
export const normalizeKeyCombo = (keyCombo: string): string => {
  // Handle empty or undefined input
  if (!keyCombo) return '';
  
  // Handle sequence shortcuts (space-separated key combos)
  if (keyCombo.includes(' ')) {
    return keyCombo.split(' ')
      .map(combo => normalizeKeyCombo(combo))
      .join(' ');
  }
  
  // Split the key combination by '+' and convert to lowercase
  const parts = keyCombo.toLowerCase().split('+');
  
  // Extract modifiers and the main key
  const modifiers = parts.filter(part => 
    ['ctrl', 'control', 'alt', 'option', 'shift', 'meta', 'cmd', 'command', 'win', 'windows'].includes(part)
  );
  
  // Normalize modifier names
  const normalizedModifiers = modifiers.map(mod => {
    if (mod === 'control') return 'ctrl';
    if (mod === 'option') return 'alt';
    if (['cmd', 'command', 'win', 'windows'].includes(mod)) return 'meta';
    return mod;
  });
  
  // Get the main key (the part that's not a modifier)
  const mainKeys = parts.filter(part => 
    !['ctrl', 'control', 'alt', 'option', 'shift', 'meta', 'cmd', 'command', 'win', 'windows'].includes(part)
  );
  
  // Normalize special keys
  const normalizedMainKeys = mainKeys.map(key => {
    if (key === 'space') return 'space';
    if (key === 'escape') return 'esc';
    if (key === 'arrowup') return 'up';
    if (key === 'arrowdown') return 'down';
    if (key === 'arrowleft') return 'left';
    if (key === 'arrowright') return 'right';
    return key;
  });
  
  // Remove duplicates and sort modifiers for consistent ordering
  const uniqueModifiers = Array.from(new Set(normalizedModifiers)).sort();
  
  // Combine the normalized modifiers and the main key
  return [...uniqueModifiers, ...normalizedMainKeys].filter(Boolean).join('+');
};

/**
 * Converts a keyboard event to a normalized key combination string
 * @param event The keyboard event
 * @returns The normalized key combination
 */
export const eventToKeyCombo = (event: KeyboardEvent): string => {
  const modifiers = [];
  
  if (event.ctrlKey) modifiers.push('ctrl');
  if (event.altKey) modifiers.push('alt');
  if (event.shiftKey) modifiers.push('shift');
  if (event.metaKey) modifiers.push('meta');
  
  const key = event.key.toLowerCase();
  
  // Handle special keys
  let normalizedKey = key;
  if (key === ' ') normalizedKey = 'space';
  if (key === 'escape') normalizedKey = 'esc';
  if (key === 'arrowup') normalizedKey = 'up';
  if (key === 'arrowdown') normalizedKey = 'down';
  if (key === 'arrowleft') normalizedKey = 'left';
  if (key === 'arrowright') normalizedKey = 'right';
  
  // Don't include the key if it's a modifier key itself
  if (['control', 'ctrl', 'alt', 'shift', 'meta', 'command', 'cmd'].includes(key)) {
    return modifiers.sort().join('+');
  }
  
  return [...modifiers.sort(), normalizedKey].join('+');
};

/**
 * Creates a debounced version of a function
 * @param func The function to debounce
 * @param wait The debounce time in milliseconds
 * @returns The debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generates a unique ID
 * @returns A unique ID string
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
}; 