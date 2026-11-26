import { redirect } from "next/navigation";

import { FoodsListPanel } from "@/app/(sistema)/cestas/alimentos/listar/_components/foods-list-panel";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess, hasWriteAccess } from "@/lib/member-access";
import { listFoodsPage } from "@/services/food/food.service";
import type { FoodListTab } from "@/services/food/food.type";

/**
 * Carrega alimentos paginados (15 por página) conforme a aba e página da URL.
 */
export async function FoodsListSection({
    searchParams,
}: {
    searchParams: Promise<{ aba?: string | string[]; pagina?: string | string[] }>;
}) {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/");
    }

    const params = await searchParams;
    const rawTab = Array.isArray(params.aba) ? params.aba[0] : params.aba;
    const tab: FoodListTab = rawTab === "vencendo" ? "vencendo" : "geral";

    const rawPage = Array.isArray(params.pagina) ? params.pagina[0] : params.pagina;
    const parsedPage = Number.parseInt(rawPage ?? "1", 10);
    const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

    const data = await listFoodsPage({
        tab,
        page,
        pageSize: 15,
    });

    return <FoodsListPanel data={data} canWrite={hasWriteAccess(user)} />;
}
