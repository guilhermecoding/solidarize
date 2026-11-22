"use client";

import Link from "next/link";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { HubAction, ModuleItem } from "@/app/(sistema)/cestas/_config/modules";
import { cn } from "@/lib/utils";

const baseCardClassName =
    "group flex h-full flex-col rounded-2xl border bg-card p-5 text-card-foreground transition-all outline-none hover:border-foreground/20 hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/50";

/**
 * Card de navegação ou ação de um módulo na página hub de Cestas e Alimentos.
 */
export function ModuleCard({
    item,
    canWrite = true,
    onAction,
}: {
    item: ModuleItem;
    canWrite?: boolean;
    onAction?: (action: HubAction) => void;
}) {
    const content = (
        <>
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
            <p className="mt-1 mb-5 text-sm text-muted-foreground">{item.description}</p>
            <span className="mt-auto flex w-full items-center justify-between border-t pt-4 text-sm font-medium">
                {item.actionLabel}
                <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                />
            </span>
        </>
    );

    if (item.kind === "action") {
        return (
            <button
                type="button"
                disabled={!canWrite}
                onClick={() => onAction?.(item.action)}
                className={cn(
                    baseCardClassName,
                    "w-full cursor-pointer text-left disabled:pointer-events-none disabled:opacity-50",
                )}
            >
                {content}
            </button>
        );
    }

    return (
        <Link href={item.href} className={baseCardClassName}>
            {content}
        </Link>
    );
}
