import { navManagement } from "@/app/(sistema)/_config/nav-management";
import { NavManagement } from "@/components/nav-management";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess } from "@/lib/member-access";

const SKELETON_WIDTHS = ["w-32", "w-28", "w-36"] as const;

export function NavManagementSkeleton() {
    return (
        <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-sidebar-foreground/60">
                GESTÃO
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1.5">
                {SKELETON_WIDTHS.map((width, index) => (
                    <SidebarMenuItem key={index}>
                        <div className="flex h-10 items-center gap-3 px-3">
                            <Skeleton className="size-5 shrink-0 rounded-md" />
                            <Skeleton className={`h-4 ${width}`} />
                        </div>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export async function NavManagementLoader() {
    const user = await getCurrentUser();
    const canRead = hasReadAccess(user);
    const allowedItems = navManagement.filter(
        (item) => !item.requiresReadAccess || canRead,
    );

    if (allowedItems.length === 0) {
        return null;
    }

    return <NavManagement items={allowedItems} />;
}
