import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "Solidarize",
        short_name: "Solidarize",
        description:
            "Solidarize é uma plataforma de gestão de doações para instituições de caridade.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        lang: "pt-BR",
        background_color: "#1B1B1B",
        theme_color: "#1B1B1B",
        // Ícones temporários em public/icons/ gerados a partir do logo; substituir pelos ícones finais quando disponíveis.
        icons: [
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icon-logo.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "any",
            },
        ],
    };
}
