import { Suspense } from "react";
import type { Metadata } from "next";

import { BeneficiariesSection } from "@/app/(sistema)/beneficiarios/_components/beneficiaries-section";
import { BeneficiariesSkeleton } from "@/app/(sistema)/beneficiarios/_components/beneficiaries-skeleton";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";

export const metadata: Metadata = {
    title: "Beneficiários Assistidos",
    description: "Gerencie os beneficiários assistidos pela organização.",
};

export default function BeneficiariesPage() {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-6">
                <TitlePage
                    title="Beneficiários Assistidos"
                    description="Gerencie os beneficiários assistidos pela organização."
                />
                <Suspense fallback={<BeneficiariesSkeleton />}>
                    <BeneficiariesSection />
                </Suspense>
            </Section>
        </Page>
    );
}
