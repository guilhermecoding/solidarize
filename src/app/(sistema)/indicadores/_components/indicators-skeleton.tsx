import { Skeleton } from "@/components/ui/skeleton";

/**
 * Esqueleto de carregamento da página de Indicadores.
 */
export function IndicatorsSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-32 w-full rounded-2xl" />
                ))}
            </div>
            <Skeleton className="h-10 w-full rounded-2xl sm:w-96" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-80 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}
