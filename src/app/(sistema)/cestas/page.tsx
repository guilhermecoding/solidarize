import type { Metadata } from "next";

import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";
import { ModuleSection } from "@/app/(sistema)/cestas/_components/module-section";
import { basketModules, foodModules } from "@/app/(sistema)/cestas/_config/modules";

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

            <ModuleSection group={basketModules} />
            <ModuleSection group={foodModules} />
        </Page>
    );
}
