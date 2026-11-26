"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

function subscribe(onStoreChange: () => void) {
    window.addEventListener("popstate", onStoreChange);
    return () => window.removeEventListener("popstate", onStoreChange);
}

function getSnapshot() {
    return window.history.length > 1;
}

function getServerSnapshot() {
    return false;
}

export function PageBackButton() {
    const router = useRouter();
    const canGoBack = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    if (!canGoBack) {
        return null;
    }

    return (
        <div className="pb-2 sm:px-13 flex items-center gap-6 opacity-50">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Voltar"
                className="text-xs"
                onClick={() => router.back()}
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                Voltar
            </Button>
        </div>
    );
}
