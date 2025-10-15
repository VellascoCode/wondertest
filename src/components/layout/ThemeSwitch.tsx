import { useTheme } from "@/context/ThemeContext";
import { useMemo } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { GiFairyWand } from "react-icons/gi";

const iconMap = {
  light: <FaSun className="text-yellow-400" />,
  dark: <FaMoon className="text-indigo-300" />,
  fantasy: <GiFairyWand className="text-pink-300" />
};

export const ThemeSwitch: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const label = useMemo(() => {
    if (theme === "light") return "Tema claro";
    if (theme === "dark") return "Tema escuro";
    return "Tema fantasia";
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:border-white/40 hover:bg-white/10"
      aria-label={label}
    >
      <span className="text-lg">{iconMap[theme]}</span>
      <span className="hidden sm:block capitalize">{theme}</span>
    </button>
  );
};
