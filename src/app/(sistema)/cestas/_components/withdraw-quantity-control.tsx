"use client";

import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WithdrawQuantityControlProps = {
    itemLabel: string;
    value: number;
    max: number;
    disabled?: boolean;
    onChange: (nextValue: number) => void;
    className?: string;
};

/**
 * Controle compacto (- N +) para selecionar a quantidade de itens a retirar sem ultrapassar o estoque disponível.
 */
export function WithdrawQuantityControl({
    itemLabel,
    value,
    max,
    disabled = false,
    onChange,
    className,
}: WithdrawQuantityControlProps) {
    const safeMax = Math.max(0, max);
    const safeValue = Math.min(Math.max(0, value), safeMax);

    function update(next: number) {
        const clamped = Math.min(Math.max(0, next), safeMax);
        onChange(clamped);
    }

    return (
        <div
            className={cn(
                "flex items-center justify-between gap-2 rounded-xl border bg-background/80 p-1.5",
                safeValue > 0 && "border-emerald-500/40 bg-emerald-500/5",
                className,
            )}
        >
            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="shrink-0 rounded-lg border-input"
                aria-label={`Diminuir quantidade de ${itemLabel}`}
                disabled={disabled || safeValue <= 0}
                onClick={() => update(safeValue - 1)}
            >
                <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} className="size-4" />
            </Button>

            <span
                aria-live="polite"
                aria-label={`Quantidade selecionada de ${itemLabel}: ${safeValue}`}
                className={cn(
                    "min-w-10 text-center text-sm font-semibold tabular-nums",
                    safeValue > 0 ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground",
                )}
            >
                {safeValue}
            </span>

            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="shrink-0 rounded-lg border-input"
                aria-label={`Aumentar quantidade de ${itemLabel}`}
                disabled={disabled || safeValue >= safeMax}
                onClick={() => update(safeValue + 1)}
            >
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
            </Button>
        </div>
    );
}
