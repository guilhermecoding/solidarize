"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import type { BeforeInstallPromptEvent } from "@/@types/pwa-install";
import { SPLASH_DONE_EVENT } from "@/components/splash-screen";
import { useIsMobile } from "@/hooks/use-mobile";
import { notify } from "@/lib/notify";

export type InstallCapability =
    | "html-install-element"
    | "navigator-install"
    | "before-install-prompt"
    | "manual-guide";

export type ManualInstallBrowser =
    | "ios-safari"
    | "ios-other"
    | "android-other"
    | "generic";

const PROMPT_SEEN_KEY = "solidarize:pwa-install-prompt-seen";
const PROMPT_SEEN_EVENT = "solidarize:pwa-seen-change";
const DEFERRED_PROMPT_EVENT = "solidarize:beforeinstallprompt";
const SPLASH_FALLBACK_TIMEOUT_MS = 5500;
const POST_SPLASH_DELAY_MS = 2500;
const MOBILE_UA_PATTERN = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

let pwaReadyAfterSplash = false;

function subscribeNoop() {
    return () => {};
}

function subscribeMobileEnvironment(onStoreChange: () => void) {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    mediaQuery.addEventListener("change", onStoreChange);
    return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getMobileEnvironmentSnapshot(): boolean {
    const isTouchPointer = window.matchMedia("(pointer: coarse)").matches;
    const isMobileUa =
        window.navigator.userAgentData?.mobile === true
        || MOBILE_UA_PATTERN.test(window.navigator.userAgent);
    const isIpadDesktopMode =
        /Macintosh/i.test(window.navigator.userAgent) && window.navigator.maxTouchPoints > 1;

    return isMobileUa || isIpadDesktopMode || isTouchPointer;
}

function subscribeStandalone(onStoreChange: () => void) {
    const queries = [
        window.matchMedia("(display-mode: standalone)"),
        window.matchMedia("(display-mode: minimal-ui)"),
        window.matchMedia("(display-mode: window-controls-overlay)"),
    ];

    queries.forEach((query) => query.addEventListener("change", onStoreChange));

    return () => {
        queries.forEach((query) => query.removeEventListener("change", onStoreChange));
    };
}

function getStandaloneSnapshot(): boolean {
    if (
        window.matchMedia("(display-mode: standalone)").matches
        || window.matchMedia("(display-mode: minimal-ui)").matches
        || window.matchMedia("(display-mode: window-controls-overlay)").matches
    ) {
        return true;
    }

    if (window.navigator.standalone === true) {
        return true;
    }

    return document.referrer.startsWith("android-app://");
}

function getHtmlInstallElementSnapshot(): boolean {
    return "HTMLInstallElement" in window;
}

function getNavigatorInstallSnapshot(): boolean {
    return "install" in window.navigator && typeof window.navigator.install === "function";
}

function subscribeDeferredPrompt(onStoreChange: () => void) {
    const handleCustom = () => {
        onStoreChange();
    };

    const handleBeforeInstallPrompt = (event: Event) => {
        event.preventDefault();
        window.__solidarizeDeferredInstallPrompt = event as BeforeInstallPromptEvent;
        onStoreChange();
    };

    window.addEventListener(DEFERRED_PROMPT_EVENT, handleCustom);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
        window.removeEventListener(DEFERRED_PROMPT_EVENT, handleCustom);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
}

function getDeferredPromptSnapshot(): BeforeInstallPromptEvent | null {
    return window.__solidarizeDeferredInstallPrompt ?? null;
}

function getDeferredPromptServerSnapshot(): BeforeInstallPromptEvent | null {
    return null;
}

function subscribePromptSeen(onStoreChange: () => void) {
    const handleStorage = (event: StorageEvent) => {
        if (event.key === PROMPT_SEEN_KEY || event.key === null) {
            onStoreChange();
        }
    };

    window.addEventListener(PROMPT_SEEN_EVENT, onStoreChange);
    window.addEventListener("storage", handleStorage);

    return () => {
        window.removeEventListener(PROMPT_SEEN_EVENT, onStoreChange);
        window.removeEventListener("storage", handleStorage);
    };
}

function getPromptSeenSnapshot(): boolean {
    try {
        return window.localStorage.getItem(PROMPT_SEEN_KEY) === "1";
    } catch {
        return false;
    }
}

function subscribeSplashDone(onStoreChange: () => void) {
    if (pwaReadyAfterSplash) {
        return () => {};
    }

    let delayTimer: number | undefined;
    let fallbackTimer: number | undefined;

    const scheduleReady = () => {
        if (pwaReadyAfterSplash || delayTimer !== undefined) {
            return;
        }

        delayTimer = window.setTimeout(() => {
            pwaReadyAfterSplash = true;
            onStoreChange();
        }, POST_SPLASH_DELAY_MS);
    };

    if (window.__solidarizeSplashDone) {
        scheduleReady();
    } else {
        window.addEventListener(SPLASH_DONE_EVENT, scheduleReady);
        fallbackTimer = window.setTimeout(() => {
            if (!window.__solidarizeSplashDone) {
                window.__solidarizeSplashDone = true;
            }
            scheduleReady();
        }, SPLASH_FALLBACK_TIMEOUT_MS);
    }

    return () => {
        window.removeEventListener(SPLASH_DONE_EVENT, scheduleReady);
        if (delayTimer !== undefined) {
            window.clearTimeout(delayTimer);
        }
        if (fallbackTimer !== undefined) {
            window.clearTimeout(fallbackTimer);
        }
    };
}

function getSplashDoneSnapshot(): boolean {
    return pwaReadyAfterSplash;
}

function getManualBrowserSnapshot(): ManualInstallBrowser {
    const ua = window.navigator.userAgent;
    const isIos =
        /iPhone|iPad|iPod/i.test(ua)
        || (/Macintosh/i.test(ua) && window.navigator.maxTouchPoints > 1);

    if (isIos) {
        const isOtherIosBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua);
        return isOtherIosBrowser ? "ios-other" : "ios-safari";
    }

    if (/Android/i.test(ua)) {
        return "android-other";
    }

    return "generic";
}

