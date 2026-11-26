import { Skeleton } from "@/components/ui/skeleton";

/**
 * Esqueleto de carregamento da tela de informações e histórico da família assistida.
 */
export function FamiliaDetailSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-64 rounded-lg" />
                <Skeleton className="h-4 w-80 rounded-md" />
            </div>
            <Skeleton className="h-9 w-72 rounded-full" />
            <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
