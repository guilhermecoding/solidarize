import { Skeleton } from "@/components/ui/skeleton";

/**
 * Esqueleto de carregamento para as páginas de histórico de cestas e alimentos.
 */
export function HistorySkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-24 rounded-md" />
                {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="h-20 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}
