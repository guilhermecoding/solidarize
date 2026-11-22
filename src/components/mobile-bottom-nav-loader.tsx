import {
    navManagement,
    navPrimary,
} from "@/app/(sistema)/_config/nav-management";
import {
    MobileBottomNav,
    type MobileNavSectionEntry,
} from "@/components/mobile-bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess } from "@/lib/member-access";

export function MobileBottomNavSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
        >
            <Skeleton className="mx-auto h-16 w-full max-w-md rounded-[22px]" />
        </div>
    );
}

export async function MobileBottomNavLoader() {
    const user = await getCurrentUser();
    const canRead = hasReadAccess(user);

    const homeItem = navPrimary.items[0];
    const sections: MobileNavSectionEntry[] = [];

    for (const section of navManagement) {
        if (!section.icon || !section.mobileUrl || !section.label) {
            continue;
        }

        const allowedItems = section.items.filter(
            (item) => !item.requiresReadAccess || canRead,
        );

        if (allowedItems.length === 0) {
            continue;
        }

        sections.push({
            id: section.mobileUrl,
            label: section.label,
            href: section.mobileUrl,
            icon: section.icon,
            matchUrls: allowedItems.map((item) => item.url),
        });
    }

    return (
        <MobileBottomNav
            home={{
                label: homeItem.name,
                href: homeItem.url,
                icon: homeItem.icon,
            }}
            sections={sections}
            user={{
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }}
        />
    );
}
