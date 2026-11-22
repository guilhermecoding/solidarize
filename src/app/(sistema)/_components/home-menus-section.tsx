import { NavMenuCardsGrid } from "@/app/(sistema)/_components/nav-menu-cards";
import { navManagement } from "@/app/(sistema)/_config/nav-management";
import Section from "@/components/shared/section";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess } from "@/lib/member-access";

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

                        <NavMenuCardsGrid items={section.items} />
                    </Section>
                );
            })}
        </div>
    );
}
