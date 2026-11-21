"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit03Icon, InboxIcon, ShoppingBasket03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { BasketDrawer } from "@/app/(sistema)/cestas/_components/basket-drawer";
import { ResultDialog } from "@/components/shared/result-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMemberAccess } from "@/hooks/use-member-access";
import type { BasketRecord, BasketTemplateRecord } from "@/services/basket/basket.type";
import type { FoodOptionRecord } from "@/services/food/food.type";

type BasketsListPanelProps = {
    baskets: BasketRecord[];
    canWrite: boolean;
    templates: BasketTemplateRecord[];
    foods: FoodOptionRecord[];
};

/**
 * Painel de listagem de cestas dividido entre "Em estoque" e "Sem estoque".
 */
export function BasketsListPanel({
    baskets,
    canWrite: initialCanWrite,
    templates,
    foods,
}: BasketsListPanelProps) {
    const router = useRouter();
    const access = useMemberAccess();
    const canWrite = access.isPending ? initialCanWrite : access.canWrite;

    const [editing, setEditing] = useState<BasketRecord | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const inStock = baskets.filter((basket) => basket.quantity > 0);
    const outOfStock = baskets.filter((basket) => basket.quantity === 0);

    return (
        <>
            <div className="flex flex-col gap-10">
                <BasketGroupSection
                    title="Em estoque"
                    emptyMessage="Nenhuma cesta em estoque no momento."
                    baskets={inStock}
                    canWrite={canWrite}
                    onEdit={setEditing}
                />
                <BasketGroupSection
                    title="Sem estoque"
                    emptyMessage="Nenhuma cesta com estoque zerado."
                    baskets={outOfStock}
                    canWrite={canWrite}
                    onEdit={setEditing}
                />
            </div>

            {canWrite ? (
                <BasketDrawer
                    open={editing !== null}
                    basket={editing}
                    templates={templates}
                    foods={foods}
                    onOpenChange={(nextOpen) => {
                        if (!nextOpen) {
                            setEditing(null);
                        }
                    }}
                    onSaved={(message) => {
                        setEditing(null);
                        setSuccessMessage(message);
                        router.refresh();
                    }}
                />
            ) : null}

            <ResultDialog
                status="success"
                open={successMessage !== null}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setSuccessMessage(null);
                    }
                }}
                title="Deu certo!"
                subtitle={successMessage ?? ""}
            />
        </>
    );
}

function BasketGroupSection({
    title,
    emptyMessage,
    baskets,
    canWrite,
    onEdit,
}: {
    title: string;
    emptyMessage: string;
    baskets: BasketRecord[];
    canWrite: boolean;
    onEdit: (basket: BasketRecord) => void;
}) {
    return (
        <section className="flex flex-col gap-4">
            <header className="flex items-center gap-2 border-b pb-3">
                <h2 className="text-lg font-semibold">{title}</h2>
                <Badge variant="muted">{baskets.length}</Badge>
            </header>

            {baskets.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card py-12 text-center text-muted-foreground">
                    <HugeiconsIcon icon={InboxIcon} strokeWidth={2} className="size-8" />
                    <p className="text-sm">{emptyMessage}</p>
                </div>
            ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {baskets.map((basket) => (
                        <li key={basket.id}>
                            <article className="flex aspect-square flex-col justify-between rounded-2xl border bg-card p-5 text-card-foreground">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                                        <HugeiconsIcon
                                            icon={ShoppingBasket03Icon}
                                            strokeWidth={2}
                                            className="size-5"
                                        />
                                    </span>
                                    {canWrite ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            className="text-muted-foreground hover:text-foreground"
                                            aria-label={`Editar cesta ${basket.name}`}
                                            onClick={() => onEdit(basket)}
                                        >
                                            <HugeiconsIcon
                                                icon={Edit03Icon}
                                                strokeWidth={2}
                                                className="size-4"
                                            />
                                        </Button>
                                    ) : null}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <h3 className="truncate text-base font-semibold tracking-tight">
                                        {basket.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Criada em {basket.createdAtDateLabel}
                                    </p>
                                    <Badge
                                        variant={basket.quantity > 0 ? "success" : "muted"}
                                        className="mt-1"
                                    >
                                        {basket.quantity > 0
                                            ? `${basket.quantity} em estoque`
                                            : "0 em estoque"}
                                    </Badge>
                                </div>
                            </article>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
