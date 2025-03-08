import React, { useState } from 'react';
import { 
  KeyHubProvider, 
  useShortcut, 
  ShortcutSheet,
  defaultShortcuts,
  ShortcutSheetStyles
} from '../src';

// Define custom shortcuts by extending the default ones
const myShortcuts = {
  ...defaultShortcuts,
  customAction: {
    keyCombo: 'ctrl+k',
    name: 'Custom Action',
    description: 'Perform a custom action',
    scope: 'global',
    priority: 100,
    status: 'enabled',
  },
};

// Main App component
export const App: React.FC = () => {
  return (
    <KeyHubProvider shortcuts={myShortcuts}>
      <style>{ShortcutSheetStyles}</style>
      <h1>React KeyHub Demo</h1>
      <p>This is a demo of the React KeyHub package.</p>
      <DemoComponent />
    </KeyHubProvider>
  );
};

// Demo component that uses shortcuts
const DemoComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [isShortcutSheetOpen, setIsShortcutSheetOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  // Subscribe to the "save" shortcut
  useShortcut('save', () => {
    setSavedCount(count);
    setMessage('Count saved!');
    setTimeout(() => setMessage(null), 2000);
  });
  
  // Subscribe to the "customAction" shortcut
  useShortcut('customAction', () => {
    setCount(count + 1);
    setMessage('Count incremented!');
    setTimeout(() => setMessage(null), 2000);
  });
  
  // Subscribe to the "showShortcuts" shortcut
  useShortcut('showShortcuts', () => {
    setIsShortcutSheetOpen(true);
  });
  
  return (
    <div className="demo-container">
      <div className="demo-card">
        <h2>Counter Demo</h2>
        <p className="counter">Count: {count}</p>
        <p className="saved-counter">Saved Count: {savedCount}</p>
        
        {message && <div className="message">{message}</div>}
        
        <div className="buttons">
          <button onClick={() => setCount(count + 1)}>
            Increment Count
          </button>
          <button onClick={() => setSavedCount(count)}>
            Save Count
          </button>
          <button onClick={() => setIsShortcutSheetOpen(true)}>
            Show Keyboard Shortcuts
          </button>
        </div>
        
        <div className="shortcuts-info">
          <h3>Available Shortcuts:</h3>
          <ul>
            <li><strong>Ctrl+K</strong>: Increment the count</li>
            <li><strong>Ctrl+S</strong>: Save the current count</li>
            <li><strong>Ctrl+/</strong>: Show all keyboard shortcuts</li>
          </ul>
        </div>
      </div>
      
      <ShortcutSheet 
        isOpen={isShortcutSheetOpen} 
        onClose={() => setIsShortcutSheetOpen(false)} 
      />
      
      <style>{`
        .demo-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .demo-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 24px;
          margin-bottom: 24px;
        }
        
        h2 {
          margin-top: 0;
          color: #333;
        }
        
        .counter, .saved-counter {
          font-size: 24px;
          font-weight: bold;
          margin: 16px 0;
        }
        
        .counter {
          color: #2c7be5;
        }
        
        .saved-counter {
          color: #00b8d9;
        }
        
        .message {
          background-color: #e6f7ff;
          border-left: 4px solid #1890ff;
          padding: 12px 16px;
          margin: 16px 0;
          border-radius: 4px;
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .buttons {
          display: flex;
          gap: 12px;
          margin: 24px 0;
        }
        
        button {
          background-color: #2c7be5;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        button:hover {
          background-color: #1a68d1;
        }
        
        .shortcuts-info {
          background-color: #f9f9f9;
          border-radius: 4px;
          padding: 16px;
          margin-top: 24px;
        }
        
        .shortcuts-info h3 {
          margin-top: 0;
          color: #555;
        }
        
        .shortcuts-info ul {
          padding-left: 20px;
        }
        
        .shortcuts-info li {
          margin-bottom: 8px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}; 