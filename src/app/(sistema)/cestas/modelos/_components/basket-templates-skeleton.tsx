import { Skeleton } from "@/components/ui/skeleton";

/**
 * Esqueleto de carregamento da listagem de modelos de cesta.
 */
export function BasketTemplatesSkeleton() {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-end">
                <Skeleton className="h-12 w-40 rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-44 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}
