import { Suspense } from "react";
import type { Metadata } from "next";

import { CestasHubSection } from "@/app/(sistema)/cestas/_components/cestas-hub-section";
import { CestasHubSkeleton } from "@/app/(sistema)/cestas/_components/cestas-hub-skeleton";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";

export const metadata: Metadata = {
    title: "Cestas e Alimentos",
    description: "Gerencie cestas de alimentação, modelos e o inventário de alimentos da organização.",
};

/**
 * Página hub de gestão de cestas de alimentação e inventário de alimentos.
 */
export default function BasketsAndFoodsPage() {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-10">
                <TitlePage
                    title="Cestas e Alimentos"
                    description="Gerencie cestas de alimentação, modelos e o inventário de alimentos da organização."
                />
            </Section>

            <Suspense fallback={<CestasHubSkeleton />}>
                <CestasHubSection />
            </Suspense>
        </Page>
    );
}
