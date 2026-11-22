"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";

import IconLogo from "./logo/icon-logo";
import { TextAnimate } from "./ui/text-animate";

const SPLASH_MIN_DURATION_MS = 1400;
const SPLASH_MAX_WAIT_MS = 3000;

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

/**
 * Splash screen exibida uma vez a cada abertura ou recarregamento do site,
 * mantida montada no RootLayout para não ser interrompida por redirecionamentos.
 */
export default function SplashScreen() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        let minDurationDone = false;
        let pageLoaded = document.readyState === "complete";
        let dismissed = false;

        const dismiss = () => {
            if (dismissed) {
                return;
            }

            dismissed = true;
            setVisible(false);
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
    }, []);

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
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
