import { Suspense } from "react";
import type { Metadata } from "next";

import { FamiliasSection } from "@/app/(sistema)/minhas-familias/_components/familias-section";
import { FamiliasSkeleton } from "@/app/(sistema)/minhas-familias/_components/familias-skeleton";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";

export const metadata: Metadata = {
    title: "Minhas Famílias",
    description: "Consulte as famílias assistidas vinculadas a você.",
};

/**
 * Página da seção Para Você para listagem das famílias vinculadas ao membro ou administrador logado.
 */
export default function FamiliasPage() {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-6">
                <TitlePage
                    title="Minhas Famílias"
                    description="Consulte as famílias assistidas vinculadas a você."
                />
                <Suspense fallback={<FamiliasSkeleton />}>
                    <FamiliasSection />
                </Suspense>
            </Section>
        </Page>
    );
}
