/// <reference lib="webworker" />

import { defaultCache, PAGES_CACHE_NAME } from "@serwist/next/worker";
import {
    NetworkOnly,
    Serwist,
    type PrecacheEntry,
    type RuntimeCaching,
    type SerwistGlobalConfig,
} from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const STALE_RUNTIME_CACHES = [
    PAGES_CACHE_NAME.html,
    PAGES_CACHE_NAME.rsc,
    PAGES_CACHE_NAME.rscPrefetch,
    "others",
    "apis",
];

const runtimeCaching: RuntimeCaching[] =
    process.env.NODE_ENV !== "production"
        ? defaultCache
        : [
            {
                matcher: ({ request, url: { pathname }, sameOrigin }) =>
                    sameOrigin
                    && !pathname.startsWith("/api/")
                    && (request.mode === "navigate" || request.destination === "document"),
                handler: new NetworkOnly({
                    networkTimeoutSeconds: 10,
                }),
            },
            {
                matcher: ({ request, url: { pathname }, sameOrigin }) =>
                    sameOrigin
                    && (request.headers.get("RSC") === "1" || pathname.startsWith("/api/")),
                handler: new NetworkOnly({
                    networkTimeoutSeconds: 10,
                }),
            },
            ...defaultCache,
        ];

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching,
    fallbacks: {
        entries: [
            {
                url: "/~offline",
                matcher({ request }) {
                    return request.destination === "document" || request.mode === "navigate";
                },
            },
        ],
    },
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        Promise.all(STALE_RUNTIME_CACHES.map((cacheName) => caches.delete(cacheName))),
    );
});

serwist.addEventListeners();
