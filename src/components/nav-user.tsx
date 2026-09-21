"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeSelect } from "@/components/theme-select";
import { HugeiconsIcon } from "@hugeicons/react";
import { UnfoldMoreIcon, LogoutIcon, PaintBoardIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export type NavUserInfo = {
  name: string;
  email: string;
  avatar: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function NavUser({
  user,
}: {
  user: NavUserInfo;
}) {
  const initials = getInitials(user.name);
  const router = useRouter();
  const { isMobile } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const themeSelectOpenRef = useRef(false);

  useLayoutEffect(() => {
    return () => {
      setSigningOut(false);
    };
  }, []);

  const handleSignOut = async () => {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.replace("/entrar");
          },
          onError: () => {
            setSigningOut(false);
          },
        },
      });
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu
          open={menuOpen}
          onOpenChange={(open) => {
            if (!open && themeSelectOpenRef.current) {
              return;
            }
            setMenuOpen(open);
          }}
        >
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar>
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar>
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="flex items-center gap-2.5 rounded-xl px-3 py-2">
              <HugeiconsIcon icon={PaintBoardIcon} strokeWidth={2} className="size-4 shrink-0" />
              <span className="text-sm">Tema</span>
              <div className="ml-auto">
                <ThemeSelect
                  onOpenChange={(open) => {
                    themeSelectOpenRef.current = open;
                  }}
                />
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={signingOut} onClick={handleSignOut}>
              <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
