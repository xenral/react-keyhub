import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShortcutSheet } from '../src/ShortcutSheet';
import { KeyHubProvider } from '../src/KeyHubContext';
import { ShortcutSettings } from '../src/types';

// Mock shortcuts for testing
const mockShortcuts: ShortcutSettings = {
  save: {
    keyCombo: 'ctrl+s',
    name: 'Save',
    description: 'Save the current document',
    scope: 'global',
    priority: 100,
    status: 'enabled',
  },
  print: {
    keyCombo: 'ctrl+p',
    name: 'Print',
    description: 'Print the current document',
    scope: 'global',
    priority: 100,
    status: 'enabled',
  },
  find: {
    keyCombo: 'ctrl+f',
    name: 'Find',
    description: 'Find text in the current document',
    scope: 'local',
    priority: 100,
    status: 'enabled',
  },
};

describe('ShortcutSheet', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render nothing when isOpen is false', () => {
    render(
      <KeyHubProvider shortcuts={mockShortcuts}>
        <ShortcutSheet isOpen={false} onClose={onClose} />
      </KeyHubProvider>
    );

    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  test('should render shortcuts when isOpen is true', () => {
    render(
      <KeyHubProvider shortcuts={mockShortcuts}>
        <ShortcutSheet isOpen={true} onClose={onClose} />
      </KeyHubProvider>
    );

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Print')).toBeInTheDocument();
    expect(screen.getByText('Find')).toBeInTheDocument();
  });

  test('should call onClose when close button is clicked', () => {
    render(
      <KeyHubProvider shortcuts={mockShortcuts}>
        <ShortcutSheet isOpen={true} onClose={onClose} />
      </KeyHubProvider>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('should call onClose when overlay is clicked', () => {
    render(
      <KeyHubProvider shortcuts={mockShortcuts}>
        <ShortcutSheet isOpen={true} onClose={onClose} />
      </KeyHubProvider>
    );

    // Find the overlay element and click it
    const overlay = document.querySelector('.keyhub-shortcut-sheet-overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  test('should filter shortcuts by search term', () => {
    render(
      <KeyHubProvider shortcuts={mockShortcuts}>
        <ShortcutSheet isOpen={true} onClose={onClose} />
      </KeyHubProvider>
    );

    // Type "save" in the search input
    fireEvent.change(screen.getByPlaceholderText('Search shortcuts...'), {
      target: { value: 'save' },
    });

    // Should show "Save" but not "Print" or "Find"
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.queryByText('Print')).not.toBeInTheDocument();
    expect(screen.queryByText('Find')).not.toBeInTheDocument();
  });

  test('should filter shortcuts by scope', () => {
    render(
      <KeyHubProvider shortcuts={mockShortcuts}>
        <ShortcutSheet isOpen={true} onClose={onClose} />
      </KeyHubProvider>
    );

    // Select "Local" in the scope filter
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'local' },
    });

    // Should show "Find" but not "Save" or "Print"
    expect(screen.getByText('Find')).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.queryByText('Print')).not.toBeInTheDocument();
  });

  test('should show "No shortcuts found" when no shortcuts match the filters', () => {
    render(
      <KeyHubProvider shortcuts={mockShortcuts}>
        <ShortcutSheet isOpen={true} onClose={onClose} />
      </KeyHubProvider>
    );

    // Type a search term that doesn't match any shortcuts
    fireEvent.change(screen.getByPlaceholderText('Search shortcuts...'), {
      target: { value: 'nonexistent' },
    });

    expect(screen.getByText('No shortcuts found.')).toBeInTheDocument();
  });
}); 