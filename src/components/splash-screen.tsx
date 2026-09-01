"use client";

import { motion, type Variants } from "motion/react";

import IconLogo from "./logo/icon-logo";
import { TextAnimate } from "./ui/text-animate";

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

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background">
            <motion.div variants={logoEntrance} initial="hidden" animate="show">
                <IconLogo className="size-24" />
            </motion.div>
            <TextAnimate
                by="character"
                className="text-5xl font-bold font-young-serif"
                as="h1"
                delay={0.2}
            >
                Solidarize
            </TextAnimate>
        </div>
    );
}
