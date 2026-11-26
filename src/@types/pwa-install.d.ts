import type * as React from "react";

export interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export interface HTMLInstallElement extends HTMLElement {
    installUrl?: string;
    manifestId?: string;
}

declare global {
    interface Navigator {
        standalone?: boolean;
        userAgentData?: {
            mobile?: boolean;
        };
        install?: (
            installUrl?: string,
            manifestId?: string,
        ) => Promise<{ manifestId: string }>;
    }

    interface Window {
        HTMLInstallElement?: {
            prototype: HTMLInstallElement;
            new (): HTMLInstallElement;
        };
        __solidarizeDeferredInstallPrompt?: BeforeInstallPromptEvent | null;
        __solidarizeSplashDone?: boolean;
    }
}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            install: React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            > & {
                installurl?: string;
                manifestid?: string;
            };
        }
    }
}
