import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeOption = "light" | "dark" | "fantasy";

interface ThemeContextValue {
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  toggleTheme: () => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_SEQUENCE: ThemeOption[] = ["light", "dark", "fantasy"];

const STORAGE_KEY = "checkmate-theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeOption>("dark");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as ThemeOption | null) : null;
    if (stored && THEME_SEQUENCE.includes(stored)) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const body = document.body;
    THEME_SEQUENCE.forEach((item) => body.classList.remove(`theme-${item}`));
    body.classList.add(`theme-${theme}`);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (next: ThemeOption) => setThemeState(next);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const index = THEME_SEQUENCE.indexOf(prev);
      const nextIndex = (index + 1) % THEME_SEQUENCE.length;
      return THEME_SEQUENCE[nextIndex];
    });
  };

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme, themes: THEME_SEQUENCE }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser utilizado dentro de ThemeProvider");
  }
  return context;
}
