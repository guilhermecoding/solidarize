import { UserRemove01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { RetirarCestaPanel } from "@/app/(sistema)/retirar-cesta/_components/retirar-cesta-panel";
import TitlePage from "@/components/title-page";
import { getCurrentUser } from "@/lib/current-user";
import {
    listAvailableBaskets,
    listBeneficiaryIdsDeliveredInMonth,
} from "@/services/basket/basket.service";
import { listAssistedBeneficiaries } from "@/services/beneficiary/beneficiary.service";

/**
 * Carrega os beneficiários vinculados e aprovados do usuário logado e as cestas disponíveis em estoque.
 */
export async function RetirarCestaSection() {
    const user = await getCurrentUser();

    const [beneficiaries, availableBaskets] = await Promise.all([
        listAssistedBeneficiaries(user.id, { approvedOnly: true }),
        listAvailableBaskets(),
    ]);

    if (beneficiaries.length === 0) {
        return (
            <>
                <TitlePage title="Retirar cesta" />
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card px-6 py-16 text-center text-muted-foreground">
                    <HugeiconsIcon icon={UserRemove01Icon} strokeWidth={2} className="size-10" />
                    <p className="text-base font-semibold text-foreground">
                        Nenhum usuário vinculado e aprovado para este benefício
                    </p>
                </div>
            </>
        );
    }

    const deliveredThisMonthIds = await listBeneficiaryIdsDeliveredInMonth(
        beneficiaries.map((beneficiary) => beneficiary.id),
    );

    return (
        <>
            <TitlePage title="Escolha a quem deseja destinar" />
            <RetirarCestaPanel
                beneficiaries={beneficiaries}
                availableBaskets={availableBaskets}
                deliveredThisMonthIds={deliveredThisMonthIds}
            />
        </>
    );
}
