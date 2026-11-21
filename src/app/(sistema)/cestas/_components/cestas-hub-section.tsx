import { redirect } from "next/navigation";

import { CestasHubPanel } from "@/app/(sistema)/cestas/_components/cestas-hub-panel";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess, hasWriteAccess } from "@/lib/member-access";
import { listBasketTemplates } from "@/services/basket/basket.service";
import { listFoodOptions } from "@/services/food/food.service";

/**
 * Carrega sessão, permissões e dados iniciais para o hub de Cestas e Alimentos.
 */
export async function CestasHubSection() {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/inicio");
    }

    const canWrite = hasWriteAccess(user);

    const [templates, foods] = canWrite
        ? await Promise.all([
            listBasketTemplates(),
            listFoodOptions(),
        ])
        : [[], []];

    return (
        <CestasHubPanel
            canWrite={canWrite}
            currentUserName={user.name}
            templates={templates}
            foods={foods}
        />
    );
}
