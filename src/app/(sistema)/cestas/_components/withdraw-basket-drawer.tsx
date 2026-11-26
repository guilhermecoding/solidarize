"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import {
    UserIcon,
    UserQuestion01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { withdrawBasketsAction } from "@/app/(sistema)/cestas/action";
import { WithdrawBasketSelectionStep } from "@/app/(sistema)/cestas/_components/withdraw-basket-selection-step";
import { WithdrawBasketSummarySection } from "@/app/(sistema)/cestas/_components/withdraw-basket-summary-section";
import {
    WithdrawBeneficiaryStep,
    type WithdrawRecipientSelection,
} from "@/app/(sistema)/cestas/_components/withdraw-beneficiary-step";
import { WithdrawShell } from "@/app/(sistema)/cestas/_components/withdraw-shell";
import { WITHDRAWAL_JUSTIFICATION_MIN_LENGTH } from "@/app/(sistema)/cestas/schema";
import { ResultDialog } from "@/components/shared/result-dialog";
import { Button } from "@/components/ui/button";
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
    const [step, setStep] = useState<1 | 2 | 3>(1);
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
                        <WithdrawBasketSummarySection
                            selectedItems={selectedItems}
                            totalSelectedUnits={totalSelectedUnits}
                        />

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
