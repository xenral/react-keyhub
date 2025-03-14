import React, { useState, useMemo, useEffect } from "react";
import {
  ShortcutSheetProps,
  ShortcutSettings,
  ShortcutScope,
  ShortcutConfig,
  ShortcutContext,
} from "./types";
import { useShortcutSheet, useShortcutGroups } from "./KeyHubContext";

/**
 * Formats a key combination for display
 * @param keyCombo The key combination to format
 * @returns The formatted key combination
 */
const formatKeyCombo = (keyCombo: string): string => {
  return keyCombo
    .split("+")
    .map((key) => {
      // Capitalize the first letter of each key
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);

      // Replace common key names with symbols or better names
      switch (key.toLowerCase()) {
        case "ctrl":
          return "Ctrl";
        case "alt":
          return "Alt";
        case "shift":
          return "Shift";
        case "meta":
          return navigator.platform.includes("Mac") ? "⌘" : "Win";
        case "esc":
          return "Esc";
        case "space":
          return "Space";
        default:
          return formattedKey;
      }
    })
    .join(" + ");
};

/**
 * Formats a sequence for display
 * @param sequence The sequence to format
 * @returns The formatted sequence
 */
const formatSequence = (sequence: string): string => {
  return sequence
    .split(" ")
    .map((keyCombo) => formatKeyCombo(keyCombo))
    .join(" then ");
};

/**
 * Renders a keyboard key
 */
const KeyboardKey: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <kbd className="keyhub-shortcut-sheet-key">{children}</kbd>;
};

/**
 * Renders a shortcut key combination
 */
const ShortcutKeyCombo: React.FC<{ shortcut: ShortcutConfig }> = ({
  shortcut,
}) => {
  if (shortcut.type === "sequence") {
    const parts = shortcut.sequence.split(" ");
    return (
      <div className="keyhub-shortcut-sheet-key-combo">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="keyhub-shortcut-sheet-key-then">then</span>
            )}
            <KeyboardKey>{formatKeyCombo(part)}</KeyboardKey>
          </React.Fragment>
        ))}
      </div>
    );
  }

  const parts = shortcut.keyCombo.split("+");
  return (
    <div className="keyhub-shortcut-sheet-key-combo">
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="keyhub-shortcut-sheet-key-plus">+</span>
          )}
          <KeyboardKey>{formatKeyCombo(part)}</KeyboardKey>
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * Component for displaying all registered keyboard shortcuts
 */
