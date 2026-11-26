import { Suspense } from "react";
import type { Metadata } from "next";

import { AuditLogSection } from "@/app/(sistema)/auditoria/_components/audit-log-section";
import { HistorySkeleton } from "@/app/(sistema)/cestas/_components/history-skeleton";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";

export const metadata: Metadata = {
    title: "Auditoria",
    description: "Consulte o registro de ações administrativas, alterações em beneficiários e eventos de acesso.",
};

/**
 * Página dedicada para consulta da trilha de auditoria administrativa.
 */
export default function AuditoriaPage({
    searchParams,
}: {
    searchParams: Promise<{ pagina?: string | string[]; categoria?: string | string[] }>;
}) {
    return (
        <Page showBack>
            <Section className="flex flex-col gap-6">
                <TitlePage
                    title="Auditoria"
                    description="Consulte o registro de ações administrativas, alterações em beneficiários e eventos de acesso."
                />
                <Suspense fallback={<HistorySkeleton />}>
                    <AuditLogSection searchParams={searchParams} />
                </Suspense>
            </Section>
        </Page>
    );
}
