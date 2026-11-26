import { getCurrentUser } from "@/lib/current-user";
import { NavUser } from "@/components/nav-user";
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function NavUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex h-14 items-center gap-2 overflow-hidden rounded-lg px-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="grid flex-1 gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export async function NavUserLoader() {
  const user = await getCurrentUser();

  return (
    <NavUser
      user={{
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }}
    />
  );
}
