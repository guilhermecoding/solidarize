"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { WithdrawBasketSelectionStep } from "@/app/(sistema)/cestas/_components/withdraw-basket-selection-step";
import { WithdrawBasketSummarySection } from "@/app/(sistema)/cestas/_components/withdraw-basket-summary-section";
import { WithdrawShell } from "@/app/(sistema)/cestas/_components/withdraw-shell";
import { withdrawAssistedBasketsAction } from "@/app/(sistema)/retirar-cesta/action";
import { ResultDialog } from "@/components/shared/result-dialog";
import { Button } from "@/components/ui/button";
import type { BasketRecord } from "@/services/basket/basket.type";
import type { AssistedBeneficiarySummary } from "@/services/beneficiary/beneficiary.type";

type WithdrawAssistedBasketDrawerProps = {
    open: boolean;
    beneficiary: AssistedBeneficiarySummary | null;
    baskets: BasketRecord[];
    onOpenChange: (open: boolean) => void;
    onSaved: (message: string) => void;
};

const STEP_LABELS = ["Cestas", "Confirmação"] as const;

/**
 * Dialog/Drawer em 2 etapas para retirada de cestas na seção Para Você com beneficiário previamente selecionado.
 */
export function WithdrawAssistedBasketDrawer({
    open,
    beneficiary,
    baskets,
    onOpenChange,
    onSaved,
}: WithdrawAssistedBasketDrawerProps) {
    const [prevOpen, setPrevOpen] = useState(open);
    const [prevBeneficiaryId, setPrevBeneficiaryId] = useState<string | null>(beneficiary?.id ?? null);
    const [step, setStep] = useState<1 | 2>(1);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    const currentBeneficiaryId = beneficiary?.id ?? null;

    if (open !== prevOpen || currentBeneficiaryId !== prevBeneficiaryId) {
        setPrevOpen(open);
        setPrevBeneficiaryId(currentBeneficiaryId);

        if (open) {
            setStep(1);
            setQuantities({});
            setSubmitError(null);
        }
    }

    const { execute: executeWithdraw, isPending } = useAction(withdrawAssistedBasketsAction, {
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
    const canProceedStep1 = baskets.length > 0 && selectedItems.length > 0 && beneficiary !== null;

    const stepDescription =
        step === 1
            ? beneficiary
                ? `Escolha quais cestas em estoque serão retiradas para ${beneficiary.name} e informe a quantidade.`
                : "Escolha quais cestas em estoque serão retiradas e informe a quantidade."
            : "Revise as cestas selecionadas e o destinatário antes de confirmar.";

    function handleConfirm() {
        if (!canProceedStep1 || !beneficiary || isPending) {
            return;
        }

        executeWithdraw({
            beneficiaryId: beneficiary.id,
            items: selectedItems.map((entry) => ({
                basketId: entry.basket.id,
                quantity: entry.quantity,
            })),
        });
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
                        onClick={() => setStep(1)}
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
                ) : (
                    <Button
                        type="button"
                        className="w-full sm:w-auto"
                        loading={isPending}
                        loadingText="Registrando"
                        disabled={!canProceedStep1}
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
                    <WithdrawBasketSelectionStep
                        baskets={baskets}
                        quantities={quantities}
                        disabled={isPending}
                        onChangeQuantity={(basketId, nextValue) =>
                            setQuantities((prev) => ({
                                ...prev,
                                [basketId]: nextValue,
                            }))
                        }
                    />
                ) : (
                    <div className="flex flex-col gap-6">
                        <WithdrawBasketSummarySection
                            selectedItems={selectedItems}
                            totalSelectedUnits={totalSelectedUnits}
                        />

                        {beneficiary ? (
                            <section className="flex flex-col gap-3">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Beneficiário direcionado
                                </h3>
                                <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                        <HugeiconsIcon
                                            icon={UserIcon}
                                            strokeWidth={2}
                                            className="size-5"
                                        />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">{beneficiary.name}</p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {beneficiary.ageLabel}
                                            {beneficiary.cpf ? ` • ${beneficiary.cpf}` : ""}
                                            {" • "}
                                            {beneficiary.neighborhood}, {beneficiary.city}/{beneficiary.state}
                                        </p>
                                        {beneficiary.membersCount > 0 ? (
                                            <p className="mt-0.5 truncate text-xs text-muted-foreground opacity-80">
                                                {beneficiary.membersCount === 1
                                                    ? "e +1 membro da família"
                                                    : `e +${beneficiary.membersCount} membros da família`}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </section>
                        ) : null}
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
