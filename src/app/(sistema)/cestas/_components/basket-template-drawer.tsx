"use client";

import { useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useAction } from "next-safe-action/hooks";
import {
    Delete03Icon,
    GridViewIcon,
    Package01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
    createBasketTemplateAction,
    deleteBasketTemplateAction,
    updateBasketTemplateAction,
} from "@/app/(sistema)/cestas/action";
import { FoodCheckboxBox } from "@/app/(sistema)/cestas/_components/food-checkbox-box";
import {
    basketTemplateSchema,
    emptyBasketTemplateFormValues,
    type BasketTemplateFormValues,
} from "@/app/(sistema)/cestas/schema";
import SeparatorSection from "@/components/separator-section";
import { AdminPasswordDialog } from "@/components/shared/admin-password-dialog";
import { ResultDialog } from "@/components/shared/result-dialog";
import { SystemDialog } from "@/components/shared/system-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BasketTemplateRecord } from "@/services/basket/basket.type";
import type { FoodOptionRecord } from "@/services/food/food.type";

type BasketTemplateDrawerProps = {
    open: boolean;
    template: BasketTemplateRecord | null;
    foods: FoodOptionRecord[];
    onOpenChange: (open: boolean) => void;
    onSaved: (message: string) => void;
};

/**
 * Dialog/Drawer para cadastrar, editar ou excluir um modelo de cesta.
 */
export function BasketTemplateDrawer({
    open,
    template,
    foods,
    onOpenChange,
    onSaved,
}: BasketTemplateDrawerProps) {
    const isMobile = useIsMobile();
    const title = template ? "Editar Modelo de Cesta" : "Novo Modelo de Cesta";
    const description = template
        ? "Atualize o nome ou os alimentos vinculados a este modelo."
        : "Defina um padrão pré-configurado de cesta com alimentos vinculados.";

    const body = (
        <TemplateForm
            key={template?.id ?? (open ? "new-template-open" : "new-template-closed")}
            template={template}
            foods={foods}
            surface={isMobile ? "drawer" : "dialog"}
            onSaved={onSaved}
        />
    );

    if (isMobile) {
        return (
            <Drawer
                open={open}
                onOpenChange={onOpenChange}
                swipeDirection="down"
                snapPoints={[1]}
                showSwipeHandle
            >
                <DrawerContent
                    className="rounded-none"
                    style={{
                        "--drawer-content-height": "100dvh",
                        "--drawer-content-max-height": "100dvh",
                        "--drawer-inset": "0px",
                    } as React.CSSProperties}
                >
                    <DrawerHeader>
                        <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>
                        <DrawerDescription>{description}</DrawerDescription>
                    </DrawerHeader>
                    {body}
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(54rem,calc(100%-2rem))]">
                <DialogHeader className="shrink-0 px-6 pt-6 pr-14">
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {body}
            </DialogContent>
        </Dialog>
    );
}

