import { Suspense } from "react";
import type { Metadata } from "next";

import { BeneficiaryDetailSection } from "@/app/(sistema)/beneficiarios/[id]/_components/beneficiary-detail-section";
import { BeneficiariesSkeleton } from "@/app/(sistema)/beneficiarios/_components/beneficiaries-skeleton";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import { getBeneficiary } from "@/services/beneficiary/beneficiary.service";

export async function generateMetadata({
    params,
}: Pick<PageProps<"/beneficiarios/[id]">, "params">): Promise<Metadata> {
    const { id } = await params;
    const beneficiary = await getBeneficiary(id);
    const firstName = beneficiary?.name.trim().split(/\s+/)[0];

    return {
        title: firstName ? `Perfil de ${firstName}` : "Beneficiário Assistido",
        description: "Informações do beneficiário assistido.",
    };
}

async function BeneficiaryContent({
    params,
}: Pick<PageProps<"/beneficiarios/[id]">, "params">) {
    const { id } = await params;

    return <BeneficiaryDetailSection id={id} />;
}

export default function BeneficiaryPage({
    params,
}: Pick<PageProps<"/beneficiarios/[id]">, "params">) {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-6">
                <Suspense fallback={<BeneficiariesSkeleton />}>
                    <BeneficiaryContent params={params} />
                </Suspense>
            </Section>
        </Page>
    );
}
