import { redirect } from "next/navigation";

import { BasketTemplatesPanel } from "@/app/(sistema)/cestas/modelos/_components/basket-templates-panel";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess, hasWriteAccess } from "@/lib/member-access";
import { listBasketTemplates } from "@/services/basket/basket.service";
import { listFoodOptions } from "@/services/food/food.service";

/**
 * Carrega os modelos de cesta e alimentos disponíveis para a página /cestas/modelos.
 */
export async function BasketTemplatesSection() {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/");
    }

    const canWrite = hasWriteAccess(user);

    const [templates, foods] = await Promise.all([
        listBasketTemplates(),
        canWrite ? listFoodOptions() : Promise.resolve([]),
    ]);

    return (
        <BasketTemplatesPanel
            templates={templates}
            foods={foods}
            canWrite={canWrite}
        />
    );
}
