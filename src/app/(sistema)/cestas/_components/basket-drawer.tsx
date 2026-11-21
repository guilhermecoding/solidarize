"use client";

import { useEffect, useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useAction } from "next-safe-action/hooks";
import {
    GridViewIcon,
    Layers01Icon,
    Package01Icon,
    ShoppingBasket03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
    createBasketAction,
    getNextBasketNameAction,
    updateBasketAction,
} from "@/app/(sistema)/cestas/action";
import { FoodCheckboxBox } from "@/app/(sistema)/cestas/_components/food-checkbox-box";
import { QuantityStepper } from "@/app/(sistema)/cestas/_components/quantity-stepper";
import {
    createBasketSchema,
    emptyCreateBasketFormValues,
    updateBasketSchema,
    type CreateBasketFormValues,
} from "@/app/(sistema)/cestas/schema";
import { ResultDialog } from "@/components/shared/result-dialog";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BasketRecord, BasketTemplateRecord } from "@/services/basket/basket.type";
import type { FoodOptionRecord } from "@/services/food/food.type";

type BasketDrawerProps = {
    open: boolean;
    basket: BasketRecord | null;
    nextBasketName?: string;
    templates: BasketTemplateRecord[];
    foods: FoodOptionRecord[];
    onOpenChange: (open: boolean) => void;
    onSaved: (message: string) => void;
};

/**
 * Dialog/Drawer para cadastrar novas cestas ou editar uma cesta existente.
 */
export function BasketDrawer({
    open,
    basket,
    nextBasketName = "",
    templates,
    foods,
    onOpenChange,
    onSaved,
}: BasketDrawerProps) {
    const isMobile = useIsMobile();
    const title = basket ? `Editar Cesta ${basket.name}` : "Novas Cestas";
    const description = basket
        ? "Atualize o modelo, a quantidade em estoque ou os alimentos vinculados à cesta."
        : "Monte e registre novas cestas com base em itens avulsos ou modelos pré-definidos.";

    const formContent = (
        <BasketForm
            key={basket?.id ?? (open ? "new-open" : "new-closed")}
            open={open}
            basket={basket}
            nextBasketName={nextBasketName}
            templates={templates}
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
                    {formContent}
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
                {formContent}
            </DialogContent>
        </Dialog>
    );
}

