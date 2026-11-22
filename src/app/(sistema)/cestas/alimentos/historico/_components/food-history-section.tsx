import { redirect } from "next/navigation";

import { HistoryFeed } from "@/app/(sistema)/cestas/_components/history-feed";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess } from "@/lib/member-access";
import { listFoodHistoryPage } from "@/services/food/food.service";

/**
 * Carrega o histórico paginado de entradas e saídas de alimentos.
 */
export async function FoodHistorySection({
    searchParams,
}: {
    searchParams: Promise<{ pagina?: string | string[] }>;
}) {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/");
    }

    const params = await searchParams;
    const rawPage = Array.isArray(params.pagina) ? params.pagina[0] : params.pagina;
    const parsedPage = Number.parseInt(rawPage ?? "1", 10);
    const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

    const data = await listFoodHistoryPage({
        page,
        pageSize: 10,
    });

    return (
        <HistoryFeed
            kind="food"
            data={data}
            basePath="/cestas/alimentos/historico"
            emptyTitle="Nenhuma movimentação registrada"
            emptyDescription="As entradas e saídas de alimentos aparecerão aqui."
        />
    );
}