function TemplateForm({
    template,
    foods,
    surface,
    onSaved,
}: {
    template: BasketTemplateRecord | null;
    foods: FoodOptionRecord[];
    surface: "drawer" | "dialog";
    onSaved: (message: string) => void;
}) {
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const availableFoodIds = new Set(foods.map((food) => food.id));

    const { execute: createTemplate, isPending: isCreating } = useAction(createBasketTemplateAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                setSaveError(data.message);
                return;
            }

            onSaved(data.message ?? "Modelo de cesta cadastrado com sucesso.");
        },
        onError: ({ error }) => {
            setSaveError(error.serverError ?? "Não foi possível cadastrar o modelo.");
        },
    });

    const { execute: updateTemplate, isPending: isUpdating } = useAction(updateBasketTemplateAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                setSaveError(data.message);
                return;
            }

            onSaved(data.message ?? "Modelo de cesta atualizado com sucesso.");
        },
        onError: ({ error }) => {
            setSaveError(error.serverError ?? "Não foi possível atualizar o modelo.");
        },
    });

    const { executeAsync: deleteTemplate, isPending: isDeleting } = useAction(
        deleteBasketTemplateAction,
    );

    const isPending = isCreating || isUpdating || isDeleting;

    const initialValues: BasketTemplateFormValues = template
        ? {
            name: template.name,
            foodIds: template.foodIds.filter((id) => availableFoodIds.has(id)),
        }
        : emptyBasketTemplateFormValues;

    const form = useForm({
        defaultValues: initialValues,
        validators: {
            onSubmit: basketTemplateSchema,
        },
        onSubmit: ({ value }) => {
            if (template) {
                updateTemplate({ id: template.id, ...value });
                return;
            }

            createTemplate(value);
        },
    });

    const selectedCount = useStore(form.store, (state) => state.values.foodIds.length);
    const submissionAttempts = useStore(form.store, (state) => state.submissionAttempts);

    return (
        <>
            <form
                id="template-form"
                className={
                    surface === "dialog"
                        ? "flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-4"
                        : "flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4"
                }
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    form.handleSubmit();
                }}
            >
                <FieldGroup className="flex flex-1 flex-col">
                    <form.Field name="name">
                        {(field) => {
                            const errors = extractErrors(
                                field.state.meta.errors,
                                field.state.meta.isTouched,
                                submissionAttempts,
                            );
                            const invalid = errors.length > 0;

                            return (
                                <Field data-invalid={invalid || undefined}>
                                    <div className="flex items-center gap-2">
                                        <HugeiconsIcon icon={GridViewIcon} strokeWidth={2} className="size-4" />
                                        <FieldLabel htmlFor={field.name} required>Nome do modelo</FieldLabel>
                                    </div>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        placeholder="Ex: Cesta Básica Familiar"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(event) => field.handleChange(event.target.value)}
                                        aria-invalid={invalid || undefined}
                                    />
                                    <FieldError errors={errors} />
                                </Field>
                            );
                        }}
                    </form.Field>

                    <form.Field name="foodIds">
                        {(field) => {
                            const errors = extractErrors(
                                field.state.meta.errors,
                                field.state.meta.isTouched,
                                submissionAttempts,
                            );
                            const invalid = errors.length > 0;

                            return (
                                <Field className="flex flex-1 flex-col" data-invalid={invalid || undefined}>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <HugeiconsIcon icon={Package01Icon} strokeWidth={2} className="size-4" />
                                            <FieldLabel required>Alimentos</FieldLabel>
                                        </div>
                                        <Badge variant="muted">
                                            {selectedCount} {selectedCount === 1 ? "selecionado" : "selecionados"}
                                        </Badge>
                                    </div>
                                    <FoodCheckboxBox
                                        foods={foods}
                                        selectedIds={field.state.value}
                                        disabled={isPending}
                                        emptyMessage="Cadastre alimentos primeiro para montar um modelo."
                                        onToggle={(foodId) => {
                                            const current = field.state.value;
                                            const exists = current.includes(foodId);
                                            field.handleChange(
                                                exists
                                                    ? current.filter((id) => id !== foodId)
                                                    : [...current, foodId],
                                            );
                                        }}
                                    />
                                    <FieldError errors={errors} />
                                </Field>
                            );
                        }}
                    </form.Field>

                    {template ? (
                        <>
                            <SeparatorSection title="Zona de Perigo" />
                            <div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className={surface === "drawer" ? "w-full font-bold" : "font-bold"}
                                    disabled={isPending}
                                    onClick={() => setConfirmDeleteOpen(true)}
                                >
                                    <HugeiconsIcon icon={Delete03Icon} strokeWidth={2.5} className="size-5" />
                                    Excluir Modelo
                                </Button>
                            </div>
                        </>
                    ) : null}
                </FieldGroup>
            </form>

            {surface === "dialog" ? (
                <DialogFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
                    <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
                        Cancelar
                    </DialogClose>
                    <Button
                        type="submit"
                        form="template-form"
                        loading={isCreating || isUpdating}
                        loadingText="Salvando"
                    >
                        Prosseguir
                    </Button>
                </DialogFooter>
            ) : (
                <DrawerFooter>
                    <Button
                        type="submit"
                        form="template-form"
                        loading={isCreating || isUpdating}
                        loadingText="Salvando"
                    >
                        Prosseguir
                    </Button>
                    <DrawerClose render={<Button type="button" variant="outline" disabled={isPending} />}>
                        Cancelar
                    </DrawerClose>
                </DrawerFooter>
            )}

            <SystemDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
                variant="destructive"
                title="Excluir modelo de cesta?"
                description="Confirme a exclusão do modelo selecionado."
                actions={
                    <>
                        <DialogClose render={<Button type="button" variant="outline" />}>
                            Cancelar
                        </DialogClose>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                setConfirmDeleteOpen(false);
                                setPasswordOpen(true);
                            }}
                        >
                            Confirmar
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-muted-foreground">
                    O modelo <strong>{template?.name}</strong> será removido. Cestas vinculadas passarão a exibir <strong>Modelo &apos;{template?.name}&apos; apagado</strong>.
                </p>
            </SystemDialog>

            <AdminPasswordDialog
                open={passwordOpen}
                onOpenChange={setPasswordOpen}
                onConfirm={async (password) => {
                    if (!template) {
                        return { ok: false, message: "Modelo inválido." };
                    }

                    const result = await deleteTemplate({ id: template.id, password });

                    if (result.serverError) {
                        return { ok: false, message: result.serverError };
                    }

                    if (result.validationErrors) {
                        return { ok: false, message: "A senha deve ter pelo menos 8 caracteres." };
                    }

                    if (!result.data?.ok) {
                        return {
                            ok: false,
                            message: result.data?.message ?? "Não foi possível excluir o modelo.",
                        };
                    }

                    return { ok: true };
                }}
                onSuccess={() => {
                    setPasswordOpen(false);
                    onSaved("Modelo de cesta excluído com sucesso.");
                }}
            />

            <ResultDialog
                status="warning"
                open={saveError !== null}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setSaveError(null);
                    }
                }}
                title="Não foi possível concluir"
                subtitle={saveError ?? ""}
            />
        </>
    );
}

function extractErrors(
    errors: ReadonlyArray<unknown>,
    isTouched: boolean,
    attempts: number,
) {
    if (!isTouched && attempts === 0) {
        return [];
    }

    return errors.flatMap((error) => {
        if (typeof error === "string" && error.length > 0) {
            return [{ message: error }];
        }

        if (
            error
            && typeof error === "object"
            && "message" in error
            && typeof error.message === "string"
            && error.message.length > 0
        ) {
            return [{ message: error.message }];
        }

        return [];
    });
}
