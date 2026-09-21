"use client";

import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerIcon, Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";

const THEME_ITEMS = {
  light: "Claro",
  dark: "Escuro",
  system: "Sistema",
} as const;

type ThemeValue = keyof typeof THEME_ITEMS;

export function ThemeSelect({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const { theme, setTheme } = useTheme();
  const value = (theme ?? "system") as ThemeValue;

  return (
    <Select
      value={value}
      onValueChange={(nextTheme) => {
        if (nextTheme) setTheme(nextTheme);
      }}
      onOpenChange={onOpenChange}
      modal={false}
      items={THEME_ITEMS}
    >
      <SelectTrigger
        size="sm"
        aria-label="Tema"
        className="min-w-28"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        align="center"
        side="right"
        sideOffset={8}
        alignItemWithTrigger={false}
        className="z-60 min-w-36"
      >
        <SelectItem value="light">
          <HugeiconsIcon icon={Sun01Icon} strokeWidth={2} className="pointer-events-none size-4 text-muted-foreground mt-0.5" />
          {THEME_ITEMS.light}
        </SelectItem>
        <SelectItem value="dark">
          <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} className="pointer-events-none size-4 text-muted-foreground mt-0.5" />
          {THEME_ITEMS.dark}
        </SelectItem>
        <SelectItem value="system">
          <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} className="pointer-events-none size-4 text-muted-foreground mt-0.5" />
          {THEME_ITEMS.system}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
