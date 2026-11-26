"use client";

import { useCallback, useEffect } from "react";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { OFFLINE_RETURN_URL_KEY } from "@/components/offline-monitor";
import { Button } from "@/components/ui/button";

function readSafeReturnUrl(): string {
    try {
        const saved = window.sessionStorage.getItem(OFFLINE_RETURN_URL_KEY);
        window.sessionStorage.removeItem(OFFLINE_RETURN_URL_KEY);

        if (
            saved
            && saved.startsWith("/")
            && !saved.startsWith("//")
            && saved !== "/~offline"
        ) {
            return saved;
        }
    } catch {
        // Ignora erro de acesso ao sessionStorage.
    }

    return "/";
}

/**
 * Botão de reconexão exibido na página offline com retorno automático à rota anterior ao voltar a ficar online.
 */
export function OfflineRetryButton() {
    const reconnect = useCallback(() => {
        if (window.location.pathname === "/~offline") {
            window.location.replace(readSafeReturnUrl());
            return;
        }

        window.location.reload();
    }, []);

    useEffect(() => {
        window.addEventListener("online", reconnect);

        return () => {
            window.removeEventListener("online", reconnect);
        };
    }, [reconnect]);

    return (
        <Button type="button" size="lg" onClick={reconnect}>
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="size-4" />
            Tentar novamente
        </Button>
    );
}
