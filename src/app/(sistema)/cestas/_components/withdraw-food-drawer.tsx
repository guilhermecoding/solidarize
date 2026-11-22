"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import {
    Alert02Icon,
    InboxIcon,
    Package01Icon,
    Tick02Icon,
    UserIcon,
    UserQuestion01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { withdrawFoodsAction } from "@/app/(sistema)/cestas/action";
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
import type { BeneficiaryOptionRecord } from "@/services/beneficiary/beneficiary.type";
import type { FoodRecord } from "@/services/food/food.type";

type WithdrawFoodDrawerProps = {
    open: boolean;
    foods: FoodRecord[];
    beneficiaries: BeneficiaryOptionRecord[];
    onOpenChange: (open: boolean) => void;
    onSaved: (message: string) => void;
};

const STEP_LABELS = ["Alimentos", "Beneficiário", "Confirmação"] as const;

/**
 * Dialog/Drawer em 3 etapas para registrar a retirada de alimentos em estoque.
 */
export function WithdrawFoodDrawer({
    open,
    foods,
    beneficiaries,
    onOpenChange,
    onSaved,
}: WithdrawFoodDrawerProps) {
    return (
        <WithdrawFoodFlow
            key={open ? "withdraw-food-open" : "withdraw-food-closed"}
            open={open}
            foods={foods}
            beneficiaries={beneficiaries}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
        />
    );
}

function WithdrawFoodFlow({
    open,
    foods,
    beneficiaries,
    onOpenChange,
    onSaved,
}: WithdrawFoodDrawerProps) {
    const [step, setStep] = useState<WithdrawStep>(1);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [recipient, setRecipient] = useState<WithdrawRecipientSelection>({ type: "none" });
    const [justification, setJustification] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { execute: executeWithdraw, isPending } = useAction(withdrawFoodsAction, {
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

    const selectedItems = foods
        .map((food) => ({
            food,
            quantity: Math.min(Math.max(0, quantities[food.id] ?? 0), food.quantity),
        }))
        .filter((entry) => entry.quantity > 0);

    const totalSelectedUnits = selectedItems.reduce((sum, entry) => sum + entry.quantity, 0);
    const selectedBeneficiary =
        recipient.type === "listed"
            ? beneficiaries.find((item) => item.id === recipient.beneficiaryId) ?? null
            : null;

    const canProceedStep1 = foods.length > 0 && selectedItems.length > 0;
    const canProceedStep2 =
        recipient.type === "listed"
            ? selectedBeneficiary !== null
            : recipient.type === "unlisted"
                ? justification.trim().length >= WITHDRAWAL_JUSTIFICATION_MIN_LENGTH
                : false;

    const stepDescription =
        step === 1
            ? "Escolha quais alimentos em estoque serão retirados e informe a quantidade."
            : step === 2
                ? "Selecione o beneficiário para quem os alimentos serão direcionados."
                : "Revise os alimentos selecionados e o destinatário antes de confirmar.";

    function handleConfirm() {
        if (!canProceedStep1 || !canProceedStep2 || isPending) {
            return;
        }

        const items = selectedItems.map((entry) => ({
            foodId: entry.food.id,
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
                                {selectedItems.length === 1 ? "alimento" : "alimentos"} ·{" "}
                                {totalSelectedUnits}{" "}
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
                title="Retirar Alimentos"
                description={stepDescription}
                step={step}
                stepLabels={STEP_LABELS}
                preventDismiss={isPending}
                footer={footer}
            >
                {step === 1 ? (
                    foods.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card py-16 text-center text-muted-foreground">
                            <HugeiconsIcon icon={InboxIcon} strokeWidth={2} className="size-10" />
                            <p className="text-base font-semibold text-foreground">
                                Não há alimentos disponíveis
                            </p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3 p-2.5">
                            {foods.map((food) => {
                                const selectedQuantity = Math.min(
                                    Math.max(0, quantities[food.id] ?? 0),
                                    food.quantity,
                                );
                                const isSelected = selectedQuantity > 0;

                                return (
                                    <li key={food.id}>
                                        <article
                                            className={cn(
                                                "relative flex flex-col gap-3 rounded-2xl border bg-card p-4 text-card-foreground transition-all",
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

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-base font-semibold">
                                                            {food.label}
                                                        </h3>
                                                        {food.brand ? (
                                                            <span className="text-xs text-muted-foreground">
                                                                · {food.brand}
                                                            </span>
                                                        ) : null}
                                                        <Badge variant="muted">{food.quantity} un.</Badge>
                                                    </div>

                                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                        <span>{food.typeLabel}</span>
                                                        <span aria-hidden="true">•</span>
                                                        <span className="font-mono">#{food.batch}</span>
                                                        <span aria-hidden="true">•</span>
                                                        <span>Cadastro: {food.createdAtLabel}</span>
                                                        {food.expiryStatus === "ok"
                                                        || food.expiryStatus === "none" ? (
                                                            <>
                                                                <span aria-hidden="true">•</span>
                                                                <span>
                                                                    Validade:{" "}
                                                                    {food.expiresAtLabel ?? "Sem validade"}
                                                                </span>
                                                            </>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                {food.expiryStatus === "expiring" && food.expiresAtLabel ? (
                                                    <Badge variant="warning" className="shrink-0 gap-1.5 py-1">
                                                        <HugeiconsIcon
                                                            icon={Alert02Icon}
                                                            strokeWidth={2}
                                                            className="size-3.5"
                                                        />
                                                        Validade: {food.expiresAtLabel}
                                                    </Badge>
                                                ) : null}

                                                {food.expiryStatus === "expired" && food.expiresAtLabel ? (
                                                    <Badge variant="destructive" className="shrink-0 gap-1.5 py-1">
                                                        <HugeiconsIcon
                                                            icon={Alert02Icon}
                                                            strokeWidth={2}
                                                            className="size-3.5"
                                                        />
                                                        Vencido · {food.expiresAtLabel}
                                                    </Badge>
                                                ) : null}
                                            </div>

                                            <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Quantidade para retirada
                                                </span>
                                                <WithdrawQuantityControl
                                                    itemLabel={food.label}
                                                    value={selectedQuantity}
                                                    max={food.quantity}
                                                    disabled={isPending}
                                                    className="w-full sm:w-44"
                                                    onChange={(nextValue) =>
                                                        setQuantities((prev) => ({
                                                            ...prev,
                                                            [food.id]: nextValue,
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
                                    Alimentos selecionados
                                </h3>
                                <Badge variant="success">
                                    {totalSelectedUnits}{" "}
                                    {totalSelectedUnits === 1 ? "unidade" : "unidades"}
                                </Badge>
                            </div>
                            <ul className="flex flex-col gap-2.5">
                                {selectedItems.map(({ food, quantity }) => (
                                    <li
                                        key={food.id}
                                        className="flex flex-col gap-2 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                                <HugeiconsIcon
                                                    icon={Package01Icon}
                                                    strokeWidth={2}
                                                    className="size-5"
                                                />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold">
                                                    {food.label}
                                                    {food.brand ? ` · ${food.brand}` : ""}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {food.typeLabel} • #{food.batch}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                                            <span className="text-xs text-muted-foreground">
                                                Restará: {food.quantity - quantity} un.
                                            </span>
                                            <Badge variant="success">
                                                {quantity} {quantity === 1 ? "unidade" : "unidades"}
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
