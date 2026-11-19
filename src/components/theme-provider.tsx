"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  createContext,
  use,
  useCallback,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";

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

function subscribeLocation(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getStoredTheme() {
  return window.localStorage.getItem(THEME_STORAGE_KEY);
}

function getServerStoredTheme() {
  return SSR_THEME;
}

function isLoginPath(pathname: string) {
  return pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`);
}

function loginNeedsLight() {
  return isLoginPath(window.location.pathname) && getStoredTheme() === null;
}

const SetLoginLightContext = createContext<(forced: boolean) => void>(() => {});

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const snapshotForcesLight = useSyncExternalStore(
    subscribeLocation,
    loginNeedsLight,
    () => false,
  );
  const [loginOverride, setLoginOverride] = useState<boolean | null>(null);
  const setLoginLight = useCallback((forced: boolean) => {
    setLoginOverride(forced);
  }, []);
  const forceLoginLight = loginOverride ?? snapshotForcesLight;

  return (
    <SetLoginLightContext value={setLoginLight}>
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
    </SetLoginLightContext>
  );
}

export function LoginLightLock() {
  const setLoginLight = use(SetLoginLightContext);
  const storedTheme = useSyncExternalStore(
    subscribeThemeStorage,
    getStoredTheme,
    getServerStoredTheme,
  );

  useLayoutEffect(() => {
    setLoginLight(storedTheme === null);
    return () => setLoginLight(false);
  }, [setLoginLight, storedTheme]);

  return null;
}
