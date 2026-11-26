import { redirect } from "next/navigation";

import { AuditLogFeed } from "@/app/(sistema)/auditoria/_components/audit-log-feed";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess } from "@/lib/member-access";
import { listAuditLogsPage } from "@/services/audit/audit.service";
import { auditCategorySlugs, type AuditCategory } from "@/services/audit/audit.type";

function parseCategory(rawCategory?: string | string[]): AuditCategory {
    const value = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;

    if (value && value in auditCategorySlugs) {
        return auditCategorySlugs[value as keyof typeof auditCategorySlugs];
    }

    return "all";
}

function parsePage(rawPage?: string | string[]): number {
    const value = Array.isArray(rawPage) ? rawPage[0] : rawPage;
    const parsed = Number.parseInt(value ?? "1", 10);

    return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

/**
 * Verifica acesso administrativo de leitura e carrega a página solicitada da trilha de auditoria.
 */
export async function AuditLogSection({
    searchParams,
}: {
    searchParams: Promise<{ pagina?: string | string[]; categoria?: string | string[] }>;
}) {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/");
    }

    const params = await searchParams;
    const category = parseCategory(params.categoria);
    const page = parsePage(params.pagina);

    const data = await listAuditLogsPage({
        page,
        pageSize: 20,
        category,
    });

    return <AuditLogFeed data={data} />;
}
