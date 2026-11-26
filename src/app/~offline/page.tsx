import type { Metadata } from "next";
import { WifiOff02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { OfflineRetryButton } from "@/app/~offline/_components/offline-retry-button";

export const metadata: Metadata = {
    title: "Sem conexão",
    description: "Você está sem conexão com a internet no momento.",
};

/**
 * Página estática exibida pelo Service Worker quando uma navegação falha por falta de conexão.
 */
export default function OfflinePage() {
    return (
        <main className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-background px-6 py-12 text-center text-foreground">
            <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border bg-card p-8 shadow-sm">
                <HugeiconsIcon icon={WifiOff02Icon} strokeWidth={2} className="size-16" />
                <div className="flex flex-col gap-2">
                    <h1 className="font-young-serif text-2xl font-bold sm:text-3xl">
                        Ops!
                    </h1>
                    <p className="text-xl sm:text-2xl font-medium font-young-serif text-muted-foreground">
                        Parece que você está sem conexão
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Verifique seu acesso à internet (Wi-Fi ou dados móveis) para continuar usando o Solidarize.
                    </p>
                </div>
                <OfflineRetryButton />
            </div>
        </main>
    );
}