function BasketForm({
    open,
    basket,
    nextBasketName,
    templates,
    foods,
    surface,
    onSaved,
}: {
    open: boolean;
    basket: BasketRecord | null;
    nextBasketName: string;
    templates: BasketTemplateRecord[];
    foods: FoodOptionRecord[];
    surface: "drawer" | "dialog";
    onSaved: (message: string) => void;
}) {
    const [generatedName, setGeneratedName] = useState(nextBasketName);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [pendingEmptyFoodsValue, setPendingEmptyFoodsValue] =
        useState<CreateBasketFormValues | null>(null);

    useEffect(() => {
        if (!open || basket) {
            return;
        }

        let cancelled = false;

        void getNextBasketNameAction().then((result) => {
            if (!cancelled && result?.data) {
                setGeneratedName(result.data);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [open, basket]);

    const availableFoodIds = new Set(foods.map((food) => food.id));
    const previouslySelectedIds = basket ? new Set(basket.foodIds) : undefined;

    const templateOptions = [
        { value: "new", label: "Nova" },
        ...templates.map((template) => ({
            value: template.id,
            label: template.name,
        })),
    ];

    const { execute: createBasket, isPending: isCreating } = useAction(createBasketAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                setSaveError(data.message);
                return;
            }

            onSaved(data.message ?? "Cesta cadastrada com sucesso.");
        },
        onError: ({ error }) => {
            setSaveError(error.serverError ?? "Não foi possível cadastrar a cesta.");
        },
    });

    const { execute: updateBasket, isPending: isUpdating } = useAction(updateBasketAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                setSaveError(data.message);
                return;
            }

            onSaved(data.message ?? "Cesta atualizada com sucesso.");
        },
        onError: ({ error }) => {
            setSaveError(error.serverError ?? "Não foi possível atualizar a cesta.");
        },
    });

    const isPending = isCreating || isUpdating;

    const initialValues: CreateBasketFormValues = basket
        ? {
            templateId: basket.templateId ?? "new",
            quantity: basket.quantity,
            foodIds: basket.foodIds.filter((id) => availableFoodIds.has(id)),
        }
        : emptyCreateBasketFormValues;

    const form = useForm({
        defaultValues: initialValues,
        validators: {
            onSubmit: ({ value }) => {
                const parsed = basket
                    ? updateBasketSchema.safeParse({ id: basket.id, ...value })
                    : createBasketSchema.safeParse(value);

                if (parsed.success) {
                    return undefined;
                }

                return parsed.error.issues[0]?.message ?? "Verifique os campos informados.";
            },
        },
        onSubmit: ({ value }) => {
            if (value.foodIds.length === 0) {
                setPendingEmptyFoodsValue(value);
                return;
            }

            submitValues(value);
        },
    });

    const selectedQuantity = useStore(form.store, (state) => state.values.quantity);
    const selectedFoodCount = useStore(form.store, (state) => state.values.foodIds.length);
    const submissionAttempts = useStore(form.store, (state) => state.submissionAttempts);

    function submitValues(value: CreateBasketFormValues) {
        if (basket) {
            updateBasket({
                id: basket.id,
                templateId: value.templateId,
                quantity: value.quantity,
                foodIds: value.foodIds,
            });
            return;
        }

        createBasket(value);
    }

    function handleTemplateChange(nextTemplateId: string | null) {
        if (!nextTemplateId) {
            return;
        }

        form.setFieldValue("templateId", nextTemplateId);

        if (nextTemplateId === "new") {
            form.setFieldValue("foodIds", []);
            return;
        }

        const matchedTemplate = templates.find((item) => item.id === nextTemplateId);

        if (matchedTemplate) {
            form.setFieldValue(
                "foodIds",
                matchedTemplate.foodIds.filter((id) => availableFoodIds.has(id)),
            );
        }
    }

    const cancelLabel = "Cancelar";
    const submitLabel = "Prosseguir";

    return (
        <>
            <form
                id="basket-form"
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
                    <Field>
                        <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={ShoppingBasket03Icon} strokeWidth={2} className="size-4" />
                            <FieldLabel htmlFor="basket-name" required>Nome</FieldLabel>
                        </div>
                        <Input
                            id="basket-name"
                            aria-describedby="basket-name-hint"
                            value={basket ? basket.name : generatedName}
                            placeholder="Gerando nome..."
                            disabled
                            readOnly
                        />
                        <FieldDescription id="basket-name-hint" className="text-xs">
                            Não é possível modificar
                        </FieldDescription>
                    </Field>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <form.Field name="templateId">
                            {(field) => {
                                const errors = extractErrors(field.state.meta.errors, field.state.meta.isTouched, submissionAttempts);
                                const invalid = errors.length > 0;

                                return (
                                    <Field data-invalid={invalid || undefined}>
                                        <div className="flex items-center gap-2">
                                            <HugeiconsIcon icon={GridViewIcon} strokeWidth={2} className="size-4" />
                                            <FieldLabel htmlFor={field.name} required>Modelo</FieldLabel>
                                        </div>
                                        <Select
                                            value={field.state.value}
                                            items={templateOptions}
                                            onValueChange={handleTemplateChange}
                                        >
                                            <SelectTrigger
                                                id={field.name}
                                                className="text-base"
                                                aria-invalid={invalid || undefined}
                                                onBlur={field.handleBlur}
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {templateOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError errors={errors} />
                                    </Field>
                                );
                            }}
                        </form.Field>

                        <form.Field name="quantity">
                            {(field) => {
                                const errors = extractErrors(field.state.meta.errors, field.state.meta.isTouched, submissionAttempts);
                                const invalid = errors.length > 0;

                                return (
                                    <Field data-invalid={invalid || undefined}>
                                        <div className="flex items-center gap-2">
                                            <HugeiconsIcon icon={Layers01Icon} strokeWidth={2} className="size-4" />
                                            <FieldLabel htmlFor={field.name} required>Quantidade</FieldLabel>
                                        </div>
                                        <QuantityStepper
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            min={basket ? 0 : 1}
                                            disabled={isPending}
                                            invalid={invalid}
                                            onChange={field.handleChange}
                                            onBlur={field.handleBlur}
                                        />
                                        <FieldError errors={errors} />
                                    </Field>
                                );
                            }}
                        </form.Field>
                    </div>

                    <form.Field name="foodIds">
                        {(field) => (
                            <Field className="flex flex-1 flex-col">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <HugeiconsIcon icon={Package01Icon} strokeWidth={2} className="size-4" />
                                        <FieldLabel>Alimentos</FieldLabel>
                                    </div>
                                    <Badge variant="muted">
                                        {selectedFoodCount} {selectedFoodCount === 1 ? "selecionado" : "selecionados"}
                                    </Badge>
                                </div>
                                <FoodCheckboxBox
                                    foods={foods}
                                    selectedIds={field.state.value}
                                    requiredQuantity={selectedQuantity}
                                    previouslySelectedIds={previouslySelectedIds}
                                    previousBasketQuantity={basket?.quantity ?? 0}
                                    disabled={isPending}
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
                            </Field>
                        )}
                    </form.Field>
                </FieldGroup>
            </form>

            {surface === "dialog" ? (
                <DialogFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
                    <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
                        {cancelLabel}
                    </DialogClose>
                    <Button
                        type="submit"
                        form="basket-form"
                        loading={isPending}
                        loadingText="Salvando"
                    >
                        {submitLabel}
                    </Button>
                </DialogFooter>
            ) : (
                <DrawerFooter>
                    <Button
                        type="submit"
                        form="basket-form"
                        loading={isPending}
                        loadingText="Salvando"
                    >
                        {submitLabel}
                    </Button>
                    <DrawerClose render={<Button type="button" variant="outline" disabled={isPending} />}>
                        {cancelLabel}
                    </DrawerClose>
                </DrawerFooter>
            )}

            <Dialog
                open={pendingEmptyFoodsValue !== null}
                disablePointerDismissal
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setPendingEmptyFoodsValue(null);
                    }
                }}
            >
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Aviso</DialogTitle>
                        <DialogDescription className="text-base text-foreground/85">
                            Você optou por não vincular alimentos a esta cesta. Não há nenhum problema, mas adicionar alimentos deixaria o controle mais prático
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => {
                                const values = pendingEmptyFoodsValue;
                                setPendingEmptyFoodsValue(null);

                                if (values) {
                                    submitValues(values);
                                }
                            }}
                        >
                            Ciente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ResultDialog
                status="warning"
                open={saveError !== null}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setSaveError(null);
                    }
                }}
                title="Não foi possível salvar"
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
