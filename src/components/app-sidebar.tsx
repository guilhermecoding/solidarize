import type { ComponentProps } from "react";
import { Suspense } from "react";

import { NavManagement } from "@/components/nav-management";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUserLoader, NavUserSkeleton } from "@/components/nav-user-loader";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartRingIcon } from "@hugeicons/core-free-icons";
import { navManagement } from "@/app/(sistema)/_config/nav-management";
import IconLogo from "./logo/icon-logo";
import TextLogo from "./logo/text-logo";

const data = {
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: (
        <HugeiconsIcon icon={ChartRingIcon} strokeWidth={2} />
      ),
    },
  ],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />} className="flex justify-center" >
              <div className="flex items-center gap-2">
                <IconLogo className="size-8" />
                <TextLogo className="text-xl" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavManagement items={navManagement} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <Suspense fallback={<NavUserSkeleton />}>
          <NavUserLoader />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
