import { Skeleton } from "@/components/ui/skeleton";

/**
 * Esqueleto de carregamento da listagem de cestas em grade quadrada.
 */
export function BasketsListSkeleton() {
    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
                <Skeleton className="h-7 w-40 rounded-lg" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 5 }, (_, index) => (
                        <Skeleton key={index} className="aspect-square w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