export const ShortcutSheet: React.FC<ShortcutSheetProps> = ({
  isOpen,
  onClose,
  filter = {},
  className = "",
  theme = "light",
  layout = "modal",
}) => {
  const shortcuts = useShortcutSheet();
  const groups = useShortcutGroups();
  const [searchTerm, setSearchTerm] = useState(filter.search || "");
  const [scopeFilter, setScopeFilter] = useState<ShortcutScope | "all">(
    filter.scope || "all"
  );
  const [groupFilter, setGroupFilter] = useState<string | "all">(
    filter.group || "all"
  );
  const [contextFilter, setContextFilter] = useState<ShortcutContext | "all">(
    filter.context || "all"
  );
  const [activeTab, setActiveTab] = useState<string>(groups[0] || "all");

  // Detect system theme
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme === "auto") {
      const isDarkMode =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setSystemTheme(isDarkMode ? "dark" : "light");

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        setSystemTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  // Get the effective theme
  const effectiveTheme = theme === "auto" ? systemTheme : theme;

  // Get all unique contexts
  const contexts = useMemo(() => {
    const contextSet = new Set<ShortcutContext>();

    Object.values(shortcuts).forEach((config) => {
      if (config.context) {
        contextSet.add(config.context);
      }
    });

    return Array.from(contextSet);
  }, [shortcuts]);

  // Filter shortcuts based on search term, scope, group, and context
  const filteredShortcuts = useMemo(() => {
    return Object.entries(shortcuts).filter(([id, shortcut]) => {
      // Filter by scope
      if (scopeFilter !== "all" && shortcut.scope !== scopeFilter) {
        return false;
      }

      // Filter by group
      if (groupFilter !== "all" && shortcut.group !== groupFilter) {
        return false;
      }

      // Filter by context
      if (contextFilter !== "all" && shortcut.context !== contextFilter) {
        return false;
      }

      // Filter by active tab (group)
      if (activeTab !== "all" && shortcut.group !== activeTab) {
        return false;
      }

      // Filter by search term
      const searchLower = searchTerm.toLowerCase();
      return (
        searchTerm === "" ||
        shortcut.name.toLowerCase().includes(searchLower) ||
        shortcut.description.toLowerCase().includes(searchLower) ||
        (shortcut.type === "regular" &&
          shortcut.keyCombo.toLowerCase().includes(searchLower)) ||
        (shortcut.type === "sequence" &&
          shortcut.sequence.toLowerCase().includes(searchLower))
      );
    });
  }, [
    shortcuts,
    searchTerm,
    scopeFilter,
    groupFilter,
    contextFilter,
    activeTab,
  ]);

  // Group shortcuts by group
  const shortcutsByGroup = useMemo(() => {
    const grouped: Record<string, [string, ShortcutConfig][]> = {};

    filteredShortcuts.forEach((entry) => {
      const group = entry[1].group || "Ungrouped";
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(entry);
    });

    return grouped;
  }, [filteredShortcuts]);

  // If the sheet is not open, don't render anything
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`keyhub-shortcut-sheet keyhub-theme-${effectiveTheme} keyhub-layout-${layout} ${className}`}
    >
      <div className="keyhub-shortcut-sheet-overlay" onClick={onClose} />
      <div className="keyhub-shortcut-sheet-content">
        <div className="keyhub-shortcut-sheet-header">
          <h2>Keyboard Shortcuts</h2>
          <button
            className="keyhub-shortcut-sheet-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="keyhub-shortcut-sheet-filters">
          <div className="keyhub-shortcut-sheet-search-container">
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="keyhub-shortcut-sheet-search"
            />
            {searchTerm && (
              <button
                className="keyhub-shortcut-sheet-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          <div className="keyhub-shortcut-sheet-filter-controls">
            <select
              value={scopeFilter}
              onChange={(e) =>
                setScopeFilter(e.target.value as ShortcutScope | "all")
              }
              className="keyhub-shortcut-sheet-scope"
              aria-label="Filter by scope"
            >
              <option value="all">All Scopes</option>
              <option value="global">Global</option>
              <option value="local">Local</option>
            </select>

            {contexts.length > 0 && (
              <select
                value={contextFilter}
                onChange={(e) =>
                  setContextFilter(e.target.value as ShortcutContext | "all")
                }
                className="keyhub-shortcut-sheet-context"
                aria-label="Filter by context"
              >
                <option value="all">All Contexts</option>
                {contexts.map((context) => (
                  <option key={context} value={context}>
                    {context}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {groups.length > 0 && (
          <div className="keyhub-shortcut-sheet-tabs">
            <button
              className={`keyhub-shortcut-sheet-tab ${
                activeTab === "all" ? "active" : ""
              }`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
            {groups.map((group) => (
              <button
                key={group}
                className={`keyhub-shortcut-sheet-tab ${
                  activeTab === group ? "active" : ""
                }`}
                onClick={() => setActiveTab(group)}
              >
                {group}
              </button>
            ))}
          </div>
        )}

        <div className="keyhub-shortcut-sheet-list">
          {Object.keys(shortcutsByGroup).length === 0 ? (
            <div className="keyhub-shortcut-sheet-empty">
              No shortcuts found.
            </div>
          ) : (
            <div className="keyhub-shortcut-sheet-groups">
              {Object.entries(shortcutsByGroup).map(([group, shortcuts]) => (
                <div key={group} className="keyhub-shortcut-sheet-group">
                  <h3 className="keyhub-shortcut-sheet-group-title">{group}</h3>
                  <div className="keyhub-shortcut-sheet-cards">
                    {shortcuts.map(([id, shortcut]) => (
                      <div
                        key={id}
                        className={`keyhub-shortcut-sheet-card keyhub-shortcut-${shortcut.status}`}
                      >
                        <div className="keyhub-shortcut-sheet-card-header">
                          <h4 className="keyhub-shortcut-sheet-card-title">
                            {shortcut.name}
                          </h4>
                          {shortcut.context && (
                            <span className="keyhub-shortcut-sheet-card-context">
                              {shortcut.context}
                            </span>
                          )}
                        </div>
                        <div className="keyhub-shortcut-sheet-card-description">
                          {shortcut.description}
                        </div>
                        <div className="keyhub-shortcut-sheet-card-footer">
                          <ShortcutKeyCombo shortcut={shortcut} />
                          <span className="keyhub-shortcut-sheet-card-scope">
                            {shortcut.scope}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Default CSS styles for the ShortcutSheet component
 */
export const ShortcutSheetStyles = `
.keyhub-shortcut-sheet {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.keyhub-shortcut-sheet-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  transition: opacity 0.2s ease;
}

.keyhub-shortcut-sheet-content {
  position: relative;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 1000px;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: keyhub-sheet-appear 0.2s ease;
  transition: transform 0.2s ease;
}

@keyframes keyhub-sheet-appear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Light theme */
.keyhub-theme-light .keyhub-shortcut-sheet-content {
  background-color: white;
  color: #333;
}

/* Dark theme */
.keyhub-theme-dark .keyhub-shortcut-sheet-content {
  background-color: #1e1e1e;
  color: #eee;
}

/* Modal layout */
.keyhub-layout-modal .keyhub-shortcut-sheet-content {
  width: 90%;
  max-width: 1000px;
}

/* Sidebar layout */
.keyhub-layout-sidebar .keyhub-shortcut-sheet-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 450px;
  max-width: 90%;
  border-radius: 0;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  animation: keyhub-sheet-slide-in 0.3s ease;
}

@keyframes keyhub-sheet-slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.keyhub-shortcut-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid;
}

.keyhub-theme-light .keyhub-shortcut-sheet-header {
  border-color: #eee;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-header {
  border-color: #333;
}

.keyhub-shortcut-sheet-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.keyhub-shortcut-sheet-close {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  padding:0px;
}

.keyhub-theme-light .keyhub-shortcut-sheet-close {
  color: #666;
}

.keyhub-theme-light .keyhub-shortcut-sheet-close:hover {
  background-color: #f0f0f0;
  color: #333;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-close {
  color: #aaa;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-close:hover {
  background-color: #333;
  color: #fff;
}

.keyhub-shortcut-sheet-filters {
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  gap: 12px;
  border-bottom: 1px solid;
}

.keyhub-theme-light .keyhub-shortcut-sheet-filters {
  border-color: #eee;
  background-color: #fafafa;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-filters {
  border-color: #333;
  background-color: #252525;
}

.keyhub-shortcut-sheet-search-container {
  position: relative;
  flex: 1;
}

.keyhub-shortcut-sheet-search {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 15px;
  border: 1px solid;
  transition: all 0.2s;
}

.keyhub-theme-light .keyhub-shortcut-sheet-search {
  border-color: #ddd;
  background-color: white;
  color: #333;
}

.keyhub-theme-light .keyhub-shortcut-sheet-search:focus {
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

.keyhub-theme-dark .keyhub-shortcut-sheet-search {
  border-color: #444;
  background-color: #2a2a2a;
  color: #eee;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-search:focus {
  border-color: #4da3ff;
  box-shadow: 0 0 0 2px rgba(77, 163, 255, 0.2);
}

.keyhub-shortcut-sheet-search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.keyhub-theme-light .keyhub-shortcut-sheet-search-clear {
  color: #999;
}

.keyhub-theme-light .keyhub-shortcut-sheet-search-clear:hover {
  background-color: #f0f0f0;
  color: #666;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-search-clear {
  color: #777;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-search-clear:hover {
  background-color: #444;
  color: #aaa;
}

.keyhub-shortcut-sheet-filter-controls {
  display: flex;
  gap: 12px;
}

.keyhub-shortcut-sheet-scope,
.keyhub-shortcut-sheet-context {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid;
  transition: all 0.2s;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 32px;
}

.keyhub-theme-light .keyhub-shortcut-sheet-scope,
.keyhub-theme-light .keyhub-shortcut-sheet-context {
  border-color: #ddd;
  background-color: white;
  color: #333;
}

.keyhub-theme-light .keyhub-shortcut-sheet-scope:focus,
.keyhub-theme-light .keyhub-shortcut-sheet-context:focus {
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

.keyhub-theme-dark .keyhub-shortcut-sheet-scope,
.keyhub-theme-dark .keyhub-shortcut-sheet-context {
  border-color: #444;
  background-color: #2a2a2a;
  color: #eee;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-scope:focus,
.keyhub-theme-dark .keyhub-shortcut-sheet-context:focus {
  border-color: #4da3ff;
  box-shadow: 0 0 0 2px rgba(77, 163, 255, 0.2);
}

.keyhub-shortcut-sheet-tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 24px;
  border-bottom: 1px solid;
  scrollbar-width: thin;
  background-color: transparent;
  min-height: 45px;
}

.keyhub-theme-light .keyhub-shortcut-sheet-tabs {
  border-color: #eee;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-tabs {
  border-color: #333;
}

.keyhub-shortcut-sheet-tab {
  padding: 14px 18px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  border-radius:0px;
}

.keyhub-theme-light .keyhub-shortcut-sheet-tab {
  color: #666;
}

.keyhub-theme-light .keyhub-shortcut-sheet-tab:hover:not(.active) {
  color: #333;
  background-color: #f5f5f5;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-tab {
  color: #aaa;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-tab:hover:not(.active) {
  color: #eee;
  background-color: #333;
}

.keyhub-theme-light .keyhub-shortcut-sheet-tab.active {
  color: #0066cc;
  border-color: #0066cc;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-tab.active {
  color: #4da3ff;
  border-color: #4da3ff;
}

.keyhub-shortcut-sheet-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.keyhub-shortcut-sheet-empty {
  padding: 40px 24px;
  text-align: center;
  color: #999;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.keyhub-shortcut-sheet-empty:before {
  content: "🔍";
  font-size: 32px;
  opacity: 0.7;
}

.keyhub-shortcut-sheet-groups {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.keyhub-shortcut-sheet-group-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid;
  display: flex;
  align-items: center;
}

.keyhub-theme-light .keyhub-shortcut-sheet-group-title {
  color: #444;
  border-color: #eee;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-group-title {
  color: #ddd;
  border-color: #333;
}

.keyhub-shortcut-sheet-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.keyhub-shortcut-sheet-card {
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid;
  transition: all 0.2s;
}

.keyhub-theme-light .keyhub-shortcut-sheet-card {
  border-color: #eee;
  background-color: #f9f9f9;
}

.keyhub-theme-light .keyhub-shortcut-sheet-card:hover {
  border-color: #ddd;
  background-color: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.keyhub-theme-dark .keyhub-shortcut-sheet-card {
  border-color: #333;
  background-color: #252525;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-card:hover {
  border-color: #444;
  background-color: #2a2a2a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.keyhub-shortcut-sheet-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.keyhub-shortcut-sheet-card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}

.keyhub-shortcut-sheet-card-context {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

.keyhub-theme-light .keyhub-shortcut-sheet-card-context {
  background-color: #e0e0e0;
  color: #555;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-card-context {
  background-color: #444;
  color: #ccc;
}

.keyhub-shortcut-sheet-card-description {
  font-size: 14px;
  line-height: 1.5;
  flex-grow: 1;
}

.keyhub-theme-light .keyhub-shortcut-sheet-card-description {
  color: #666;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-card-description {
  color: #aaa;
}

.keyhub-shortcut-sheet-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.keyhub-shortcut-sheet-card-scope {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: capitalize;
}

.keyhub-theme-light .keyhub-shortcut-sheet-card-scope {
  background-color: #e0e0e0;
  color: #555;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-card-scope {
  background-color: #444;
  color: #ccc;
}

.keyhub-shortcut-sheet-key-combo {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.keyhub-shortcut-sheet-key {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  min-width: 24px;
  text-align: center;
  border: 1px solid;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.keyhub-theme-light .keyhub-shortcut-sheet-key {
  background-color: white;
  border-color: #ddd;
  color: #333;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.05), 0 1px 0 rgba(0, 0, 0, 0.05);
}

.keyhub-theme-dark .keyhub-shortcut-sheet-key {
  background-color: #333;
  border-color: #444;
  color: #eee;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(0, 0, 0, 0.2);
}

.keyhub-shortcut-sheet-key-plus,
.keyhub-shortcut-sheet-key-then {
  font-size: 13px;
  font-weight: 500;
}

.keyhub-theme-light .keyhub-shortcut-sheet-key-plus,
.keyhub-theme-light .keyhub-shortcut-sheet-key-then {
  color: #999;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-key-plus,
.keyhub-theme-dark .keyhub-shortcut-sheet-key-then {
  color: #777;
}

.keyhub-shortcut-disabled {
  opacity: 0.6;
}

/* Scrollbar styling */
.keyhub-shortcut-sheet-list::-webkit-scrollbar,
.keyhub-shortcut-sheet-tabs::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.keyhub-theme-light .keyhub-shortcut-sheet-list::-webkit-scrollbar-track,
.keyhub-theme-light .keyhub-shortcut-sheet-tabs::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.keyhub-theme-light .keyhub-shortcut-sheet-list::-webkit-scrollbar-thumb,
.keyhub-theme-light .keyhub-shortcut-sheet-tabs::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.keyhub-theme-light .keyhub-shortcut-sheet-list::-webkit-scrollbar-thumb:hover,
.keyhub-theme-light .keyhub-shortcut-sheet-tabs::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-list::-webkit-scrollbar-track,
.keyhub-theme-dark .keyhub-shortcut-sheet-tabs::-webkit-scrollbar-track {
  background: #2a2a2a;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-list::-webkit-scrollbar-thumb,
.keyhub-theme-dark .keyhub-shortcut-sheet-tabs::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

.keyhub-theme-dark .keyhub-shortcut-sheet-list::-webkit-scrollbar-thumb:hover,
.keyhub-theme-dark .keyhub-shortcut-sheet-tabs::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .keyhub-shortcut-sheet-cards {
    grid-template-columns: 1fr;
  }
  
  .keyhub-shortcut-sheet-filter-controls {
    flex-direction: column;
  }
  
  .keyhub-layout-sidebar .keyhub-shortcut-sheet-content {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
  }
  
  .keyhub-shortcut-sheet-header {
    padding: 16px 20px;
  }
  
  .keyhub-shortcut-sheet-list {
    padding: 16px 20px;
  }
  
  .keyhub-shortcut-sheet-card {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .keyhub-shortcut-sheet-header h2 {
    font-size: 18px;
  }
  
  .keyhub-shortcut-sheet-card-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
`;
