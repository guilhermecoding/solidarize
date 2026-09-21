"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const THEME_STORAGE_KEY = "theme";
const LOGIN_PATH = "/entrar";
const SSR_THEME = "__ssr__";

function subscribeThemeStorage(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

function getStoredTheme() {
  return window.localStorage.getItem(THEME_STORAGE_KEY);
}

function getServerStoredTheme() {
  return SSR_THEME;
}

function isLoginPath(pathname: string | null) {
  return pathname === LOGIN_PATH || Boolean(pathname?.startsWith(`${LOGIN_PATH}/`));
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname();
  const storedTheme = useSyncExternalStore(
    subscribeThemeStorage,
    getStoredTheme,
    getServerStoredTheme,
  );
  const forceLoginLight =
    isLoginPath(pathname) && storedTheme === null;

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
      forcedTheme={forceLoginLight ? "light" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
