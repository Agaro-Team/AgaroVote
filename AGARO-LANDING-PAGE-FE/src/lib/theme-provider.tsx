// lib/theme-provider.tsx
import * as React from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  initialTheme = 'system',
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = React.useState<Theme>(initialTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(
    'light'
  );

  // 🔹 Load theme dari sessionStorage saat pertama kali
  React.useEffect(() => {
    const storedTheme = sessionStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    } else {
      setThemeState(initialTheme);
    }
  }, [initialTheme]);

  // 🔹 Update resolvedTheme setiap kali theme berubah
  React.useEffect(() => {
    const updateResolvedTheme = () => {
      let activeTheme: 'light' | 'dark' = 'light';
      if (theme === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } else {
        activeTheme = theme;
      }
      setResolvedTheme(activeTheme);

      // apply ke html
      const root = document.documentElement;
      root.classList.toggle('dark', activeTheme === 'dark');
    };

    updateResolvedTheme();

    // Listen ke perubahan system theme kalau pilih "system"
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateResolvedTheme);
      return () =>
        mediaQuery.removeEventListener('change', updateResolvedTheme);
    }
  }, [theme]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    sessionStorage.setItem('theme', newTheme);
  }, []);

  const value = React.useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
