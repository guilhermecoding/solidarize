"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";

import { APP_VERSION } from "@/lib/app-version";

import IconLogo from "./logo/icon-logo";
import { TextAnimate } from "./ui/text-animate";

const SPLASH_MIN_DURATION_MS = 3400;
const SPLASH_MAX_WAIT_MS = 5000;

export const SPLASH_DONE_EVENT = "solidarize:splash-done";

function notifySplashDone() {
    if (typeof window === "undefined") {
        return;
    }

    window.__solidarizeSplashDone = true;
    window.dispatchEvent(new Event(SPLASH_DONE_EVENT));
}

const logoEntrance: Variants = {
    hidden: { opacity: 0, scale: 0.72, y: 16, filter: "blur(8px)" },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
            scale: { type: "spring", stiffness: 260, damping: 18 },
        },
    },
};

function subscribeNoop() {
    return () => {};
}

function getIsOfflineSnapshot() {
    return window.location.pathname === "/~offline" || !window.navigator.onLine;
}

function getIsOfflineServerSnapshot() {
    return false;
}

/**
 * Splash screen exibida uma vez a cada abertura ou recarregamento do site,
 * mantida montada no RootLayout para não ser interrompida por redirecionamentos.
 */
export default function SplashScreen() {
    const isOfflineRoute = useSyncExternalStore(
        subscribeNoop,
        getIsOfflineSnapshot,
        getIsOfflineServerSnapshot,
    );
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (isOfflineRoute) {
            notifySplashDone();
            return;
        }

        let minDurationDone = false;
        let pageLoaded = document.readyState === "complete";
        let dismissed = false;

        const dismiss = () => {
            if (dismissed) {
                return;
            }

            dismissed = true;
            setVisible(false);
            notifySplashDone();
        };

        const tryDismiss = () => {
            if (minDurationDone && pageLoaded) {
                dismiss();
            }
        };

        const handleLoad = () => {
            pageLoaded = true;
            tryDismiss();
        };

        if (!pageLoaded) {
            window.addEventListener("load", handleLoad, { once: true });
        }

        const minTimer = window.setTimeout(() => {
            minDurationDone = true;
            tryDismiss();
        }, SPLASH_MIN_DURATION_MS);

        const maxTimer = window.setTimeout(() => {
            dismiss();
        }, SPLASH_MAX_WAIT_MS);

        return () => {
            window.removeEventListener("load", handleLoad);
            window.clearTimeout(minTimer);
            window.clearTimeout(maxTimer);
        };
    }, [isOfflineRoute]);

    if (isOfflineRoute) {
        return null;
    }

    return (
        <AnimatePresence>
            {visible ? (
                <motion.div
                    key="app-splash-screen"
                    role="status"
                    aria-label="Carregando Solidarize"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        pointerEvents: "none",
                        transition: {
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                        },
                    }}
                    className="fixed inset-0 z-100 flex touch-none flex-col items-center justify-center gap-6 bg-background select-none"
                >
                    <motion.div variants={logoEntrance} initial="hidden" animate="show">
                        <IconLogo className="size-24" />
                    </motion.div>
                    <TextAnimate
                        by="character"
                        className="text-5xl font-bold font-young-serif"
                        as="h1"
                        delay={0.2}
                        startOnView={false}
                        once
                    >
                        Solidarize
                    </TextAnimate>
                    <motion.footer
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.45,
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-1 px-6 text-center"
                    >
                        <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                            <span>Desenvolvido com</span>
                            <svg
                                aria-label="amor"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-3.5 shrink-0"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span>
                                por{" "}
                                <strong className="font-semibold text-foreground/85">
                                    João Guilherme
                                </strong>
                            </span>
                        </p>
                        <span className="text-xs text-muted-foreground">
                            {APP_VERSION}
                        </span>
                    </motion.footer>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
