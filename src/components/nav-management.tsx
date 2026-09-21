"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { NavManagementItem } from "@/app/(sistema)/_config/nav-management";

export function NavManagement({
  items,
}: {
  items: NavManagementItem[];
}) {

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Gestão</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton render={<a href={item.url} />}>
              <HugeiconsIcon icon={item.icon} strokeWidth={2} />
              <span>{item.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
