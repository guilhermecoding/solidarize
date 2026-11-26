import { Skeleton } from "@/components/ui/skeleton";

/**
 * Esqueleto de carregamento da tela de retirada de cesta do menu Para Você.
 */
export function RetirarCestaSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
