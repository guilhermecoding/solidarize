"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export type NavSectionItem = {
  name: string;
  url: string;
  icon: IconSvgElement;
  exact?: boolean;
  requiresReadAccess?: boolean;
};

export type NavSectionGroup = {
  label?: string;
  items: NavSectionItem[];
};

export type NavSectionProps = {
  section: NavSectionGroup;
  className?: string;
};

function normalizePath(path: string) {
  if (path === "/") {
    return "/";
  }

  return path.replace(/\/+$/, "");
}

function isMenuItemActive(
  pathname: string | null,
  itemUrl: string,
  exact = false,
) {
  if (!pathname || !itemUrl || itemUrl === "#" || itemUrl.startsWith("#")) {
    return false;
  }

  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(itemUrl);

  if (exact || targetPath === "/") {
    return currentPath === targetPath;
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function NavSectionList({
  items,
  pathname,
}: {
  items: NavSectionItem[];
  pathname: string | null;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu className="gap-1.5">
      {items.map((item) => {
        const active = isMenuItemActive(pathname, item.url, item.exact);

        return (
          <SidebarMenuItem key={`${item.name}-${item.url}`}>
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

function NavSectionActive({ items }: { items: NavSectionItem[] }) {
  const pathname = usePathname();

  return <NavSectionList items={items} pathname={pathname} />;
}

export function NavSection({ section, className }: NavSectionProps) {
  if (section.items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className={className}>
      {section.label ? (
        <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-sidebar-foreground/60">
          {section.label}
        </SidebarGroupLabel>
      ) : null}
      <Suspense fallback={<NavSectionList items={section.items} pathname={null} />}>
        <NavSectionActive items={section.items} />
      </Suspense>
    </SidebarGroup>
  );
}

export function NavManagement(props: NavSectionProps) {
  return <NavSection {...props} />;
}
