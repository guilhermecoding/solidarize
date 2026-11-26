import { Skeleton } from "@/components/ui/skeleton";

/**
 * Esqueleto de carregamento da listagem de alimentos.
 */
export function FoodsListSkeleton() {
    return (
        <div className="flex flex-col gap-5">
            <Skeleton className="h-9 w-56 rounded-4xl" />
            <div className="flex flex-col gap-3">
                {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-20 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}
