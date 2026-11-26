import { Suspense } from "react";
import type { Metadata } from "next";

import { FamiliaDetailSection } from "@/app/(sistema)/minhas-familias/[id]/_components/familia-detail-section";
import { FamiliaDetailSkeleton } from "@/app/(sistema)/minhas-familias/[id]/_components/familia-detail-skeleton";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";

export const metadata: Metadata = {
    title: "Informações da Família",
    description: "Informações e histórico de entregas do beneficiário assistido.",
};

async function FamiliaDetailContent({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ aba?: string | string[]; pagina?: string | string[] }>;
}) {
    const { id } = await params;

    return <FamiliaDetailSection id={id} searchParams={searchParams} />;
}

/**
 * Página dedicada aos detalhes e histórico de entregas de um beneficiário vinculado ao usuário.
 */
export default function FamiliaDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ aba?: string | string[]; pagina?: string | string[] }>;
}) {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-6">
                <Suspense fallback={<FamiliaDetailSkeleton />}>
                    <FamiliaDetailContent params={params} searchParams={searchParams} />
                </Suspense>
            </Section>
        </Page>
    );
}
