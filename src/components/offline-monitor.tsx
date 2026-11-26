"use client";

import { useEffect } from "react";

export const OFFLINE_RETURN_URL_KEY = "solidarize:offline-return-url";

/**
 * Monitora a perda de conexão no navegador e redireciona imediatamente para `/~offline`
 * quando o Service Worker está ativo, evitando telas com dados/buscas travadas.
 */
export function OfflineMonitor() {
    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            return;
        }

        const redirectToOffline = () => {
            if (window.navigator.onLine) {
                return;
            }

            if (window.location.pathname === "/~offline") {
                return;
            }

            if (!navigator.serviceWorker?.controller) {
                return;
            }

            try {
                const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
                window.sessionStorage.setItem(OFFLINE_RETURN_URL_KEY, currentUrl);
            } catch {
                // Ignora indisponibilidade de sessionStorage em modos restritos.
            }

            // Navegação completa de documento para que o Service Worker sirva `/~offline` do precache.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.assign("/~offline");
        };

        if (!window.navigator.onLine) {
            redirectToOffline();
        }

        window.addEventListener("offline", redirectToOffline);

        return () => {
            window.removeEventListener("offline", redirectToOffline);
        };
    }, []);

    return null;
}
