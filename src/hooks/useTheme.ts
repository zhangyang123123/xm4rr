import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
export type ColorTheme = 'purple' | 'ocean' | 'forest' | 'sunset' | 'rose';

export const colorThemes: { id: ColorTheme; name: string; color: string }[] = [
  { id: 'purple', name: '梦幻紫', color: '#a855f7' },
  { id: 'ocean', name: '海洋蓝', color: '#06b6d4' },
  { id: 'forest', name: '森林绿', color: '#22c55e' },
  { id: 'sunset', name: '日落橙', color: '#f97316' },
  { id: 'rose', name: '玫瑰红', color: '#f43f5e' },
];

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('colorTheme') as ColorTheme;
    if (saved && colorThemes.some(t => t.id === saved)) {
      return saved;
    }
    return 'purple';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    colorThemes.forEach(t => root.classList.remove(`theme-${t.id}`));
    root.classList.add(`theme-${colorTheme}`);

    localStorage.setItem('theme', theme);
    localStorage.setItem('colorTheme', colorTheme);
  }, [theme, colorTheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    colorTheme,
    setColorTheme,
  };
}
