"use client";

import { useState } from "react";
import {
    Search01Icon,
    Tick02Icon,
    UserIcon,
    UserQuestion01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { WITHDRAWAL_JUSTIFICATION_MIN_LENGTH } from "@/app/(sistema)/cestas/schema";
import { Badge } from "@/components/ui/badge";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    beneficiaryStatusLabels,
    type BeneficiaryOptionRecord,
} from "@/services/beneficiary/beneficiary.type";

export type WithdrawRecipientSelection =
    | { type: "none" }
    | { type: "unlisted" }
    | { type: "listed"; beneficiaryId: string };

type WithdrawBeneficiaryStepProps = {
    beneficiaries: BeneficiaryOptionRecord[];
    selection: WithdrawRecipientSelection;
    justification: string;
    disabled?: boolean;
    onSelect: (selection: WithdrawRecipientSelection) => void;
    onJustificationChange: (value: string) => void;
};

/**
 * Etapa 2 da retirada: seleção única de beneficiário (um card por linha) com opção "Beneficiário não listado" no topo.
 */
export function WithdrawBeneficiaryStep({
    beneficiaries,
    selection,
    justification,
    disabled = false,
    onSelect,
    onJustificationChange,
}: WithdrawBeneficiaryStepProps) {
    const [search, setSearch] = useState("");
    const [justificationTouched, setJustificationTouched] = useState(false);

    const normalizedSearch = normalizeSearchText(search);
    const searchDigits = search.replace(/\D/g, "");

    const filteredBeneficiaries = beneficiaries.filter((beneficiary) => {
        if (!normalizedSearch && !searchDigits) {
            return true;
        }

        const nameMatches = normalizedSearch
            ? normalizeSearchText(beneficiary.name).includes(normalizedSearch)
            : false;
        const cpfMatches = searchDigits
            ? beneficiary.cpf.replace(/\D/g, "").includes(searchDigits)
            : false;

        return nameMatches || cpfMatches;
    });

    const isUnlistedSelected = selection.type === "unlisted";
    const trimmedLength = justification.trim().length;
    const isJustificationInvalid =
        isUnlistedSelected
        && justificationTouched
        && trimmedLength < WITHDRAWAL_JUSTIFICATION_MIN_LENGTH;

    return (
        <div className="flex flex-col gap-4">
            {beneficiaries.length > 0 ? (
                <Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Buscar beneficiário por nome ou CPF"
                    aria-label="Buscar beneficiário por nome ou CPF"
                    maxLength={120}
                    disabled={disabled}
                    startIcon={<HugeiconsIcon icon={Search01Icon} strokeWidth={2} />}
                />
            ) : null}

            <div
                role="radiogroup"
                aria-label="Selecione o beneficiário destinatário"
                className="flex flex-col gap-3 p-2"
            >
                {/* Opção fixa no topo: Beneficiário não listado */}
                <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            role="radio"
                            aria-checked={isUnlistedSelected}
                            disabled={disabled}
                            onClick={() =>
                                onSelect(isUnlistedSelected ? { type: "none" } : { type: "unlisted" })
                            }
                            className={cn(
                                "relative flex w-full cursor-pointer items-center gap-3 rounded-2xl border bg-card p-4 text-left text-card-foreground transition-all outline-none hover:border-foreground/25 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
                                isUnlistedSelected &&
                                    "border-emerald-500/70 bg-emerald-500/5 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10",
                            )}
                        >
                        {isUnlistedSelected ? (
                            <span
                                aria-hidden="true"
                                className="absolute -top-2 -left-2 z-10 flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm ring-2 ring-background"
                            >
                                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className="size-3.5" />
                            </span>
                        ) : null}

                        <span
                            className={cn(
                                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                                isUnlistedSelected
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                    : "bg-muted text-muted-foreground",
                            )}
                        >
                            <HugeiconsIcon icon={UserQuestion01Icon} strokeWidth={2} className="size-5" />
                        </span>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold sm:text-base">
                                Beneficiário não listado
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Destinatário sem cadastro prévio no sistema (exige justificativa)
                            </p>
                        </div>
                    </button>

                    {isUnlistedSelected ? (
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 dark:bg-emerald-500/10">
                            <Field data-invalid={isJustificationInvalid || undefined}>
                                <FieldLabel htmlFor="withdrawal-justification" required>
                                    Justificativa
                                </FieldLabel>
                                <Input
                                    id="withdrawal-justification"
                                    name="justification"
                                    value={justification}
                                    maxLength={500}
                                    disabled={disabled}
                                    placeholder="Informe o motivo da retirada (mínimo 10 caracteres)"
                                    aria-invalid={isJustificationInvalid || undefined}
                                    onBlur={() => setJustificationTouched(true)}
                                    onChange={(event) => onJustificationChange(event.target.value)}
                                />
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <FieldDescription className="text-xs">
                                        Obrigatório informar ao menos {WITHDRAWAL_JUSTIFICATION_MIN_LENGTH} caracteres.
                                    </FieldDescription>
                                    <span
                                        className={cn(
                                            "text-xs font-medium tabular-nums",
                                            trimmedLength >= WITHDRAWAL_JUSTIFICATION_MIN_LENGTH
                                                ? "text-emerald-700 dark:text-emerald-400"
                                                : "text-muted-foreground",
                                        )}
                                    >
                                        {trimmedLength}/{WITHDRAWAL_JUSTIFICATION_MIN_LENGTH}+ caracteres
                                    </span>
                                </div>
                                {isJustificationInvalid ? (
                                    <FieldError
                                        errors={[
                                            {
                                                message: `Informe uma justificativa com ao menos ${WITHDRAWAL_JUSTIFICATION_MIN_LENGTH} caracteres.`,
                                            },
                                        ]}
                                    />
                                ) : null}
                            </Field>
                        </div>
                    ) : null}
                </div>

                {/* Lista de beneficiários cadastrados (um card por linha) */}
                {filteredBeneficiaries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                        {beneficiaries.length === 0
                            ? "Nenhum beneficiário cadastrado no sistema."
                            : "Nenhum beneficiário encontrado para a busca informada."}
                    </div>
                ) : (
                    filteredBeneficiaries.map((beneficiary) => {
                        const isNotApproved = beneficiary.status !== "approved";
                        const isCardDisabled = disabled || isNotApproved;
                        const isSelected =
                            !isNotApproved
                            && selection.type === "listed"
                            && selection.beneficiaryId === beneficiary.id;

                        return (
                            <button
                                key={beneficiary.id}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                disabled={isCardDisabled}
                                onClick={() => {
                                    if (isCardDisabled) {
                                        return;
                                    }

                                    onSelect(
                                        isSelected
                                            ? { type: "none" }
                                            : { type: "listed", beneficiaryId: beneficiary.id },
                                    );
                                }}
                                className={cn(
                                    "relative flex w-full flex-col gap-2 rounded-2xl border bg-card p-4 text-left text-card-foreground transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:flex-row sm:items-center sm:justify-between",
                                    isCardDisabled
                                        ? "cursor-not-allowed opacity-50"
                                        : "cursor-pointer hover:border-foreground/25",
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

                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <span
                                        className={cn(
                                            "flex size-10 shrink-0 items-center justify-center rounded-xl",
                                            isSelected
                                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                                : "bg-muted text-muted-foreground",
                                        )}
                                    >
                                        <HugeiconsIcon
                                            icon={UserIcon}
                                            strokeWidth={2}
                                            className="size-5"
                                        />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold sm:text-base">
                                            {beneficiary.name}
                                        </p>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                            <span>{beneficiary.ageLabel}</span>
                                            {beneficiary.cpf ? (
                                                <>
                                                    <span aria-hidden="true">•</span>
                                                    <span className="font-mono">{beneficiary.cpf}</span>
                                                </>
                                            ) : null}
                                            <span aria-hidden="true">•</span>
                                            <span className="truncate">
                                                {beneficiary.neighborhood}, {beneficiary.city}/{beneficiary.state}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Badge
                                    variant={beneficiary.status === "approved" ? "success" : "muted"}
                                    className="self-start sm:self-center"
                                >
                                    {beneficiaryStatusLabels[beneficiary.status]}
                                </Badge>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

function normalizeSearchText(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
