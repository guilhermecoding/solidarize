"use client";

import { InboxIcon, ShoppingBasket03Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { WithdrawQuantityControl } from "@/app/(sistema)/cestas/_components/withdraw-quantity-control";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BasketRecord } from "@/services/basket/basket.type";

type WithdrawBasketSelectionStepProps = {
    baskets: BasketRecord[];
    quantities: Record<string, number>;
    disabled?: boolean;
    maxTotalUnits?: number;
    onChangeQuantity: (basketId: string, nextValue: number) => void;
};

/**
 * Etapa de seleção de cestas em estoque com controle de quantidade para retirada.
 */
export function WithdrawBasketSelectionStep({
    baskets,
    quantities,
    disabled = false,
    maxTotalUnits,
    onChangeQuantity,
}: WithdrawBasketSelectionStepProps) {
    if (baskets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card py-16 text-center text-muted-foreground">
                <HugeiconsIcon icon={InboxIcon} strokeWidth={2} className="size-10" />
                <p className="text-base font-semibold text-foreground">
                    Não há cestas disponíveis
                </p>
            </div>
        );
    }

    const totalSelectedUnits = baskets.reduce(
        (sum, basket) => sum + Math.min(Math.max(0, quantities[basket.id] ?? 0), basket.quantity),
        0,
    );
    const remainingTotal =
        maxTotalUnits !== undefined
            ? Math.max(0, maxTotalUnits - totalSelectedUnits)
            : Number.POSITIVE_INFINITY;

    return (
        <ul className="grid grid-cols-1 gap-4 p-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {baskets.map((basket) => {
                const selectedQuantity = Math.min(
                    Math.max(0, quantities[basket.id] ?? 0),
                    basket.quantity,
                );
                const maxForItem = Math.min(basket.quantity, selectedQuantity + remainingTotal);
                const isSelected = selectedQuantity > 0;

                return (
                    <li key={basket.id} className="flex">
                        <article
                            className={cn(
                                "relative flex w-full flex-col gap-4 rounded-2xl border bg-card p-5 text-card-foreground transition-all",
                                isSelected &&
                                    "border-emerald-500/70 bg-emerald-500/5 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10",
                            )}
                        >
                            {isSelected ? (
                                <span
                                    aria-hidden="true"
                                    className="absolute -top-2 -left-2 z-10 flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm ring-2 ring-background"
                                >
                                    <HugeiconsIcon
                                        icon={Tick02Icon}
                                        strokeWidth={2.5}
                                        className="size-3.5"
                                    />
                                </span>
                            ) : null}

                            <div className="flex items-start justify-between gap-2">
                                <span
                                    className={cn(
                                        "flex size-10 items-center justify-center rounded-xl",
                                        isSelected
                                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                            : "bg-muted",
                                    )}
                                >
                                    <HugeiconsIcon
                                        icon={ShoppingBasket03Icon}
                                        strokeWidth={2}
                                        className="size-5"
                                    />
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <h3 className="truncate text-base font-semibold tracking-tight">
                                    {basket.name}
                                </h3>
                                {basket.deletedTemplateName ? (
                                    <p className="truncate text-xs text-muted-foreground italic">
                                        Modelo &apos;{basket.deletedTemplateName}&apos; apagado
                                    </p>
                                ) : basket.templateName ? (
                                    <p className="truncate text-xs text-muted-foreground">
                                        {basket.templateName}
                                    </p>
                                ) : null}
                                <p className="text-xs text-muted-foreground">
                                    Criada em {basket.createdAtDateLabel}
                                </p>
                                <Badge variant="success" className="mt-1">
                                    {basket.quantity} em estoque
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-2 border-t pt-3">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Alimentos ({basket.foodCount})
                                </span>
                                {basket.foods.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                        Nenhum alimento vinculado.
                                    </p>
                                ) : (
                                    <ul className="flex flex-wrap gap-1.5">
                                        {basket.foods.map((food) => (
                                            <li key={food.id}>
                                                <Badge variant="muted">{food.label}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="mt-auto border-t pt-3">
                                <WithdrawQuantityControl
                                    itemLabel={`cesta ${basket.name}`}
                                    value={selectedQuantity}
                                    max={maxForItem}
                                    disabled={disabled}
                                    onChange={(nextValue) => onChangeQuantity(basket.id, nextValue)}
                                />
                            </div>
                        </article>
                    </li>
                );
            })}
        </ul>
    );
}
