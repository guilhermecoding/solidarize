import { Suspense } from "react";
import type { Metadata } from "next";

import { FoodsListSection } from "@/app/(sistema)/cestas/alimentos/listar/_components/foods-list-section";
import { FoodsListSkeleton } from "@/app/(sistema)/cestas/alimentos/listar/_components/foods-list-skeleton";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";

export const metadata: Metadata = {
    title: "Listar Alimentos",
    description: "Gerencie os alimentos cadastrados no estoque, lotes e datas de validade.",
};

/**
 * Página dedicada para listagem de alimentos com abas "Geral" e "Vencendo".
 */
export default function FoodsListPage({
    searchParams,
}: {
    searchParams: Promise<{ aba?: string | string[]; pagina?: string | string[] }>;
}) {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-6">
                <TitlePage
                    title="Listar Alimentos"
                    description="Consulte os itens cadastrados no estoque e acompanhe alimentos vencidos ou próximos do vencimento."
                />
                <Suspense fallback={<FoodsListSkeleton />}>
                    <FoodsListSection searchParams={searchParams} />
                </Suspense>
            </Section>
        </Page>
    );
}
