"use client";

import { useLayoutEffect, useRef, useState, type ReactElement } from "react";
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
import { UnfoldMoreIcon, PaintBoardIcon, LogoutCircle02Icon } from "@hugeicons/core-free-icons";
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

function useUserSignOut() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

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
            router.refresh();
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

  return { signingOut, handleSignOut };
}

function NavUserMenuContent({
  user,
  signingOut,
  onSignOut,
  onThemeSelectOpenChange,
  themeSide = "right",
  themeAlign = "center",
}: {
  user: NavUserInfo;
  signingOut: boolean;
  onSignOut: () => void;
  onThemeSelectOpenChange: (open: boolean) => void;
  themeSide?: "top" | "right" | "bottom" | "left";
  themeAlign?: "start" | "center" | "end";
}) {
  const initials = getInitials(user.name);

  return (
    <>
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
            side={themeSide}
            align={themeAlign}
            onOpenChange={onThemeSelectOpenChange}
          />
        </div>
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={signingOut}
        onClick={onSignOut}
        variant="destructive"
      >
        <HugeiconsIcon icon={LogoutCircle02Icon} strokeWidth={2} />
        Sair
      </DropdownMenuItem>
    </>
  );
}

export function NavUser({
  user,
}: {
  user: NavUserInfo;
}) {
  const initials = getInitials(user.name);
  const { isMobile } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const themeSelectOpenRef = useRef(false);
  const { signingOut, handleSignOut } = useUserSignOut();

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
            <NavUserMenuContent
              user={user}
              signingOut={signingOut}
              onSignOut={handleSignOut}
              onThemeSelectOpenChange={(open) => {
                themeSelectOpenRef.current = open;
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function MobileNavUser({
  user,
  open,
  onOpenChange,
  trigger,
}: {
  user: NavUserInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactElement;
}) {
  const themeSelectOpenRef = useRef(false);
  const { signingOut, handleSignOut } = useUserSignOut();

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && themeSelectOpenRef.current) {
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent
        className="z-50 min-w-56 rounded-2xl"
        side="top"
        align="end"
        sideOffset={16}
      >
        <NavUserMenuContent
          user={user}
          signingOut={signingOut}
          onSignOut={handleSignOut}
          themeSide="top"
          themeAlign="end"
          onThemeSelectOpenChange={(nextOpen) => {
            themeSelectOpenRef.current = nextOpen;
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
