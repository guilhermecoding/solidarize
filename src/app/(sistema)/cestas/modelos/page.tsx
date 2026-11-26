import { Suspense } from "react";
import type { Metadata } from "next";

import { BasketTemplatesSection } from "@/app/(sistema)/cestas/modelos/_components/basket-templates-section";
import { BasketTemplatesSkeleton } from "@/app/(sistema)/cestas/modelos/_components/basket-templates-skeleton";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";

export const metadata: Metadata = {
    title: "Modelos de Cesta",
    description: "Gerencie modelos pré-definidos de cestas e seus alimentos vinculados.",
};

/**
 * Página dedicada para listagem e gestão de modelos de cesta.
 */
export default function BasketTemplatesPage() {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-6">
                <TitlePage
                    title="Modelos de Cesta"
                    description="Visualize e gerencie padrões pré-configurados de cestas disponíveis para cadastro."
                />
                <Suspense fallback={<BasketTemplatesSkeleton />}>
                    <BasketTemplatesSection />
                </Suspense>
            </Section>
        </Page>
    );
}
