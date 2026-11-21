import Section from "@/components/shared/section";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Esqueleto de carregamento das duas seções de cards do hub de Cestas e Alimentos.
 */
export function CestasHubSkeleton() {
    return (
        <div className="mt-8 flex flex-col gap-10">
            <Section className="flex flex-col gap-5">
                <Skeleton className="h-8 w-56 rounded-lg" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }, (_, index) => (
                        <Skeleton key={index} className="h-52 w-full rounded-2xl" />
                    ))}
                </div>
            </Section>
            <Section className="flex flex-col gap-5">
                <Skeleton className="h-8 w-40 rounded-lg" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }, (_, index) => (
                        <Skeleton key={index} className="h-52 w-full rounded-2xl" />
                    ))}
                </div>
            </Section>
        </div>
    );
}
