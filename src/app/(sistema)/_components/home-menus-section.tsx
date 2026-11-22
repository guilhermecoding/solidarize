import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";

import { navManagement } from "@/app/(sistema)/_config/nav-management";
import Section from "@/components/shared/section";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess } from "@/lib/member-access";

const cardClassName =
    "group flex h-full flex-col rounded-2xl border bg-card p-5 text-card-foreground transition-all outline-none hover:border-foreground/20 hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/50";

/**
 * Esqueleto de carregamento das seções de atalhos da página inicial.
 */
export function HomeMenusSkeleton() {
    return (
        <div className="mt-8 flex flex-col gap-10">
            {navManagement.map((section, sectionIndex) => (
                <Section
                    key={section.label ?? `section-${sectionIndex}`}
                    className="flex flex-col gap-5"
                >
                    {section.label ? (
                        <div className="border-b pb-4">
                            <Skeleton className="h-7 w-36 rounded-lg" />
                        </div>
                    ) : null}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {section.items.map((item) => (
                            <Skeleton
                                key={`${item.name}-${item.url}`}
                                className="h-32 w-full rounded-2xl"
                            />
                        ))}
                    </div>
                </Section>
            ))}
        </div>
    );
}

/**
 * Renderiza os menus configurados em navManagement em linhas separadas por grupo na página inicial.
 */
export async function HomeMenusSection() {
    const user = await getCurrentUser();
    const canRead = hasReadAccess(user);

    const visibleSections = navManagement
        .map((section) => ({
            label: section.label,
            items: section.items.filter(
                (item) => !item.requiresReadAccess || canRead,
            ),
        }))
        .filter((section) => section.items.length > 0);

    if (visibleSections.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 flex flex-col gap-10">
            {visibleSections.map((section, sectionIndex) => {
                const headingId = `home-menu-section-${sectionIndex}`;

                return (
                    <Section
                        key={section.label ?? headingId}
                        aria-labelledby={section.label ? headingId : undefined}
                        className="flex flex-col gap-5"
                    >
                        {section.label ? (
                            <header className="flex flex-col gap-1 border-b pb-2">
                                <h2 id={headingId} className="text-sm font-semibold text-muted-foreground">
                                    {section.label}
                                </h2>
                            </header>
                        ) : null}

                        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {section.items.map((item) => (
                                <li key={`${item.name}-${item.url}`}>
                                    <Link href={item.url} className={cardClassName}>
                                        <span className="flex size-14 items-center justify-center rounded-xl bg-muted">
                                            <HugeiconsIcon
                                                icon={item.icon}
                                                strokeWidth={2}
                                                className="size-7"
                                            />
                                        </span>
                                        <h3 className="mt-5 text-lg font-semibold">
                                            {item.name}
                                        </h3>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Section>
                );
            })}
        </div>
    );
}
