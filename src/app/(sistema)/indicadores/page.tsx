import { Suspense } from "react";
import type { Metadata } from "next";

import { IndicatorsSection } from "@/app/(sistema)/indicadores/_components/indicators-section";
import { IndicatorsSkeleton } from "@/app/(sistema)/indicadores/_components/indicators-skeleton";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";

export const metadata: Metadata = {
    title: "Indicadores",
    description: "Acompanhe métricas e gráficos de beneficiários, entregas, estoque e equipe.",
};

/**
 * Página administrativa de Indicadores e dashboards operacionais.
 */
export default function IndicatorsPage() {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-6">
                <TitlePage
                    title="Indicadores"
                    description="Visão consolidada de famílias assistidas, entregas, estoque e equipe."
                />
                <Suspense fallback={<IndicatorsSkeleton />}>
                    <IndicatorsSection />
                </Suspense>
            </Section>
        </Page>
    );
}
