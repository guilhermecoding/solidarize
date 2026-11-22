import Link from "next/link";
import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";

import { navManagement } from "@/app/(sistema)/_config/nav-management";
import type { NavSectionItem } from "@/components/nav-management";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess } from "@/lib/member-access";

const cardClassName =
    "group flex h-full flex-col rounded-2xl border bg-card p-5 text-card-foreground transition-all outline-none hover:border-foreground/20 hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/50";

/**
 * Grade responsiva de cards para exibir itens de menu sem texto descritivo nem botão inferior.
 */
export function NavMenuCardsGrid({ items }: { items: NavSectionItem[] }) {
    return (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
                <li key={`${item.name}-${item.url}`}>
                    <Link href={item.url} className={cardClassName}>
                        <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                            <HugeiconsIcon
                                icon={item.icon}
                                strokeWidth={2}
                                className="size-5"
                            />
                        </span>
                        <h3 className="mt-5 text-lg font-semibold">
                            {item.name}
                        </h3>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

/**
 * Esqueleto de carregamento das páginas dedicadas de menus mobile.
 */
export function MobileMenuSkeleton({ itemCount = 4 }: { itemCount?: number }) {
    return (
        <Section className="mt-2 flex flex-col gap-6">
            <Skeleton className="h-8 w-36 rounded-lg" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: itemCount }, (_, index) => (
                    <Skeleton key={index} className="h-32 w-full rounded-2xl" />
                ))}
            </div>
        </Section>
    );
}

/**
 * Carrega e exibe os cards de um grupo específico de navManagement com TitlePage, sem divisor de seção.
 */
export async function MobileMenuSection({
    sectionLabel,
    title,
}: {
    sectionLabel: string;
    title: string;
}) {
    const user = await getCurrentUser();
    const canRead = hasReadAccess(user);

    const section = navManagement.find((item) => item.label === sectionLabel);
    const allowedItems =
        section?.items.filter((item) => !item.requiresReadAccess || canRead) ?? [];

    if (allowedItems.length === 0) {
        redirect("/");
    }

    return (
        <Section className="mt-2 flex flex-col gap-6">
            <TitlePage title={title} />
            <NavMenuCardsGrid items={allowedItems} />
        </Section>
    );
}
