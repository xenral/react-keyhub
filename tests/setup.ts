import '@testing-library/jest-dom';

// Mock navigator.platform for testing
Object.defineProperty(navigator, 'platform', {
  value: 'MacIntel',
  configurable: true,
}); 