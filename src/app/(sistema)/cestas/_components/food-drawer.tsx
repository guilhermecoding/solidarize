"use client";

import { useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useAction } from "next-safe-action/hooks";
import {
    BarCode01Icon,
    Calendar03Icon,
    Layers01Icon,
    Package01Icon,
    Store01Icon,
    Tag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { createFoodAction } from "@/app/(sistema)/cestas/action";
import { QuantityStepper } from "@/app/(sistema)/cestas/_components/quantity-stepper";
import { createFoodSchema, emptyCreateFoodFormValues } from "@/app/(sistema)/cestas/schema";
import { ResultDialog } from "@/components/shared/result-dialog";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatBrazilianDateInput } from "@/lib/date-br";
import { foodTypeIcons, foodTypeLabels, foodTypes } from "@/services/food/food.type";

type FoodDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (message: string) => void;
};

const foodTypeOptions = [...foodTypes]
    .map((type) => ({
        value: type,
        label: foodTypeLabels[type],
        icon: foodTypeIcons[type],
    }))
    .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));

/**
 * Dialog/Drawer para cadastrar um novo alimento no estoque.
 */
export function FoodDrawer({ open, onOpenChange, onCreated }: FoodDrawerProps) {
    const isMobile = useIsMobile();
    const title = "Novo Alimento";
    const description = "Adicione novos itens ao estoque informando validade, marca e quantidade.";

    const formContent = (
        <FoodForm
            key={open ? "food-open" : "food-closed"}
            surface={isMobile ? "drawer" : "dialog"}
            onCreated={onCreated}
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
            <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(52rem,calc(100%-2rem))]">
                <DialogHeader className="shrink-0 px-6 pt-6 pr-14">
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {formContent}
            </DialogContent>
        </Dialog>
    );
}

function FoodForm({
    surface,
    onCreated,
}: {
    surface: "drawer" | "dialog";
    onCreated: (message: string) => void;
}) {
    const [saveError, setSaveError] = useState<string | null>(null);

    const { execute: createFood, isPending } = useAction(createFoodAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                setSaveError(data.message);
                return;
            }

            onCreated(data.message ?? "Alimento cadastrado com sucesso.");
        },
        onError: ({ error }) => {
            setSaveError(error.serverError ?? "Não foi possível cadastrar o alimento.");
        },
    });

    const form = useForm({
        defaultValues: emptyCreateFoodFormValues,
        validators: {
            onSubmit: createFoodSchema,
        },
        onSubmit: ({ value }) => {
            createFood(value);
        },
    });

    const submissionAttempts = useStore(form.store, (state) => state.submissionAttempts);

    return (
        <>
            <form
                id="food-form"
                className={
                    surface === "dialog"
                        ? "min-h-0 flex-1 overflow-y-auto px-6 py-4"
                        : "min-h-0 flex-1 overflow-y-auto px-4 py-4"
                }
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    form.handleSubmit();
                }}
            >
                <FieldGroup>
                    <form.Field name="label">
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
                                        <HugeiconsIcon icon={Package01Icon} strokeWidth={2} className="size-4" />
                                        <FieldLabel htmlFor={field.name} required>Rótulo do alimento</FieldLabel>
                                    </div>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        placeholder="Ex: Arroz Tipo 1 (5kg)"
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

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <form.Field name="type">
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
                                            <HugeiconsIcon icon={Layers01Icon} strokeWidth={2} className="size-4" />
                                            <FieldLabel htmlFor={field.name} required>Tipo de alimento</FieldLabel>
                                        </div>
                                        <Select
                                            value={field.state.value}
                                            items={foodTypeOptions}
                                            onValueChange={(value) => {
                                                if (value) {
                                                    field.handleChange(value);
                                                }
                                            }}
                                        >
                                            <SelectTrigger
                                                id={field.name}
                                                className="text-base"
                                                aria-invalid={invalid || undefined}
                                                onBlur={field.handleBlur}
                                            >
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {foodTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value} className="text-lg flex items-center gap-2">
                                                        <HugeiconsIcon
                                                            icon={option.icon}
                                                            strokeWidth={2}
                                                            className="size-5 text-muted-foreground"
                                                        />
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

                        <form.Field name="brand">
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
                                            <HugeiconsIcon icon={Store01Icon} strokeWidth={2} className="size-4" />
                                            <FieldLabel htmlFor={field.name}>Marca</FieldLabel>
                                        </div>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            placeholder="Ex: Tio João"
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
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <form.Field name="expiresAt">
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
                                            <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
                                            <FieldLabel htmlFor={field.name}>Data de validade</FieldLabel>
                                        </div>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            inputMode="numeric"
                                            placeholder="DD/MM/AAAA"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(event) =>
                                                field.handleChange(formatBrazilianDateInput(event.target.value))
                                            }
                                            aria-invalid={invalid || undefined}
                                        />
                                        <FieldError errors={errors} />
                                    </Field>
                                );
                            }}
                        </form.Field>

                        <form.Field name="productCode">
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
                                            <HugeiconsIcon icon={BarCode01Icon} strokeWidth={2} className="size-4" />
                                            <FieldLabel htmlFor={field.name}>Código do produto</FieldLabel>
                                        </div>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            placeholder="Ex: 7891234567890"
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
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <form.Field name="quantity">
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
                                            <HugeiconsIcon icon={Layers01Icon} strokeWidth={2} className="size-4" />
                                            <FieldLabel htmlFor={field.name} required>Quantidade</FieldLabel>
                                        </div>
                                        <QuantityStepper
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            min={1}
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

                        <Field>
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} className="size-4" />
                                <FieldLabel htmlFor="food-batch" required>Lote</FieldLabel>
                            </div>
                            <Input
                                id="food-batch"
                                value="Gerado automaticamente (#XXXXXXXX)"
                                disabled
                                readOnly
                            />
                        </Field>
                    </div>
                </FieldGroup>
            </form>

            {surface === "dialog" ? (
                <DialogFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
                    <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
                        Cancelar
                    </DialogClose>
                    <Button
                        type="submit"
                        form="food-form"
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
                        form="food-form"
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
