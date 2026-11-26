"use client";

import { useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useAction } from "next-safe-action/hooks";
import {
    BarCode01Icon,
    Calendar03Icon,
    Delete03Icon,
    Layers01Icon,
    Package01Icon,
    Store01Icon,
    Tag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
    createFoodAction,
    deleteFoodAction,
    updateFoodAction,
} from "@/app/(sistema)/cestas/action";
import { QuantityStepper } from "@/app/(sistema)/cestas/_components/quantity-stepper";
import {
    createFoodSchema,
    editFoodFormSchema,
    emptyCreateFoodFormValues,
    type CreateFoodFormValues,
} from "@/app/(sistema)/cestas/schema";
import SeparatorSection from "@/components/separator-section";
import { AdminPasswordDialog } from "@/components/shared/admin-password-dialog";
import { ResultDialog } from "@/components/shared/result-dialog";
import { SystemDialog } from "@/components/shared/system-dialog";
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
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
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
import {
    foodTypeIcons,
    foodTypeLabels,
    foodTypes,
    type FoodRecord,
} from "@/services/food/food.type";

type FoodDrawerProps = {
    open: boolean;
    food?: FoodRecord | null;
    onOpenChange: (open: boolean) => void;
    onSaved: (message: string) => void;
};

const foodTypeOptions = [...foodTypes]
    .map((type) => ({
        value: type,
        label: foodTypeLabels[type],
        icon: foodTypeIcons[type],
    }))
    .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));

/**
 * Dialog/Drawer para cadastrar um novo alimento ou editar um alimento existente.
 */
export function FoodDrawer({ open, food = null, onOpenChange, onSaved }: FoodDrawerProps) {
    const isMobile = useIsMobile();
    const title = food ? `Editar Alimento #${food.batch}` : "Novo Alimento";
    const description = food
        ? "Atualize as informações e a quantidade em estoque deste alimento."
        : "Adicione novos itens ao estoque informando validade, marca e quantidade.";

    const formContent = (
        <FoodForm
            key={food?.id ?? (open ? "food-open" : "food-closed")}
            food={food}
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
    food,
    surface,
    onSaved,
}: {
    food: FoodRecord | null;
    surface: "drawer" | "dialog";
    onSaved: (message: string) => void;
}) {
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const { executeAsync: deleteFood } = useAction(deleteFoodAction);

    const { execute: createFood, isPending: isCreating } = useAction(createFoodAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                setSaveError(data.message);
                return;
            }

            onSaved(data.message ?? "Alimento cadastrado com sucesso.");
        },
        onError: ({ error }) => {
            setSaveError(error.serverError ?? "Não foi possível cadastrar o alimento.");
        },
    });

    const { execute: updateFood, isPending: isUpdating } = useAction(updateFoodAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                setSaveError(data.message);
                return;
            }

            onSaved(data.message ?? "Alimento atualizado com sucesso.");
        },
        onError: ({ error }) => {
            setSaveError(error.serverError ?? "Não foi possível atualizar o alimento.");
        },
    });

    const isPending = isCreating || isUpdating;

    const initialValues: CreateFoodFormValues = food
        ? {
            label: food.label,
            type: food.type,
            expiresAt: food.expiresAtLabel ?? "",
            brand: food.brand,
            quantity: food.quantity,
            productCode: food.productCode,
        }
        : emptyCreateFoodFormValues;

    const form = useForm({
        defaultValues: initialValues,
        validators: {
            onSubmit: food ? editFoodFormSchema : createFoodSchema,
        },
        onSubmit: ({ value }) => {
            if (food) {
                updateFood({ id: food.id, ...value });
                return;
            }

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
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                        className="flex items-center gap-2 text-lg"
                                                    >
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
                                            min={food ? 0 : 1}
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

                        <Field>
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} className="size-4" />
                                <FieldLabel htmlFor="food-batch" required>Lote</FieldLabel>
                            </div>
                            <Input
                                id="food-batch"
                                aria-describedby="food-batch-hint"
                                value={food ? `#${food.batch}` : "Gerado automaticamente (#XXXXXXXX)"}
                                disabled
                                readOnly
                            />
                            <FieldDescription id="food-batch-hint" className="text-xs">
                                Não é possível modificar
                            </FieldDescription>
                        </Field>
                    </div>

                    {food ? (
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
                                    Excluir Alimento
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

            <SystemDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
                variant="destructive"
                title="Excluir alimento?"
                description="Confirme a exclusão do alimento selecionado."
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
                    O alimento <strong>{food?.label}</strong> (#{food?.batch}) será removido e desvinculado de todas as cestas e modelos.
                </p>
            </SystemDialog>

            <AdminPasswordDialog
                open={passwordOpen}
                onOpenChange={setPasswordOpen}
                onConfirm={async (password) => {
                    if (!food) {
                        return { ok: false, message: "Alimento inválido." };
                    }

                    const result = await deleteFood({ id: food.id, password });

                    if (result.serverError) {
                        return { ok: false, message: result.serverError };
                    }

                    if (result.validationErrors) {
                        return { ok: false, message: "A senha deve ter pelo menos 8 caracteres." };
                    }

                    if (!result.data?.ok) {
                        return {
                            ok: false,
                            message: result.data?.message ?? "Não foi possível excluir o alimento.",
                        };
                    }

                    return { ok: true };
                }}
                onSuccess={() => {
                    setPasswordOpen(false);
                    onSaved("Alimento excluído com sucesso.");
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
