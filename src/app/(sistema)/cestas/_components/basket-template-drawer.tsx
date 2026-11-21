"use client";

import { useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useAction } from "next-safe-action/hooks";
import {
    Delete02Icon,
    Edit03Icon,
    GridViewIcon,
    InboxIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BasketTemplateRecord } from "@/services/basket/basket.type";
import type { FoodOptionRecord } from "@/services/food/food.type";

type BasketTemplateDrawerProps = {
    open: boolean;
    templates: BasketTemplateRecord[];
    foods: FoodOptionRecord[];
    onOpenChange: (open: boolean) => void;
    onChanged: (message: string) => void;
};

/**
 * Dialog/Drawer para cadastrar, editar e gerenciar modelos de cesta.
 */
export function BasketTemplateDrawer({
    open,
    templates,
    foods,
    onOpenChange,
    onChanged,
}: BasketTemplateDrawerProps) {
    const isMobile = useIsMobile();
    const title = "Modelos de Cesta";
    const description = "Defina padrões pré-configurados de cestas com alimentos vinculados.";

    const body = (
        <TemplateManager
            key={open ? "templates-open" : "templates-closed"}
            templates={templates}
            foods={foods}
            surface={isMobile ? "drawer" : "dialog"}
            onChanged={onChanged}
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

function TemplateManager({
    templates,
    foods,
    surface,
    onChanged,
}: {
    templates: BasketTemplateRecord[];
    foods: FoodOptionRecord[];
    surface: "drawer" | "dialog";
    onChanged: (message: string) => void;
}) {
    const [tab, setTab] = useState<"form" | "list">("form");
    const [editing, setEditing] = useState<BasketTemplateRecord | null>(null);
    const [deleting, setDeleting] = useState<BasketTemplateRecord | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const { executeAsync: deleteTemplate, isPending: isDeleting } = useAction(deleteBasketTemplateAction);

    const availableFoodIds = new Set(foods.map((food) => food.id));

    return (
        <>
            <Tabs
                value={tab}
                onValueChange={(nextTab) => {
                    if (nextTab === "form" || nextTab === "list") {
                        setTab(nextTab);
                    }
                }}
                className="flex min-h-0 flex-1 flex-col gap-0"
            >
                <div className={surface === "dialog" ? "shrink-0 px-6 pt-4" : "shrink-0 px-4 pt-3"}>
                    <TabsList>
                        <TabsTrigger value="form">
                            {editing ? "Editar modelo" : "Novo modelo"}
                        </TabsTrigger>
                        <TabsTrigger value="list">
                            Cadastrados ({templates.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="form" className="flex min-h-0 flex-1 flex-col">
                    <TemplateForm
                        key={editing?.id ?? "new-template"}
                        editing={editing}
                        foods={foods}
                        availableFoodIds={availableFoodIds}
                        surface={surface}
                        onCancelEdit={() => setEditing(null)}
                        onError={setSaveError}
                        onSaved={onChanged}
                    />
                </TabsContent>

                <TabsContent
                    value="list"
                    className={
                        surface === "dialog"
                            ? "min-h-0 flex-1 overflow-y-auto px-6 py-4"
                            : "min-h-0 flex-1 overflow-y-auto px-4 py-4"
                    }
                >
                    {templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-muted/20 py-14 text-center text-muted-foreground">
                            <HugeiconsIcon icon={InboxIcon} strokeWidth={2} className="size-9" />
                            <p className="text-sm font-medium">Nenhum modelo de cesta cadastrado</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {templates.map((template) => (
                                <li
                                    key={template.id}
                                    className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-4"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">{template.name}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {template.foodCount}{" "}
                                            {template.foodCount === 1 ? "alimento" : "alimentos"} ·{" "}
                                            {template.createdByName}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-label={`Editar modelo ${template.name}`}
                                            onClick={() => {
                                                setEditing(template);
                                                setTab("form");
                                            }}
                                        >
                                            <HugeiconsIcon icon={Edit03Icon} strokeWidth={2} className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            className="text-destructive hover:text-destructive"
                                            aria-label={`Excluir modelo ${template.name}`}
                                            onClick={() => setDeleting(template)}
                                        >
                                            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </TabsContent>
            </Tabs>

            <SystemDialog
                open={deleting !== null}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setDeleting(null);
                    }
                }}
                variant="destructive"
                title="Excluir modelo de cesta?"
                description="Confirme a exclusão do modelo selecionado."
                actions={
                    <>
                        <DialogClose render={<Button type="button" variant="outline" disabled={isDeleting} />}>
                            Cancelar
                        </DialogClose>
                        <Button
                            type="button"
                            variant="destructive"
                            loading={isDeleting}
                            loadingText="Excluindo"
                            onClick={async () => {
                                if (!deleting) {
                                    return;
                                }

                                const result = await deleteTemplate({ id: deleting.id });
                                setDeleting(null);

                                if (result.serverError) {
                                    setSaveError(result.serverError);
                                    return;
                                }

                                if (!result.data?.ok) {
                                    setSaveError(result.data?.message ?? "Não foi possível excluir o modelo.");
                                    return;
                                }

                                onChanged(result.data.message ?? "Modelo de cesta excluído com sucesso.");
                            }}
                        >
                            Excluir
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-muted-foreground">
                    O modelo <strong>{deleting?.name}</strong> será removido. Cestas já criadas com ele serão preservadas.
                </p>
            </SystemDialog>

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

function TemplateForm({
    editing,
    foods,
    availableFoodIds,
    surface,
    onCancelEdit,
    onError,
    onSaved,
}: {
    editing: BasketTemplateRecord | null;
    foods: FoodOptionRecord[];
    availableFoodIds: ReadonlySet<string>;
    surface: "drawer" | "dialog";
    onCancelEdit: () => void;
    onError: (message: string) => void;
    onSaved: (message: string) => void;
}) {
    const { execute: createTemplate, isPending: isCreating } = useAction(createBasketTemplateAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                onError(data.message);
                return;
            }

            onSaved(data.message ?? "Modelo de cesta cadastrado com sucesso.");
        },
        onError: ({ error }) => {
            onError(error.serverError ?? "Não foi possível cadastrar o modelo.");
        },
    });

    const { execute: updateTemplate, isPending: isUpdating } = useAction(updateBasketTemplateAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                onError(data.message);
                return;
            }

            onSaved(data.message ?? "Modelo de cesta atualizado com sucesso.");
        },
        onError: ({ error }) => {
            onError(error.serverError ?? "Não foi possível atualizar o modelo.");
        },
    });

    const isPending = isCreating || isUpdating;

    const initialValues: BasketTemplateFormValues = editing
        ? {
            name: editing.name,
            foodIds: editing.foodIds.filter((id) => availableFoodIds.has(id)),
        }
        : emptyBasketTemplateFormValues;

    const form = useForm({
        defaultValues: initialValues,
        validators: {
            onSubmit: basketTemplateSchema,
        },
        onSubmit: ({ value }) => {
            if (editing) {
                updateTemplate({ id: editing.id, ...value });
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
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <HugeiconsIcon icon={GridViewIcon} strokeWidth={2} className="size-4" />
                                            <FieldLabel htmlFor={field.name} required>Nome do modelo</FieldLabel>
                                        </div>
                                        {editing ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="xs"
                                                onClick={onCancelEdit}
                                            >
                                                Voltar para novo modelo
                                            </Button>
                                        ) : null}
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
                        loading={isPending}
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
                        loading={isPending}
                        loadingText="Salvando"
                    >
                        Prosseguir
                    </Button>
                    <DrawerClose render={<Button type="button" variant="outline" disabled={isPending} />}>
                        Cancelar
                    </DrawerClose>
                </DrawerFooter>
            )}
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
