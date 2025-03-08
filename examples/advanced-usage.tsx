import React, { useState, useEffect, useRef } from 'react';
import { 
  KeyHubProvider, 
  useShortcut, 
  ShortcutSheet,
  defaultShortcuts,
  ShortcutSheetStyles,
  useShortcutContext,
  useShortcutRegister,
  useShortcutUpdate,
  useShortcutStatus,
  useShortcutGroups,
  useShortcutPause,
  ShortcutRegular,
  ShortcutScope,
  ShortcutStatus
} from '../src';
import { ShortcutConfig } from '../src/types';

// Define custom shortcuts by extending the default ones
const myShortcuts = {
  ...defaultShortcuts,
  // Add a custom shortcut
  customAction: {
    keyCombo: 'ctrl+k',
    name: 'Custom Action',
    description: 'Perform a custom action',
    scope: 'global' as ShortcutScope,
    priority: 100,
    status: 'enabled' as ShortcutStatus,
    group: 'Custom',
    type: 'regular' as const
  }
};

// Main App component
export const AdvancedApp: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [layout, setLayout] = useState<'modal' | 'sidebar' | 'inline'>('modal');
  
  return (
    <KeyHubProvider shortcuts={myShortcuts}>
      <style>{ShortcutSheetStyles}</style>
      <div className={`app-container ${theme !== 'auto' ? theme : ''}`}>
        <header className="app-header">
          <h1>React KeyHub Advanced Demo</h1>
          <div className="app-controls">
            <div className="control-group">
              <label>Theme:</label>
              <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value as any)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
            <div className="control-group">
              <label>Shortcut Sheet Layout:</label>
              <select 
                value={layout} 
                onChange={(e) => setLayout(e.target.value as any)}
              >
                <option value="modal">Modal</option>
                <option value="sidebar">Sidebar</option>
                <option value="inline">Inline</option>
              </select>
            </div>
          </div>
        </header>
        
        <main className="app-main">
          <EditorSection theme={theme} layout={layout} />
          <ShortcutManagerSection />
        </main>
        
        <footer className="app-footer">
          <p>Press <kbd>Ctrl</kbd> + <kbd>/</kbd> to show all shortcuts</p>
        </footer>
      </div>
      
      <style>{`
        :root {
          --bg-color-light: #f8f9fa;
          --text-color-light: #333;
          --primary-color-light: #0066cc;
          --secondary-color-light: #6c757d;
          --border-color-light: #dee2e6;
          --card-bg-light: #fff;
          --input-bg-light: #fff;
          
          --bg-color-dark: #1e1e1e;
          --text-color-dark: #eee;
          --primary-color-dark: #4da3ff;
          --secondary-color-dark: #adb5bd;
          --border-color-dark: #444;
          --card-bg-dark: #252525;
          --input-bg-dark: #333;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-color-light);
          color: var(--text-color-light);
        }
        
        .app-container.dark {
          background-color: var(--bg-color-dark);
          color: var(--text-color-dark);
        }
        
        .app-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .dark .app-header {
          border-color: var(--border-color-dark);
        }
        
        .app-header h1 {
          margin: 0;
          font-size: 24px;
        }
        
        .app-controls {
          display: flex;
          gap: 16px;
        }
        
        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .app-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
          padding: 20px;
        }
        
        @media (max-width: 768px) {
          .app-main {
            grid-template-columns: 1fr;
          }
        }
        
        .app-footer {
          padding: 16px;
          text-align: center;
          border-top: 1px solid var(--border-color-light);
          font-size: 14px;
        }
        
        .dark .app-footer {
          border-color: var(--border-color-dark);
        }
        
        .card {
          background-color: var(--card-bg-light);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .dark .card {
          background-color: var(--card-bg-dark);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        h2 {
          margin-top: 0;
          font-size: 18px;
          margin-bottom: 16px;
        }
        
        h3 {
          font-size: 16px;
          margin-bottom: 12px;
        }
        
        button, select, input {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid var(--border-color-light);
          background-color: var(--input-bg-light);
          color: var(--text-color-light);
          font-size: 14px;
        }
        
        .dark button, .dark select, .dark input {
          border-color: var(--border-color-dark);
          background-color: var(--input-bg-dark);
          color: var(--text-color-dark);
        }
        
        button {
          cursor: pointer;
          background-color: var(--primary-color-light);
          color: white;
          border: none;
        }
        
        .dark button {
          background-color: var(--primary-color-dark);
        }
        
        button:hover {
          opacity: 0.9;
        }
        
        button.secondary {
          background-color: var(--secondary-color-light);
        }
        
        .dark button.secondary {
          background-color: var(--secondary-color-dark);
        }
        
        .button-group {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
        }
        
        input, select {
          width: 100%;
        }
        
        kbd {
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 12px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          color: #333;
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
        }
        
        .dark kbd {
          background-color: #333;
          border-color: #444;
          color: #eee;
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
        }
        
        .editor {
          width: 100%;
          height: 300px;
          padding: 12px;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 14px;
          line-height: 1.5;
          border: 1px solid var(--border-color-light);
          border-radius: 4px;
          resize: vertical;
          background-color: var(--input-bg-light);
          color: var(--text-color-light);
        }
        
        .dark .editor {
          border-color: var(--border-color-dark);
          background-color: var(--input-bg-dark);
          color: var(--text-color-dark);
        }
        
        .context-indicator {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          margin-left: 8px;
        }
        
        .context-indicator.editor {
          background-color: #e3f2fd;
          color: #0d47a1;
        }
        
        .dark .context-indicator.editor {
          background-color: #0d47a1;
          color: #e3f2fd;
        }
        
        .context-indicator.vim {
          background-color: #e8f5e9;
          color: #1b5e20;
        }
        
        .dark .context-indicator.vim {
          background-color: #1b5e20;
          color: #e8f5e9;
        }
        
        .shortcut-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .shortcut-item {
          padding: 8px 0;
          border-bottom: 1px solid var(--border-color-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .dark .shortcut-item {
          border-color: var(--border-color-dark);
        }
        
        .shortcut-item:last-child {
          border-bottom: none;
        }
        
        .shortcut-name {
          font-weight: 500;
        }
        
        .shortcut-key {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        
        .message {
          padding: 12px;
          border-radius: 4px;
          margin: 16px 0;
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .message.success {
          background-color: #e8f5e9;
          color: #1b5e20;
          border-left: 4px solid #4caf50;
        }
        
        .dark .message.success {
          background-color: rgba(76, 175, 80, 0.2);
          color: #81c784;
        }
        
        .message.info {
          background-color: #e3f2fd;
          color: #0d47a1;
          border-left: 4px solid #2196f3;
        }
        
        .dark .message.info {
          background-color: rgba(33, 150, 243, 0.2);
          color: #64b5f6;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 20px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: var(--primary-color-light);
        }
        
        .dark input:checked + .toggle-slider {
          background-color: var(--primary-color-dark);
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
      `}</style>
    </KeyHubProvider>
  );
};

