import { Suspense } from "react";
import type { Metadata } from "next";

import { BeneficiaryDetailSection } from "@/app/(sistema)/beneficiarios/[id]/_components/beneficiary-detail-section";
import { BeneficiariesSkeleton } from "@/app/(sistema)/beneficiarios/_components/beneficiaries-skeleton";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";

export const metadata: Metadata = {
    title: "Beneficiário assistido",
    description: "Informações do beneficiário assistido.",
};

export default function BeneficiaryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return (
        <Page>
            <Section className="flex flex-col gap-6">
                <Suspense fallback={<BeneficiariesSkeleton />}>
                    {params.then(({ id }) => (
                        <BeneficiaryDetailSection id={id} />
                    ))}
                </Suspense>
            </Section>
        </Page>
    );
}
