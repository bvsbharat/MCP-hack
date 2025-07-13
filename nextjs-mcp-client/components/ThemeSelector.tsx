'use client';

import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronDown, Palette, Check } from 'lucide-react';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent, themeId?: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (themeId) {
        handleThemeSelect(themeId);
      } else {
        setIsOpen(!isOpen);
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Theme Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => handleKeyDown(e)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2"
        style={{
          backgroundColor: isOpen ? 'var(--color-muted)' : 'transparent',
          color: 'var(--color-foreground)',
        }}
        aria-label="Select theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={0}
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">{currentTheme.name}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu */}
          <div 
            className="absolute right-0 top-full mt-2 w-64 rounded-lg shadow-lg border z-20"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
            role="listbox"
            aria-label="Theme options"
          >
            <div className="py-2">
              <div 
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                Light Themes
              </div>
              {themes
                .filter(theme => theme.type === 'light')
                .map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    onKeyDown={(e) => handleKeyDown(e, theme.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-[var(--color-muted)] focus:outline-none focus:bg-[var(--color-muted)]"
                    style={{ color: 'var(--color-foreground)' }}
                    role="option"
                    aria-selected={currentTheme.id === theme.id}
                    tabIndex={0}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                        }}
                        aria-hidden="true"
                      />
                      <span>{theme.name}</span>
                    </div>
                    {currentTheme.id === theme.id && (
                      <Check className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    )}
                  </button>
                ))}
              
              <div 
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wide mt-2"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                Dark Themes
              </div>
              {themes
                .filter(theme => theme.type === 'dark')
                .map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    onKeyDown={(e) => handleKeyDown(e, theme.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-[var(--color-muted)] focus:outline-none focus:bg-[var(--color-muted)]"
                    style={{ color: 'var(--color-foreground)' }}
                    role="option"
                    aria-selected={currentTheme.id === theme.id}
                    tabIndex={0}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                        }}
                        aria-hidden="true"
                      />
                      <span>{theme.name}</span>
                    </div>
                    {currentTheme.id === theme.id && (
                      <Check className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    )}
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSelector;