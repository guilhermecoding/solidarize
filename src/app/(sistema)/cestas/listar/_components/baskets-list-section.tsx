import { redirect } from "next/navigation";

import { BasketsListPanel } from "@/app/(sistema)/cestas/listar/_components/baskets-list-panel";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess, hasWriteAccess } from "@/lib/member-access";
import { listBaskets, listBasketTemplates } from "@/services/basket/basket.service";
import { listFoodOptions } from "@/services/food/food.service";

/**
 * Carrega cestas, modelos e alimentos autorizados para a página /cestas/listar.
 */
export async function BasketsListSection() {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/inicio");
    }

    const canWrite = hasWriteAccess(user);

    const [baskets, templates, foods] = await Promise.all([
        listBaskets(),
        canWrite ? listBasketTemplates() : Promise.resolve([]),
        canWrite ? listFoodOptions() : Promise.resolve([]),
    ]);

    return (
        <BasketsListPanel
            baskets={baskets}
            canWrite={canWrite}
            templates={templates}
            foods={foods}
        />
    );
}
