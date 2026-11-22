"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import {
    InboxIcon,
    ShoppingBasket03Icon,
    Tick02Icon,
    UserIcon,
    UserQuestion01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { withdrawBasketsAction } from "@/app/(sistema)/cestas/action";
import {
    WithdrawBeneficiaryStep,
    type WithdrawRecipientSelection,
} from "@/app/(sistema)/cestas/_components/withdraw-beneficiary-step";
import { WithdrawQuantityControl } from "@/app/(sistema)/cestas/_components/withdraw-quantity-control";
import { WithdrawShell, type WithdrawStep } from "@/app/(sistema)/cestas/_components/withdraw-shell";
import { WITHDRAWAL_JUSTIFICATION_MIN_LENGTH } from "@/app/(sistema)/cestas/schema";
import { ResultDialog } from "@/components/shared/result-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BasketRecord } from "@/services/basket/basket.type";
import type { BeneficiaryOptionRecord } from "@/services/beneficiary/beneficiary.type";

type WithdrawBasketDrawerProps = {
    open: boolean;
    baskets: BasketRecord[];
    beneficiaries: BeneficiaryOptionRecord[];
    onOpenChange: (open: boolean) => void;
    onSaved: (message: string) => void;
};

const STEP_LABELS = ["Cestas", "Beneficiário", "Confirmação"] as const;

/**
 * Dialog/Drawer em 3 etapas para registrar a retirada de cestas em estoque.
 */
