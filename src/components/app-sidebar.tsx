import type { ComponentProps } from "react";
import { Suspense } from "react";
import Link from "next/link";

import { navPrimary } from "@/app/(sistema)/_config/nav-management";
import { NavSection, type NavSectionGroup } from "@/components/nav-management";
import {
  NavManagementLoader,
  NavManagementSkeleton,
} from "@/components/nav-management-loader";
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
import { InfoIcon } from "@hugeicons/core-free-icons";
import IconLogo from "./logo/icon-logo";
import TextLogo from "./logo/text-logo";

const navSecondary: NavSectionGroup = {
  items: [
    {
      name: "Sobre",
      url: "/sobre",
      icon: InfoIcon,
      requiresReadAccess: false,
    },
  ],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />} className="flex justify-center mt-4" >
              <div className="flex items-center gap-2">
                <IconLogo className="size-8" />
                <TextLogo className="text-xl" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-4">
        <NavSection section={navPrimary} />
        <Suspense fallback={<NavManagementSkeleton />}>
          <NavManagementLoader />
        </Suspense>
        <NavSection section={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <Suspense fallback={<NavUserSkeleton />}>
          <NavUserLoader />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
