"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Add01Icon,
    Calendar03Icon,
    Edit03Icon,
    InboxIcon,
    UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { BasketTemplateDrawer } from "@/app/(sistema)/cestas/_components/basket-template-drawer";
import { ResultDialog } from "@/components/shared/result-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMemberAccess } from "@/hooks/use-member-access";
import type { BasketTemplateRecord } from "@/services/basket/basket.type";
import type { FoodOptionRecord } from "@/services/food/food.type";

type BasketTemplatesPanelProps = {
    templates: BasketTemplateRecord[];
    foods: FoodOptionRecord[];
    canWrite: boolean;
};

/**
 * Painel de listagem, criação e edição de modelos de cesta.
 */
export function BasketTemplatesPanel({
    templates,
    foods,
    canWrite: initialCanWrite,
}: BasketTemplatesPanelProps) {
    const router = useRouter();
    const access = useMemberAccess();
    const canWrite = access.isPending ? initialCanWrite : access.canWrite;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<BasketTemplateRecord | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    function openCreate() {
        setEditing(null);
        setDrawerOpen(true);
    }

    function openEdit(template: BasketTemplateRecord) {
        setEditing(template);
        setDrawerOpen(true);
    }

    return (
        <>
            <div className="flex flex-col gap-5">
                <div className="flex flex-col-reverse items-start justify-end gap-3 sm:flex-row sm:items-center">
                    {templates.length > 0 ? (
                        <span className="mt-4 flex items-center gap-1 text-xl font-medium sm:mt-0">
                            Total
                            <span className="rounded-md border border-foreground bg-muted-foreground/30 px-2 text-sm font-medium">
                                {templates.length}
                            </span>
                        </span>
                    ) : null}
                    {canWrite ? (
                        <Button
                            type="button"
                            className="w-full shrink-0 sm:ml-auto sm:w-auto"
                            onClick={openCreate}
                        >
                            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                            Novo modelo
                        </Button>
                    ) : null}
                </div>

                {templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card py-16 text-center text-muted-foreground">
                        <HugeiconsIcon icon={InboxIcon} strokeWidth={2} className="size-10" />
                        <div className="flex flex-col gap-1">
                            <p className="text-base font-semibold text-foreground">
                                Nenhum modelo de cesta cadastrado
                            </p>
                            <p className="text-sm">
                                Crie um modelo pré-definido para agilizar o cadastro de novas cestas.
                            </p>
                        </div>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {templates.map((template) => (
                            <li key={template.id}>
                                <article className="flex flex-col gap-3 rounded-2xl border bg-card p-5 text-card-foreground">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <h2 className="truncate text-base font-semibold">
                                                {template.name}
                                            </h2>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                                <span className="inline-flex items-center gap-1">
                                                    <HugeiconsIcon
                                                        icon={Calendar03Icon}
                                                        strokeWidth={2}
                                                        className="size-3.5"
                                                    />
                                                    {template.createdAtLabel}
                                                </span>
                                                <span aria-hidden="true">•</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <HugeiconsIcon
                                                        icon={UserCircleIcon}
                                                        strokeWidth={2}
                                                        className="size-3.5"
                                                    />
                                                    {template.createdByName}
                                                </span>
                                            </div>
                                        </div>
                                        {canWrite ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                className="shrink-0 text-muted-foreground hover:text-foreground"
                                                aria-label={`Editar modelo ${template.name}`}
                                                onClick={() => openEdit(template)}
                                            >
                                                <HugeiconsIcon
                                                    icon={Edit03Icon}
                                                    strokeWidth={2}
                                                    className="size-4"
                                                />
                                            </Button>
                                        ) : null}
                                    </div>

                                    <div className="flex flex-col gap-2 border-t pt-3">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Alimentos ({template.foodCount})
                                        </span>
                                        {template.foods.length === 0 ? (
                                            <p className="text-xs text-muted-foreground">
                                                Nenhum alimento vinculado.
                                            </p>
                                        ) : (
                                            <ul className="flex flex-wrap gap-1.5">
                                                {template.foods.map((food) => (
                                                    <li key={food.id}>
                                                        <Badge variant="muted">{food.label}</Badge>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </article>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {canWrite ? (
                <BasketTemplateDrawer
                    open={drawerOpen}
                    template={editing}
                    foods={foods}
                    onOpenChange={(nextOpen) => {
                        setDrawerOpen(nextOpen);

                        if (!nextOpen) {
                            setEditing(null);
                        }
                    }}
                    onSaved={(message) => {
                        setDrawerOpen(false);
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
