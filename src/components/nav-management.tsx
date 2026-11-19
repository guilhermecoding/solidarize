"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";

import { NavManagementItem } from "@/app/(sistema)/_config/nav-management";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

function normalizePath(path: string) {
  if (path === "/") {
    return "/";
  }

  return path.replace(/\/+$/, "");
}

function isMenuItemActive(pathname: string | null, itemUrl: string) {
  if (!pathname || !itemUrl || itemUrl === "#" || itemUrl.startsWith("#")) {
    return false;
  }

  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(itemUrl);

  if (targetPath === "/") {
    return currentPath === "/";
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function NavManagementList({
  items,
  pathname,
}: {
  items: NavManagementItem[];
  pathname: string | null;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu className="gap-1.5">
      {items.map((item) => {
        const active = isMenuItemActive(pathname, item.url);

        return (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              isActive={active}
              tooltip={item.name}
              aria-current={active ? "page" : undefined}
              className="text-sidebar-foreground/75 not-data-active:hover:text-sidebar-foreground"
              render={
                <Link
                  href={item.url}
                  onClick={() => {
                    if (isMobile) {
                      setOpenMobile(false);
                    }
                  }}
                />
              }
            >
              <HugeiconsIcon
                icon={item.icon}
                strokeWidth={2}
                className="size-5! group-data-[collapsible=icon]:size-4!"
              />
              <span>{item.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function NavManagementActive({
  items,
}: {
  items: NavManagementItem[];
}) {
  const pathname = usePathname();

  return <NavManagementList items={items} pathname={pathname} />;
}

export function NavManagement({
  items,
}: {
  items: NavManagementItem[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-sidebar-foreground/60">
        GESTÃO
      </SidebarGroupLabel>
      <Suspense fallback={<NavManagementList items={items} pathname={null} />}>
        <NavManagementActive items={items} />
      </Suspense>
    </SidebarGroup>
  );
}
