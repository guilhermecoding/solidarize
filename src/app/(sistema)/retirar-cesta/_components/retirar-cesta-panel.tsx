"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { WithdrawAssistedBasketDrawer } from "@/app/(sistema)/retirar-cesta/_components/withdraw-assisted-basket-drawer";
import { ResultDialog } from "@/components/shared/result-dialog";
import { Button } from "@/components/ui/button";
import type { BasketRecord } from "@/services/basket/basket.type";
import type { AssistedBeneficiarySummary } from "@/services/beneficiary/beneficiary.type";

const PAGE_SIZE = 10;

type RetirarCestaPanelProps = {
    beneficiaries: AssistedBeneficiarySummary[];
    availableBaskets: BasketRecord[];
};

/**
 * Painel com cards por linha dos beneficiários vinculados e aprovados para iniciar a retirada de cesta.
 */
export function RetirarCestaPanel({
    beneficiaries,
    availableBaskets,
}: RetirarCestaPanelProps) {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [selectedBeneficiary, setSelectedBeneficiary] = useState<AssistedBeneficiarySummary | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const pageCount = Math.max(1, Math.ceil(beneficiaries.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const pageBeneficiaries = beneficiaries.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    return (
        <>
            <div className="flex flex-col gap-4">
                <ul className="flex flex-col gap-3">
                    {pageBeneficiaries.map((beneficiary) => (
                        <li key={beneficiary.id}>
                            <button
                                type="button"
                                onClick={() => setSelectedBeneficiary(beneficiary)}
                                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border bg-background px-4 py-3 text-left transition-colors outline-none hover:border-foreground/20 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{beneficiary.name}</p>
                                    {beneficiary.membersCount > 0 ? (
                                        <p className="truncate text-xs text-muted-foreground opacity-80">
                                            {beneficiary.membersCount === 1
                                                ? "e +1 membro da família"
                                                : `e +${beneficiary.membersCount} membros da família`}
                                        </p>
                                    ) : null}
                                </div>
                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    strokeWidth={2}
                                    className="size-4 shrink-0 text-muted-foreground"
                                />
                            </button>
                        </li>
                    ))}
                </ul>

                {beneficiaries.length > PAGE_SIZE ? (
                    <div className="flex items-center justify-between gap-4 border-t pt-4">
                        <span className="text-sm text-muted-foreground">
                            Página {currentPage} de {pageCount}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                className="border-foreground/20"
                                aria-label="Página anterior"
                                disabled={currentPage === 1}
                                onClick={() => setPage(currentPage - 1)}
                            >
                                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                className="border-foreground/20"
                                aria-label="Próxima página"
                                disabled={currentPage === pageCount}
                                onClick={() => setPage(currentPage + 1)}
                            >
                                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>

            <WithdrawAssistedBasketDrawer
                open={selectedBeneficiary !== null}
                beneficiary={selectedBeneficiary}
                baskets={availableBaskets}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setSelectedBeneficiary(null);
                    }
                }}
                onSaved={(message) => {
                    setSelectedBeneficiary(null);
                    setSuccessMessage(message);
                    router.refresh();
                }}
            />

            <ResultDialog
                status="success"
                open={successMessage !== null}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setSuccessMessage(null);
                    }
                }}
                title="Deu certo!"
                subtitle={successMessage ?? ""}
            />
        </>
    );
}