// Editor section component
interface EditorSectionProps {
  theme: 'light' | 'dark' | 'auto';
  layout: 'modal' | 'sidebar' | 'inline';
}

const EditorSection: React.FC<EditorSectionProps> = ({ theme, layout }) => {
  const [isShortcutSheetOpen, setIsShortcutSheetOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('// Type something here...\n// Press Ctrl+/ to show all shortcuts\n// Press g then c to show git commands\n// Press g then s to show git status');
  const [message, setMessage] = useState<{ type: 'success' | 'info', text: string } | null>(null);
  const [editorMode, setEditorMode] = useState<'normal' | 'vim'>('normal');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  // Set the active context based on the editor mode
  useShortcutContext(editorMode === 'normal' ? 'editor' : 'vim');
  
  // Subscribe to the "showShortcuts" shortcut
  useShortcut('showShortcuts', () => {
    setIsShortcutSheetOpen(true);
  });
  
  // Subscribe to the "save" shortcut
  useShortcut('save', () => {
    showMessage('success', 'Document saved!');
  });
  
  // Subscribe to the "gitCommands" sequence shortcut
  useShortcut('gitCommands', () => {
    showMessage('info', 'Git commands menu opened');
  });
  
  // Subscribe to the "gitStatus" sequence shortcut
  useShortcut('gitStatus', () => {
    showMessage('info', 'Git status: 2 files changed, 1 file added');
  });
  
  // Subscribe to Vim navigation shortcuts when in Vim mode
  useShortcut('vimUp', () => {
    if (editorMode === 'vim' && editorRef.current) {
      const start = editorRef.current.selectionStart;
      const value = editorRef.current.value;
      const lines = value.split('\n');
      let currentLine = 0;
      let charCount = 0;
      
      // Find the current line
      for (let i = 0; i < lines.length; i++) {
        if (charCount + lines[i].length + 1 > start) {
          currentLine = i;
          break;
        }
        charCount += lines[i].length + 1;
      }
      
      // Move to the previous line
      if (currentLine > 0) {
        const prevLine = lines[currentLine - 1];
        const currentCol = start - charCount;
        const targetCol = Math.min(currentCol, prevLine.length);
        const targetPos = charCount - prevLine.length - 1 + targetCol;
        
        editorRef.current.setSelectionRange(targetPos, targetPos);
      }
    }
  });
  
  // Register a dynamic shortcut
  useShortcutRegister('dynamicShortcut', {
    keyCombo: 'ctrl+d',
    name: 'Dynamic Shortcut',
    description: 'A dynamically registered shortcut',
    scope: 'local' as ShortcutScope,
    priority: 100,
    status: 'enabled' as ShortcutStatus,
    group: 'Dynamic',
    type: 'regular' as const,
    action: () => {
      showMessage('info', 'Dynamic shortcut triggered!');
    }
  });
  
  // Show a message for a short time
  const showMessage = (type: 'success' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };
  
  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>
            Editor
            {editorMode === 'normal' ? (
              <span className="context-indicator editor">Editor Mode</span>
            ) : (
              <span className="context-indicator vim">Vim Mode</span>
            )}
          </h2>
          <div className="control-group">
            <label>Vim Mode:</label>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={editorMode === 'vim'} 
                onChange={() => setEditorMode(editorMode === 'normal' ? 'vim' : 'normal')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <textarea 
          ref={editorRef}
          className="editor" 
          value={editorContent} 
          onChange={(e) => setEditorContent(e.target.value)}
        />
        
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="button-group">
          <button onClick={() => showMessage('success', 'Document saved!')}>
            Save
          </button>
          <button className="secondary" onClick={() => setIsShortcutSheetOpen(true)}>
            Show Shortcuts
          </button>
        </div>
      </div>
      
      {layout === 'inline' && isShortcutSheetOpen && (
        <div className="card">
          <ShortcutSheet 
            isOpen={true} 
            onClose={() => setIsShortcutSheetOpen(false)} 
            theme={theme}
            layout="inline"
          />
        </div>
      )}
      
      {layout !== 'inline' && (
        <ShortcutSheet 
          isOpen={isShortcutSheetOpen} 
          onClose={() => setIsShortcutSheetOpen(false)} 
          theme={theme}
          layout={layout}
        />
      )}
    </div>
  );
};

// Shortcut manager section component
const ShortcutManagerSection: React.FC = () => {
  const [customShortcutKey, setCustomShortcutKey] = useState('ctrl+shift+d');
  const [customShortcutName, setCustomShortcutName] = useState('Custom Shortcut');
  const [customShortcutDesc, setCustomShortcutDesc] = useState('A custom shortcut');
  const [customShortcutGroup, setCustomShortcutGroup] = useState('Custom');
  const [isPaused, setIsPaused] = useState(false);
  const groups = useShortcutGroups();
  
  // Pause/resume shortcuts
  useShortcutPause(isPaused);
  
  // Toggle the status of the "save" shortcut
  const [saveEnabled, setSaveEnabled] = useState(true);
  useShortcutStatus('save', saveEnabled);
  
  // Register a custom shortcut
  const registerCustomShortcut = () => {
    const shortcutId = `custom_${Date.now()}`;
    const shortcutConfig: ShortcutConfig = {
      keyCombo: customShortcutKey,
      name: customShortcutName,
      description: customShortcutDesc,
      scope: 'global' as ShortcutScope,
      priority: 100,
      status: 'enabled' as ShortcutStatus,
      group: customShortcutGroup,
      type: 'regular' as const
    };
    
    useShortcutRegister(shortcutId, shortcutConfig);
    
    // Reset the form
    setCustomShortcutKey('ctrl+shift+d');
    setCustomShortcutName('Custom Shortcut');
    setCustomShortcutDesc('A custom shortcut');
  };
  
  return (
    <div>
      <div className="card">
        <h2>Shortcut Manager</h2>
        
        <div className="form-group">
          <label>Shortcuts Enabled:</label>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={!isPaused} 
              onChange={() => setIsPaused(!isPaused)}
            />
            <span className="toggle-slider"></span>
          </label>
          <p style={{ fontSize: '14px', marginTop: '4px', color: '#666' }}>
            {isPaused ? 'All shortcuts are paused' : 'All shortcuts are active'}
          </p>
        </div>
        
        <h3>Toggle Specific Shortcuts</h3>
        <div className="shortcut-list">
          <div className="shortcut-item">
            <span className="shortcut-name">Save (Ctrl+S)</span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={saveEnabled} 
                onChange={() => setSaveEnabled(!saveEnabled)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2>Register Custom Shortcut</h2>
        <div className="form-group">
          <label>Key Combination:</label>
          <input 
            type="text" 
            value={customShortcutKey} 
            onChange={(e) => setCustomShortcutKey(e.target.value)}
            placeholder="e.g., ctrl+shift+d"
          />
        </div>
        
        <div className="form-group">
          <label>Name:</label>
          <input 
            type="text" 
            value={customShortcutName} 
            onChange={(e) => setCustomShortcutName(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Description:</label>
          <input 
            type="text" 
            value={customShortcutDesc} 
            onChange={(e) => setCustomShortcutDesc(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Group:</label>
          <select 
            value={customShortcutGroup} 
            onChange={(e) => setCustomShortcutGroup(e.target.value)}
          >
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
            <option value="Custom">Custom</option>
            <option value="Dynamic">Dynamic</option>
          </select>
        </div>
        
        <button onClick={registerCustomShortcut}>
          Register Shortcut
        </button>
      </div>
      
      <div className="card">
        <h2>Available Groups</h2>
        <ul className="shortcut-list">
          {groups.map(group => (
            <li key={group} className="shortcut-item">
              <span className="shortcut-name">{group}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 