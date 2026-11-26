import { Suspense } from "react";
import type { Metadata } from "next";

import { HistorySkeleton } from "@/app/(sistema)/cestas/_components/history-skeleton";
import { FoodHistorySection } from "@/app/(sistema)/cestas/alimentos/historico/_components/food-history-section";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";

export const metadata: Metadata = {
    title: "Histórico de Alimentos",
    description: "Consulte entradas e saídas de alimentos registradas no estoque.",
};

/**
 * Página dedicada para histórico paginado de movimentações de alimentos.
 */
export default function FoodHistoryPage({
    searchParams,
}: {
    searchParams: Promise<{ pagina?: string | string[] }>;
}) {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-6">
                <TitlePage
                    title="Histórico de Alimentos"
                    description="Registro completo de entradas e saídas de alimentos do estoque."
                />
                <Suspense fallback={<HistorySkeleton />}>
                    <FoodHistorySection searchParams={searchParams} />
                </Suspense>
            </Section>
        </Page>
    );
}
