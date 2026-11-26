import { Skeleton } from "@/components/ui/skeleton";

export function BeneficiariesSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end gap-3">
                <Skeleton className="ml-auto h-12 w-full min-w-0 max-w-sm rounded-2xl" />
                <Skeleton className="h-12 w-36 shrink-0 rounded-2xl" />
            </div>
            {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
        </div>
    );
}
