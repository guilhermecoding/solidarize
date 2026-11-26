"use client";

import { ShoppingBasket03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";
import type { BasketRecord } from "@/services/basket/basket.type";

type WithdrawBasketSummarySectionProps = {
    selectedItems: Array<{ basket: BasketRecord; quantity: number }>;
    totalSelectedUnits: number;
};

/**
 * Resumo das cestas selecionadas e estoque restante exibido na etapa de confirmação.
 */
export function WithdrawBasketSummarySection({
    selectedItems,
    totalSelectedUnits,
}: WithdrawBasketSummarySectionProps) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Cestas selecionadas
                </h3>
                <Badge variant="success">
                    {totalSelectedUnits}{" "}
                    {totalSelectedUnits === 1 ? "unidade" : "unidades"}
                </Badge>
            </div>
            <ul className="flex flex-col gap-2.5">
                {selectedItems.map(({ basket, quantity }) => (
                    <li
                        key={basket.id}
                        className="flex flex-col gap-2 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                <HugeiconsIcon
                                    icon={ShoppingBasket03Icon}
                                    strokeWidth={2}
                                    className="size-5"
                                />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate font-semibold">{basket.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {basket.templateName
                                        ? basket.templateName
                                        : basket.deletedTemplateName
                                            ? `Modelo '${basket.deletedTemplateName}' apagado`
                                            : `${basket.foodCount} ${basket.foodCount === 1 ? "alimento" : "alimentos"}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                            <span className="text-xs text-muted-foreground">
                                Restará: {basket.quantity - quantity} em estoque
                            </span>
                            <Badge variant="success">
                                {quantity} {quantity === 1 ? "cesta" : "cestas"}
                            </Badge>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
