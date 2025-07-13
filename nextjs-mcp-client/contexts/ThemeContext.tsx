'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors: {
    background: string;
    foreground: string;
    primary: string;
    'primary-foreground': string;
    secondary: string;
    'secondary-foreground': string;
    accent: string;
    'accent-foreground': string;
    muted: string;
    'muted-foreground': string;
    card: string;
    'card-foreground': string;
    popover: string;
    'popover-foreground': string;
    destructive: string;
    'destructive-foreground': string;
    'destructive-background': string;
    'destructive-border': string;
    'success-foreground': string;
    'success-background': string;
    border: string;
    input: string;
    ring: string;
    success: string;
    warning: string;
    info: string;
    sidebar: string;
    sidebarForeground: string;
    header: string;
    headerForeground: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'light',
    name: 'Light (Default)',
    type: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#1f2937',
      primary: '#3b82f6',
      secondary: '#f3f4f6',
      accent: '#f59e0b',
      border: '#e5e7eb',
      card: '#ffffff',
      'card-foreground': '#1f2937',
      popover: '#ffffff',
      'popover-foreground': '#1f2937',
      'primary-foreground': '#ffffff',
      'secondary-foreground': '#1f2937',
      muted: '#f9fafb',
      'muted-foreground': '#6b7280',
      'accent-foreground': '#1f2937',
      destructive: '#ef4444',
      'destructive-foreground': '#ffffff',
      'destructive-background': '#fef2f2',
      'destructive-border': '#fecaca',
      'success-foreground': '#166534',
      'success-background': '#f0fdf4',
      border: '#e5e7eb',
      input: '#ffffff',
      ring: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      info: '#3b82f6',
      sidebar: '#f8fafc',
      sidebarForeground: '#374151',
      header: '#ffffff',
      headerForeground: '#1f2937',
    },
  },
  {
    id: 'dark',
    name: 'Dark (VS Code Dark)',
    type: 'dark',
    colors: {
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      primary: '#007acc',
      secondary: '#2d2d30',
      accent: '#ffcc02',
      border: '#3e3e42',
      card: '#252526',
      'card-foreground': '#d4d4d4',
      popover: '#252526',
      'popover-foreground': '#d4d4d4',
      'primary-foreground': '#ffffff',
      'secondary-foreground': '#d4d4d4',
      muted: '#2d2d30',
      'muted-foreground': '#969696',
      'accent-foreground': '#1e1e1e',
      destructive: '#f14c4c',
      'destructive-foreground': '#ffffff',
      'destructive-background': '#450a0a',
      'destructive-border': '#7f1d1d',
      'success-foreground': '#bbf7d0',
      'success-background': '#064e3b',
      border: '#3e3e42',
      input: '#3c3c3c',
      ring: '#007acc',
      success: '#89d185',
      warning: '#ffcc02',
      info: '#75beff',
      sidebar: '#252526',
      sidebarForeground: '#cccccc',
      header: '#2d2d30',
      headerForeground: '#cccccc',
    },
  },
  {
    id: 'monokai',
    name: 'Monokai',
    type: 'dark',
    colors: {
      background: '#272822',
      foreground: '#f8f8f2',
      primary: '#66d9ef',
      secondary: '#3e3d32',
      accent: '#fd971f',
      border: '#49483e',
      card: '#3e3d32',
      'card-foreground': '#f8f8f2',
      popover: '#3e3d32',
      'popover-foreground': '#f8f8f2',
      'primary-foreground': '#272822',
      'secondary-foreground': '#f8f8f2',
      muted: '#49483e',
      'muted-foreground': '#75715e',
      'accent-foreground': '#272822',
      destructive: '#f92672',
      'destructive-foreground': '#ffffff',
      'destructive-background': '#450a0a',
      'destructive-border': '#7f1d1d',
      'success-foreground': '#bbf7d0',
      'success-background': '#064e3b',
      border: '#49483e',
      input: '#49483e',
      ring: '#66d9ef',
      success: '#a6e22e',
      warning: '#fd971f',
      info: '#66d9ef',
      sidebar: '#3e3d32',
      sidebarForeground: '#f8f8f2',
      header: '#49483e',
      headerForeground: '#f8f8f2',
    },
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    type: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#24292f',
      primary: '#0969da',
      secondary: '#f6f8fa',
      accent: '#fd7e14',
      border: '#d0d7de',
      card: '#ffffff',
      'card-foreground': '#24292f',
      popover: '#ffffff',
      'popover-foreground': '#24292f',
      'primary-foreground': '#ffffff',
      'secondary-foreground': '#24292f',
      muted: '#f6f8fa',
      'muted-foreground': '#656d76',
      'accent-foreground': '#ffffff',
      destructive: '#cf222e',
      'destructive-foreground': '#ffffff',
      'destructive-background': '#fef2f2',
      'destructive-border': '#fecaca',
      'success-foreground': '#166534',
      'success-background': '#f0fdf4',
      border: '#d0d7de',
      input: '#ffffff',
      ring: '#0969da',
      success: '#1a7f37',
      warning: '#9a6700',
      info: '#0969da',
      sidebar: '#f6f8fa',
      sidebarForeground: '#24292f',
      header: '#ffffff',
      headerForeground: '#24292f',
    },
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    type: 'dark',
    colors: {
      background: '#0d1117',
      foreground: '#e6edf3',
      primary: '#2f81f7',
      secondary: '#21262d',
      accent: '#fd7e14',
      border: '#30363d',
      card: '#161b22',
      'card-foreground': '#e6edf3',
      popover: '#161b22',
      'popover-foreground': '#e6edf3',
      'primary-foreground': '#ffffff',
      'secondary-foreground': '#e6edf3',
      muted: '#21262d',
      'muted-foreground': '#7d8590',
      'accent-foreground': '#ffffff',
      destructive: '#f85149',
      'destructive-foreground': '#ffffff',
      'destructive-background': '#450a0a',
      'destructive-border': '#7f1d1d',
      'success-foreground': '#bbf7d0',
      'success-background': '#064e3b',
      border: '#30363d',
      input: '#21262d',
      ring: '#2f81f7',
      success: '#3fb950',
      warning: '#d29922',
      info: '#2f81f7',
      sidebar: '#161b22',
      sidebarForeground: '#e6edf3',
      header: '#21262d',
      headerForeground: '#e6edf3',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    type: 'dark',
    colors: {
      background: '#282a36',
      foreground: '#f8f8f2',
      primary: '#bd93f9',
      secondary: '#44475a',
      accent: '#ffb86c',
      border: '#6272a4',
      card: '#44475a',
      'card-foreground': '#f8f8f2',
      popover: '#44475a',
      'popover-foreground': '#f8f8f2',
      'primary-foreground': '#282a36',
      'secondary-foreground': '#f8f8f2',
      muted: '#44475a',
      'muted-foreground': '#6272a4',
      'accent-foreground': '#282a36',
      destructive: '#ff5555',
      'destructive-foreground': '#ffffff',
      'destructive-background': '#450a0a',
      'destructive-border': '#7f1d1d',
      'success-foreground': '#bbf7d0',
      'success-background': '#064e3b',
      border: '#6272a4',
      input: '#44475a',
      ring: '#bd93f9',
      success: '#50fa7b',
      warning: '#f1fa8c',
      info: '#8be9fd',
      sidebar: '#44475a',
      sidebarForeground: '#f8f8f2',
      header: '#44475a',
      headerForeground: '#f8f8f2',
    },
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    type: 'light',
    colors: {
      background: '#fdf6e3',
      foreground: '#657b83',
      primary: '#268bd2',
      secondary: '#eee8d5',
      accent: '#cb4b16',
      border: '#93a1a1',
      card: '#fdf6e3',
      'card-foreground': '#657b83',
      popover: '#fdf6e3',
      'popover-foreground': '#657b83',
      'primary-foreground': '#ffffff',
      'secondary-foreground': '#657b83',
      muted: '#eee8d5',
      'muted-foreground': '#93a1a1',
      'accent-foreground': '#ffffff',
      destructive: '#dc322f',
      'destructive-foreground': '#ffffff',
      'destructive-background': '#fef2f2',
      'destructive-border': '#fecaca',
      'success-foreground': '#166534',
      'success-background': '#f0fdf4',
      border: '#93a1a1',
      input: '#eee8d5',
      ring: '#268bd2',
      success: '#859900',
      warning: '#b58900',
      info: '#268bd2',
      sidebar: '#eee8d5',
      sidebarForeground: '#657b83',
      header: '#eee8d5',
      headerForeground: '#657b83',
    },
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    type: 'dark',
    colors: {
      background: '#002b36',
      foreground: '#839496',
      primary: '#268bd2',
      secondary: '#073642',
      accent: '#cb4b16',
      border: '#586e75',
      card: '#073642',
      'card-foreground': '#839496',
      popover: '#073642',
      'popover-foreground': '#839496',
      'primary-foreground': '#ffffff',
      'secondary-foreground': '#839496',
      muted: '#073642',
      'muted-foreground': '#586e75',
      'accent-foreground': '#ffffff',
      destructive: '#dc322f',
      'destructive-foreground': '#ffffff',
      'destructive-background': '#450a0a',
      'destructive-border': '#7f1d1d',
      'success-foreground': '#bbf7d0',
      'success-background': '#064e3b',
      border: '#586e75',
      input: '#073642',
      ring: '#268bd2',
      success: '#859900',
      warning: '#b58900',
      info: '#268bd2',
      sidebar: '#073642',
      sidebarForeground: '#839496',
      header: '#073642',
      headerForeground: '#839496',
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    // Load theme from localStorage
    const savedThemeId = localStorage.getItem('theme-preference');
    if (savedThemeId) {
      const savedTheme = themes.find(theme => theme.id === savedThemeId);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme CSS variables
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Set data attribute for theme type
    root.setAttribute('data-theme', currentTheme.type);
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('theme-preference', themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};