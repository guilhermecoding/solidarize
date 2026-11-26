"use client";

import { useEffect } from "react";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

/**
 * Botão de reconexão exibido na página offline com recarregamento automático ao voltar a ficar online.
 */
export function OfflineRetryButton() {
    useEffect(() => {
        const handleOnline = () => {
            window.location.reload();
        };

        window.addEventListener("online", handleOnline);

        return () => {
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    return (
        <Button
            type="button"
            size="lg"
            onClick={() => window.location.reload()}
        >
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="size-4" />
            Tentar novamente
        </Button>
    );
}
