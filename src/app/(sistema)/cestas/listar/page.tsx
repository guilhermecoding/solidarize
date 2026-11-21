import { Suspense } from "react";
import type { Metadata } from "next";

import { BasketsListSection } from "@/app/(sistema)/cestas/listar/_components/baskets-list-section";
import { BasketsListSkeleton } from "@/app/(sistema)/cestas/listar/_components/baskets-list-skeleton";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";

export const metadata: Metadata = {
    title: "Listar Cestas",
    description: "Visualize e gerencie as cestas de alimentação em estoque e sem estoque.",
};

/**
 * Página dedicada para listagem de cestas disponíveis e sem estoque.
 */
export default function BasketsListPage() {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-6">
                <TitlePage
                    title="Listar Cestas"
                    description="Visualize as cestas disponíveis em estoque e as cestas com estoque zerado."
                />
                <Suspense fallback={<BasketsListSkeleton />}>
                    <BasketsListSection />
                </Suspense>
            </Section>
        </Page>
    );
}