function getManualBrowserServerSnapshot(): ManualInstallBrowser {
    return "generic";
}

function isExcludedPathname(pathname: string | null): boolean {
    if (!pathname) {
        return true;
    }

    return (
        pathname === "/entrar"
        || pathname.startsWith("/entrar/")
        || pathname === "/~offline"
        || pathname.startsWith("/~offline/")
    );
}

function markPromptSeenInStorage() {
    try {
        window.localStorage.setItem(PROMPT_SEEN_KEY, "1");
    } catch {
        // Ignora indisponibilidade de localStorage em modos restritos.
    }

    window.dispatchEvent(new Event(PROMPT_SEEN_EVENT));
}

/**
 * Gerencia exibição única, aviso superior removível e cascata de instalação PWA exclusiva para dispositivos móveis.
 */
export function usePwaInstall() {
    const pathname = usePathname();
    const isMobileViewport = useIsMobile();
    const isMobileEnv = useSyncExternalStore(
        subscribeMobileEnvironment,
        getMobileEnvironmentSnapshot,
        () => false,
    );
    const isStandalone = useSyncExternalStore(
        subscribeStandalone,
        getStandaloneSnapshot,
        () => false,
    );
    const hasHtmlInstallElement = useSyncExternalStore(
        subscribeNoop,
        getHtmlInstallElementSnapshot,
        () => false,
    );
    const hasNavigatorInstall = useSyncExternalStore(
        subscribeNoop,
        getNavigatorInstallSnapshot,
        () => false,
    );
    const deferredPrompt = useSyncExternalStore(
        subscribeDeferredPrompt,
        getDeferredPromptSnapshot,
        getDeferredPromptServerSnapshot,
    );
    const hasSeenInitialPrompt = useSyncExternalStore(
        subscribePromptSeen,
        getPromptSeenSnapshot,
        () => true,
    );
    const isSplashDone = useSyncExternalStore(
        subscribeSplashDone,
        getSplashDoneSnapshot,
        () => false,
    );
    const manualBrowser = useSyncExternalStore(
        subscribeNoop,
        getManualBrowserSnapshot,
        getManualBrowserServerSnapshot,
    );

    const [modalOverride, setModalOverride] = useState<boolean | null>(null);
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const [installedInSession, setInstalledInSession] = useState(false);
    const [showManualGuide, setShowManualGuide] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);

    const isMobileDevice = isMobileViewport && isMobileEnv;
    const isEligible =
        isMobileDevice
        && !isStandalone
        && !installedInSession
        && !isExcludedPathname(pathname);

    let capability: InstallCapability = "manual-guide";

    if (hasHtmlInstallElement) {
        capability = "html-install-element";
    } else if (hasNavigatorInstall) {
        capability = "navigator-install";
    } else if (deferredPrompt !== null) {
        capability = "before-install-prompt";
    }

    const modalOpen =
        isEligible
        && isSplashDone
        && (modalOverride !== null ? modalOverride : !hasSeenInitialPrompt);

    const showCornerBanner =
        isEligible
        && isSplashDone
        && !modalOpen
        && !bannerDismissed
        && (hasSeenInitialPrompt || modalOverride === false);

    const deferInstall = useCallback(() => {
        markPromptSeenInStorage();
        setShowManualGuide(false);
        setModalOverride(false);
    }, []);

    const openPrompt = useCallback(() => {
        setShowManualGuide(false);
        setModalOverride(true);
    }, []);

    const dismissCornerBanner = useCallback(() => {
        setBannerDismissed(true);
    }, []);

    const handleNativeInstalled = useCallback(() => {
        markPromptSeenInStorage();
        window.__solidarizeDeferredInstallPrompt = null;
        setInstalledInSession(true);
        setShowManualGuide(false);
        setModalOverride(false);
        notify("success", "Solidarize instalado com sucesso!");
    }, []);

    useEffect(() => {
        const handleAppInstalled = () => {
            handleNativeInstalled();
        };

        window.addEventListener("appinstalled", handleAppInstalled);
        return () => window.removeEventListener("appinstalled", handleAppInstalled);
    }, [handleNativeInstalled]);

    const triggerDeferredPrompt = useCallback(
        async (promptEvent: BeforeInstallPromptEvent) => {
            window.__solidarizeDeferredInstallPrompt = null;
            window.dispatchEvent(new Event(DEFERRED_PROMPT_EVENT));

            await promptEvent.prompt();
            const { outcome } = await promptEvent.userChoice;

            if (outcome === "accepted") {
                handleNativeInstalled();
            } else {
                deferInstall();
            }
        },
        [deferInstall, handleNativeInstalled],
    );

    const handleInstallClick = useCallback(async () => {
        if (capability === "navigator-install" && typeof window.navigator.install === "function") {
            setIsInstalling(true);

            try {
                await window.navigator.install();
                handleNativeInstalled();
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    deferInstall();
                } else if (deferredPrompt) {
                    try {
                        await triggerDeferredPrompt(deferredPrompt);
                    } catch {
                        setShowManualGuide(true);
                    }
                } else {
                    setShowManualGuide(true);
                }
            } finally {
                setIsInstalling(false);
            }

            return;
        }

        if (capability === "before-install-prompt" && deferredPrompt) {
            setIsInstalling(true);

            try {
                await triggerDeferredPrompt(deferredPrompt);
            } catch {
                setShowManualGuide(true);
            } finally {
                setIsInstalling(false);
            }

            return;
        }

        setShowManualGuide(true);
    }, [
        capability,
        deferInstall,
        deferredPrompt,
        handleNativeInstalled,
        triggerDeferredPrompt,
    ]);

    return {
        modalOpen,
        showCornerBanner,
        capability,
        manualBrowser,
        showManualGuide,
        isInstalling,
        setShowManualGuide,
        openPrompt,
        deferInstall,
        dismissCornerBanner,
        handleInstallClick,
        handleNativeInstalled,
    };
}
