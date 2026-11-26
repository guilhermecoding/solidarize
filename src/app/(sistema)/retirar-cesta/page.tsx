import { Suspense } from "react";
import type { Metadata } from "next";

import { RetirarCestaSection } from "@/app/(sistema)/retirar-cesta/_components/retirar-cesta-section";
import { RetirarCestaSkeleton } from "@/app/(sistema)/retirar-cesta/_components/retirar-cesta-skeleton";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";

export const metadata: Metadata = {
    title: "Retirar Cesta",
    description: "Retire cestas de alimentação para os beneficiários vinculados a você.",
};

/**
 * Página da seção Para Você para retirada de cestas destinadas a beneficiários vinculados e aprovados.
 */
export default function RetirarCestaPage() {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-6">
                <Suspense fallback={<RetirarCestaSkeleton />}>
                    <RetirarCestaSection />
                </Suspense>
            </Section>
        </Page>
    );
}
