"use client";

import { useEffect, useRef } from "react";

import type { HTMLInstallElement } from "@/@types/pwa-install";

type PwaNativeInstallButtonProps = {
    onInstalled: () => void;
    onDismissed: () => void;
};

/**
 * Renderiza o elemento HTML nativo `<install>` com escuta de conclusão e dispensa do prompt.
 */
export function PwaNativeInstallButton({
    onInstalled,
    onDismissed,
}: PwaNativeInstallButtonProps) {
    const installRef = useRef<HTMLInstallElement | null>(null);

    useEffect(() => {
        const element = installRef.current;

        if (!element) {
            return;
        }

        const handleAction = () => {
            onInstalled();
        };

        const handleDismiss = () => {
            onDismissed();
        };

        element.addEventListener("promptaction", handleAction);
        element.addEventListener("promptdismiss", handleDismiss);

        return () => {
            element.removeEventListener("promptaction", handleAction);
            element.removeEventListener("promptdismiss", handleDismiss);
        };
    }, [onDismissed, onInstalled]);

    return (
        <div className="w-full">
            <install
                ref={installRef}
                style={{ width: "100%" }}
                className="block min-h-12 w-full rounded-2xl"
            />
        </div>
    );
}
