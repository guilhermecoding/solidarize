import { navManagement } from "@/app/(sistema)/_config/nav-management";
import { NavSection, type NavSectionGroup } from "@/components/nav-management";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess } from "@/lib/member-access";

const SKELETON_WIDTHS = ["w-32", "w-28", "w-36", "w-24"] as const;

export function NavSectionSkeleton({
    section,
    className,
}: {
    section: NavSectionGroup;
    className?: string;
}) {
    return (
        <SidebarGroup className={className}>
            {section.label ? (
                <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-sidebar-foreground/60">
                    {section.label}
                </SidebarGroupLabel>
            ) : null}
            <SidebarMenu className="gap-1.5">
                {section.items.map((item, index) => {
                    const width = SKELETON_WIDTHS[index % SKELETON_WIDTHS.length];

                    return (
                        <SidebarMenuItem key={`${item.name}-${index}`}>
                            <div className="flex h-10 items-center gap-3 px-3">
                                <Skeleton className="size-5 shrink-0 rounded-md" />
                                <Skeleton className={`h-4 ${width}`} />
                            </div>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export async function NavSectionLoader({
    section,
    className,
}: {
    section: NavSectionGroup;
    className?: string;
}) {
    const needsReadAccessCheck = section.items.some(
        (item) => item.requiresReadAccess,
    );
    let allowedItems = section.items;

    if (needsReadAccessCheck) {
        const user = await getCurrentUser();
        const canRead = hasReadAccess(user);
        allowedItems = section.items.filter(
            (item) => !item.requiresReadAccess || canRead,
        );
    }

    if (allowedItems.length === 0) {
        return null;
    }

    return (
        <NavSection
            section={{
                label: section.label,
                items: allowedItems,
            }}
            className={className}
        />
    );
}

export function NavManagementSkeleton({
    sections = navManagement,
}: {
    sections?: NavSectionGroup[];
}) {
    return sections.map((section) => (
        <NavSectionSkeleton
            key={section.label ?? section.items[0]?.url}
            section={section}
        />
    ));
}

export async function NavManagementLoader({
    sections = navManagement,
}: {
    sections?: NavSectionGroup[];
}) {
    const needsReadAccessCheck = sections.some((section) =>
        section.items.some((item) => item.requiresReadAccess),
    );
    const canRead = needsReadAccessCheck
        ? hasReadAccess(await getCurrentUser())
        : true;

    return sections.map((section) => {
        const allowedItems = section.items.filter(
            (item) => !item.requiresReadAccess || canRead,
        );

        if (allowedItems.length === 0) {
            return null;
        }

        return (
            <NavSection
                key={section.label ?? allowedItems[0]?.url}
                section={{
                    label: section.label,
                    items: allowedItems,
                }}
            />
        );
    });
}
