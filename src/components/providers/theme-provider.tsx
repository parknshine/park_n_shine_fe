"use client";

import {
  createContext,
  useContext,
  // DARK MODE DISABLED — useSyncExternalStore used for dynamic theme detection
  // useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

// DARK MODE DISABLED — uncomment functions below to re-enable dynamic theme detection
// function subscribeToTheme(callback: () => void) {
//   const observer = new MutationObserver(callback);
//   observer.observe(document.documentElement, { attributeFilter: ["class"] });
//   return () => observer.disconnect();
// }

// function getThemeSnapshot(): Theme {
//   return document.documentElement.classList.contains("dark") ? "dark" : "light";
// }

// function getServerSnapshot(): Theme {
//   return "light";
// }

export function ThemeProvider({ children }: { children: ReactNode }) {
  // DARK MODE DISABLED — always use light theme
  const theme: Theme = "light";

  // DARK MODE DISABLED — toggle logic commented out; re-enable alongside useSyncExternalStore above
  // const theme = useSyncExternalStore(
  //   subscribeToTheme,
  //   getThemeSnapshot,
  //   getServerSnapshot,
  // );

  const toggleTheme = () => {
    // DARK MODE DISABLED — no-op; uncomment block below to restore toggle
    // const next = theme === "light" ? "dark" : "light";
    // document.documentElement.classList.toggle("dark", next === "dark");
    // try {
    //   localStorage.setItem("theme", next);
    // } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
