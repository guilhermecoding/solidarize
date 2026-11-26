import type { Metadata } from "next";
import { WifiOff01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { OfflineRetryButton } from "@/app/~offline/_components/offline-retry-button";
import IconLogo from "@/components/logo/icon-logo";
import { Badge } from "@/components/ui/badge";

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
                <div className="flex flex-col items-center gap-4">
                    <IconLogo className="size-16" />
                    <Badge variant="muted" className="gap-1.5 px-3 py-1">
                        <HugeiconsIcon icon={WifiOff01Icon} strokeWidth={2} className="size-3.5" />
                        Modo offline
                    </Badge>
                </div>
                <div className="flex flex-col gap-2">
                    <h1 className="font-young-serif text-2xl font-bold sm:text-3xl">
                        Você está sem conexão
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Verifique seu acesso à internet (Wi-Fi ou dados móveis) para continuar usando o Solidarize. A página será recarregada automaticamente assim que a conexão retornar.
                    </p>
                </div>
                <OfflineRetryButton />
            </div>
        </main>
    );
}