export function WithdrawBasketDrawer({
    open,
    baskets,
    beneficiaries,
    onOpenChange,
    onSaved,
}: WithdrawBasketDrawerProps) {
    const [prevOpen, setPrevOpen] = useState(open);
    const [step, setStep] = useState<WithdrawStep>(1);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [recipient, setRecipient] = useState<WithdrawRecipientSelection>({ type: "none" });
    const [justification, setJustification] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setStep(1);
            setQuantities({});
            setRecipient({ type: "none" });
            setJustification("");
            setSubmitError(null);
        }
    }

    const { execute: executeWithdraw, isPending } = useAction(withdrawBasketsAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                setSubmitError(data.message);
                return;
            }

            onSaved(data.message ?? "Retirada registrada com sucesso.");
        },
        onError: ({ error }) => {
            setSubmitError(error.serverError ?? "Não foi possível registrar a retirada.");
        },
    });

    const selectedItems = baskets
        .map((basket) => ({
            basket,
            quantity: Math.min(Math.max(0, quantities[basket.id] ?? 0), basket.quantity),
        }))
        .filter((entry) => entry.quantity > 0);

    const totalSelectedUnits = selectedItems.reduce((sum, entry) => sum + entry.quantity, 0);
    const selectedBeneficiary =
        recipient.type === "listed"
            ? beneficiaries.find(
                (item) => item.id === recipient.beneficiaryId && item.status === "approved",
            ) ?? null
            : null;

    const canProceedStep1 = baskets.length > 0 && selectedItems.length > 0;
    const canProceedStep2 =
        recipient.type === "listed"
            ? selectedBeneficiary !== null
            : recipient.type === "unlisted"
                ? justification.trim().length >= WITHDRAWAL_JUSTIFICATION_MIN_LENGTH
                : false;

    const stepDescription =
        step === 1
            ? "Escolha quais cestas em estoque serão retiradas e informe a quantidade."
            : step === 2
                ? "Selecione o beneficiário para quem as cestas serão direcionadas."
                : "Revise as cestas selecionadas e o destinatário antes de confirmar.";

    function handleConfirm() {
        if (!canProceedStep1 || !canProceedStep2 || isPending) {
            return;
        }

        const items = selectedItems.map((entry) => ({
            basketId: entry.basket.id,
            quantity: entry.quantity,
        }));

        if (recipient.type === "listed") {
            executeWithdraw({
                items,
                recipientType: "listed",
                beneficiaryId: recipient.beneficiaryId,
                justification: "",
            });
            return;
        }

        if (recipient.type === "unlisted") {
            executeWithdraw({
                items,
                recipientType: "unlisted",
                beneficiaryId: "",
                justification: justification.trim(),
            });
        }
    }

    const footer = (
        <>
            <div className="flex items-center gap-2">
                {step === 1 ? (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={isPending}
                        onClick={() => setStep((prev) => (prev === 3 ? 2 : 1))}
                    >
                        Voltar
                    </Button>
                )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                {step === 1 ? (
                    <>
                        {selectedItems.length > 0 ? (
                            <span className="text-center text-xs text-muted-foreground sm:text-right">
                                {selectedItems.length}{" "}
                                {selectedItems.length === 1 ? "cesta" : "cestas"} · {totalSelectedUnits}{" "}
                                {totalSelectedUnits === 1 ? "unidade" : "unidades"}
                            </span>
                        ) : null}
                        <Button
                            type="button"
                            className="w-full sm:w-auto"
                            disabled={!canProceedStep1}
                            onClick={() => setStep(2)}
                        >
                            Prosseguir
                        </Button>
                    </>
                ) : step === 2 ? (
                    <Button
                        type="button"
                        className="w-full sm:w-auto"
                        disabled={!canProceedStep2}
                        onClick={() => setStep(3)}
                    >
                        Prosseguir
                    </Button>
                ) : (
                    <Button
                        type="button"
                        className="w-full sm:w-auto"
                        loading={isPending}
                        loadingText="Registrando"
                        disabled={!canProceedStep1 || !canProceedStep2}
                        onClick={handleConfirm}
                    >
                        Confirmar retirada
                    </Button>
                )}
            </div>
        </>
    );

    return (
        <>
            <WithdrawShell
                open={open}
                onOpenChange={onOpenChange}
                title="Retirar Cestas"
                description={stepDescription}
                step={step}
                stepLabels={STEP_LABELS}
                preventDismiss={isPending}
                footer={footer}
            >
                {step === 1 ? (
                    baskets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card py-16 text-center text-muted-foreground">
                            <HugeiconsIcon icon={InboxIcon} strokeWidth={2} className="size-10" />
                            <p className="text-base font-semibold text-foreground">
                                Não há cestas disponíveis
                            </p>
                        </div>
                    ) : (
                        <ul className="grid grid-cols-1 gap-4 p-2.5 sm:grid-cols-2 lg:grid-cols-3">
                            {baskets.map((basket) => {
                                const selectedQuantity = Math.min(
                                    Math.max(0, quantities[basket.id] ?? 0),
                                    basket.quantity,
                                );
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
                                                    max={basket.quantity}
                                                    disabled={isPending}
                                                    onChange={(nextValue) =>
                                                        setQuantities((prev) => ({
                                                            ...prev,
                                                            [basket.id]: nextValue,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </article>
                                    </li>
                                );
                            })}
                        </ul>
                    )
                ) : step === 2 ? (
                    <WithdrawBeneficiaryStep
                        beneficiaries={beneficiaries}
                        selection={recipient}
                        justification={justification}
                        disabled={isPending}
                        onSelect={setRecipient}
                        onJustificationChange={setJustification}
                    />
                ) : (
                    <div className="flex flex-col gap-6">
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

                        <section className="flex flex-col gap-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Beneficiário direcionado
                            </h3>
                            <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                        <HugeiconsIcon
                                            icon={
                                                recipient.type === "unlisted"
                                                    ? UserQuestion01Icon
                                                    : UserIcon
                                            }
                                            strokeWidth={2}
                                            className="size-5"
                                        />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">
                                            {recipient.type === "unlisted"
                                                ? "Beneficiário não listado"
                                                : selectedBeneficiary?.name ?? "Beneficiário"}
                                        </p>
                                        {selectedBeneficiary ? (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {selectedBeneficiary.ageLabel}
                                                {selectedBeneficiary.cpf ? ` • ${selectedBeneficiary.cpf}` : ""}
                                                {" • "}
                                                {selectedBeneficiary.neighborhood}, {selectedBeneficiary.city}/{selectedBeneficiary.state}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                {recipient.type === "unlisted" ? (
                                    <div className="rounded-xl border bg-muted/30 px-3.5 py-2.5 text-sm">
                                        <span className="block text-xs font-medium text-muted-foreground">
                                            Justificativa
                                        </span>
                                        <p className="mt-1 break-words text-foreground">
                                            {justification.trim()}
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </section>
                    </div>
                )}
            </WithdrawShell>

            <ResultDialog
                status="warning"
                open={submitError !== null}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setSubmitError(null);
                    }
                }}
                title="Não foi possível concluir"
                subtitle={submitError ?? ""}
            />
        </>
    );
}
