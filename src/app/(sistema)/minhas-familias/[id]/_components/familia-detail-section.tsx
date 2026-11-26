import { notFound } from "next/navigation";

import { BeneficiaryRecordView } from "@/app/(sistema)/beneficiarios/_components/beneficiary-record";
import { DeliveryHistoryFeed } from "@/app/(sistema)/minhas-familias/[id]/_components/delivery-history-feed";
import {
    FamiliaDetailTabs,
    type FamiliaDetailTab,
} from "@/app/(sistema)/minhas-familias/[id]/_components/familia-detail-tabs";
import TitlePage from "@/components/title-page";
import { getCurrentUser } from "@/lib/current-user";
import { listBeneficiaryBasketDeliveriesPage } from "@/services/basket/basket.service";
import { getAssistedBeneficiary } from "@/services/beneficiary/beneficiary.service";

/**
 * Carrega ficha completa do beneficiário vinculado e seu histórico paginado de entregas de cestas.
 */
export async function FamiliaDetailSection({
    id,
    searchParams,
}: {
    id: string;
    searchParams: Promise<{ aba?: string | string[]; pagina?: string | string[] }>;
}) {
    const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

    const rawTab = Array.isArray(params.aba) ? params.aba[0] : params.aba;
    const tab: FamiliaDetailTab = rawTab === "historico" ? "historico" : "informacoes";

    const rawPage = Array.isArray(params.pagina) ? params.pagina[0] : params.pagina;
    const parsedPage = Number.parseInt(rawPage ?? "1", 10);
    const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

    const [beneficiary, deliveries] = await Promise.all([
        getAssistedBeneficiary(user.id, id),
        listBeneficiaryBasketDeliveriesPage({
            beneficiaryId: id,
            page,
            pageSize: 10,
        }),
    ]);

    if (!beneficiary) {
        notFound();
    }

    return (
        <>
            <TitlePage
                title={beneficiary.name}
                description="Informações e histórico de entregas do beneficiário assistido."
            />
            <FamiliaDetailTabs
                beneficiaryId={beneficiary.id}
                activeTab={tab}
                infoContent={
                    <BeneficiaryRecordView
                        beneficiary={beneficiary}
                        excludeAssistantId={user.id}
                        assistantsTitle="Outros membros que assistem"
                        emptyAssistantsText="Nenhum outro membro assiste este beneficiário"
                    />
                }
                historyContent={
                    <DeliveryHistoryFeed
                        beneficiaryId={beneficiary.id}
                        data={deliveries}
                    />
                }
            />
        </>
    );
}
