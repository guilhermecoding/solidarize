import { redirect } from "next/navigation";

import { IndicatorsDashboard } from "@/app/(sistema)/indicadores/_components/indicators-dashboard";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess } from "@/lib/member-access";
import { getDashboardIndicators } from "@/services/indicator/indicator.service";

/**
 * Valida acesso administrativo (leitura ou escrita) e carrega os indicadores agregados.
 */
export async function IndicatorsSection() {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/");
    }

    const indicators = await getDashboardIndicators();

    return <IndicatorsDashboard indicators={indicators} />;
}
