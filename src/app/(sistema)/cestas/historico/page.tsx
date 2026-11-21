import { Suspense } from "react";
import type { Metadata } from "next";

import { HistorySkeleton } from "@/app/(sistema)/cestas/_components/history-skeleton";
import { BasketHistorySection } from "@/app/(sistema)/cestas/historico/_components/basket-history-section";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";

export const metadata: Metadata = {
    title: "Histórico de Cestas",
    description: "Consulte entradas, saídas e movimentações de cestas de alimentação.",
};

/**
 * Página dedicada para histórico paginado das cestas de alimentação.
 */
export default function BasketHistoryPage({
    searchParams,
}: {
    searchParams: Promise<{ pagina?: string | string[] }>;
}) {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-6">
                <TitlePage
                    title="Histórico de Cestas"
                    description="Consulte todas as entradas e saídas de cestas registradas na organização."
                />
                <Suspense fallback={<HistorySkeleton />}>
                    <BasketHistorySection searchParams={searchParams} />
                </Suspense>
            </Section>
        </Page>
    );
}
