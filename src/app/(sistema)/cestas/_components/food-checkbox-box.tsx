"use client";

import { InboxIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { FoodOptionRecord } from "@/services/food/food.type";

type FoodCheckboxBoxProps = {
    foods: FoodOptionRecord[];
    selectedIds: string[];
    onToggle: (foodId: string) => void;
    requiredQuantity?: number;
    previouslySelectedIds?: ReadonlySet<string>;
    previousBasketQuantity?: number;
    disabled?: boolean;
    emptyMessage?: string;
};

/**
 * Caixa scrollável com lista vertical de alimentos em checkbox para formulários de cesta e modelo.
 */
export function FoodCheckboxBox({
    foods,
    selectedIds,
    onToggle,
    requiredQuantity,
    previouslySelectedIds,
    previousBasketQuantity = 0,
    disabled = false,
    emptyMessage = "Nenhum alimento cadastrado no sistema.",
}: FoodCheckboxBoxProps) {
    const selectedSet = new Set(selectedIds);

    return (
        <div className="flex min-h-56 max-h-80 flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border bg-muted/20 p-3">
            {foods.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
                    <HugeiconsIcon icon={InboxIcon} strokeWidth={2} className="size-8" />
                    <p className="text-sm">{emptyMessage}</p>
                </div>
            ) : (
                foods.map((food) => {
                    const checked = selectedSet.has(food.id);
                    const neededStock = computeNeededStock({
                        foodId: food.id,
                        requiredQuantity,
                        previouslySelectedIds,
                        previousBasketQuantity,
                    });
                    const insufficientStock = neededStock > 0 && food.quantity < neededStock;
                    const rowDisabled = disabled || (!checked && insufficientStock);

                    return (
                        <label
                            key={food.id}
                            className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-3.5 py-2.5 text-sm transition-colors hover:bg-muted/40",
                                checked && "border-primary/40 bg-primary/5",
                                rowDisabled && "cursor-not-allowed opacity-60 hover:bg-card",
                            )}
                        >
                            <Checkbox
                                checked={checked}
                                disabled={rowDisabled}
                                onCheckedChange={() => onToggle(food.id)}
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium text-foreground">{food.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {food.typeLabel} · #{food.batch}
                                    </span>
                                </div>
                                {insufficientStock ? (
                                    <p className="mt-0.5 text-xs text-destructive">
                                        Estoque insuficiente para esta quantidade (necessário: {neededStock}).
                                    </p>
                                ) : null}
                            </div>
                            <Badge variant={food.quantity === 0 ? "destructive" : "muted"}>
                                {food.quantity} un.
                            </Badge>
                        </label>
                    );
                })
            )}
        </div>
    );
}

function computeNeededStock({
    foodId,
    requiredQuantity,
    previouslySelectedIds,
    previousBasketQuantity,
}: {
    foodId: string;
    requiredQuantity?: number;
    previouslySelectedIds?: ReadonlySet<string>;
    previousBasketQuantity: number;
}): number {
    if (requiredQuantity === undefined) {
        return 0;
    }

    if (!previouslySelectedIds) {
        return Math.max(0, requiredQuantity);
    }

    if (!previouslySelectedIds.has(foodId)) {
        return Math.max(0, requiredQuantity);
    }

    return Math.max(0, requiredQuantity - previousBasketQuantity);
}
