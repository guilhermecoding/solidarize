import { cn } from "@/lib/utils";
import { ModuleCard } from "@/app/(sistema)/cestas/_components/module-card";
import type { ModuleGroup } from "@/app/(sistema)/cestas/_config/modules";
import Section from "@/components/shared/section";
import { HugeiconsIcon } from "@hugeicons/react";

const gridColumns = {
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 xl:grid-cols-4",
} as const;

/**
 * Seção de módulos com cabeçalho, contador em badge e grade responsiva de cards.
 */
export function ModuleSection({ group }: { group: ModuleGroup }) {
    const headingId = `${group.id}-heading`;

    return (
        <Section aria-labelledby={headingId} className="flex flex-col gap-5 mt-8">
            <header className="flex flex-col gap-1 border-b pb-4">
                <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={group.icon} strokeWidth={2} className="size-5" />
                    <h2 id={headingId} className="text-lg font-semibold">
                        {group.title}
                    </h2>
                </div>
            </header>
            <ul className={cn("grid grid-cols-1 gap-4", gridColumns[group.columns])}>
                {group.items.map((item) => (
                    <li key={item.id}>
                        <ModuleCard item={item} />
                    </li>
                ))}
            </ul>
        </Section>
    );
}
