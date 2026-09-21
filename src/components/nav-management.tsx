"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu, SidebarMenuItem
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { NavManagementItem } from "@/app/(sistema)/_config/nav-management";
import Link from "next/link";

export function NavManagement({
  items,
}: {
  items: NavManagementItem[];
}) {

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-sm font-medium">Gestão</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <Link href={item.url} className="flex items-center gap-2 ml-2">
              <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-5!" />
              <span className="text-lg">{item.name}</span></Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
