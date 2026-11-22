"use client";

import type { ReactNode } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type WithdrawStep = 1 | 2 | 3;

type WithdrawShellProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    step: WithdrawStep;
    stepLabels: readonly [string, string, string];
    headerExtra?: ReactNode;
    children: ReactNode;
    footer: ReactNode;
    preventDismiss?: boolean;
};

/**
 * Container responsivo (Dialog no desktop e Drawer no mobile) para fluxos de retirada em 3 etapas.
 */
export function WithdrawShell({
    open,
    onOpenChange,
    title,
    description,
    step,
    stepLabels,
    headerExtra,
    children,
    footer,
    preventDismiss = false,
}: WithdrawShellProps) {
    const isMobile = useIsMobile();

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen && preventDismiss) {
            return;
        }

        onOpenChange(nextOpen);
    }

    const stepBar = (
        <div className="flex flex-col gap-2 pt-2">
            <ol aria-label="Etapas da retirada" className="grid grid-cols-3 gap-2">
                {stepLabels.map((label, index) => {
                    const stepNumber = (index + 1) as WithdrawStep;
                    const isActive = step === stepNumber;
                    const isCompleted = step > stepNumber;

                    return (
                        <li
                            key={label}
                            aria-current={isActive ? "step" : undefined}
                            className="flex flex-col gap-1.5"
                        >
                            <span
                                className={cn(
                                    "h-1.5 w-full rounded-full transition-colors",
                                    isCompleted
                                        ? "bg-emerald-600"
                                        : isActive
                                            ? "bg-foreground"
                                            : "bg-muted",
                                )}
                            />
                            <span
                                className={cn(
                                    "truncate text-xs font-medium",
                                    isActive
                                        ? "text-foreground"
                                        : isCompleted
                                            ? "text-emerald-700 dark:text-emerald-400"
                                            : "text-muted-foreground",
                                )}
                            >
                                {stepNumber}. {label}
                            </span>
                        </li>
                    );
                })}
            </ol>
            {headerExtra}
        </div>
    );

    if (isMobile) {
        return (
            <Drawer
                open={open}
                onOpenChange={handleOpenChange}
                swipeDirection="down"
                snapPoints={[1]}
                showSwipeHandle
            >
                <DrawerContent
                    className="rounded-none"
                    style={{
                        "--drawer-content-height": "100dvh",
                        "--drawer-content-max-height": "100dvh",
                        "--drawer-inset": "0px",
                    } as React.CSSProperties}
                >
                    <DrawerHeader className="border-b pb-3 text-left">
                        <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>
                        <DrawerDescription>{description}</DrawerDescription>
                        {stepBar}
                    </DrawerHeader>
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                        {children}
                    </div>
                    <DrawerFooter className="flex-col-reverse border-t pt-3">
                        {footer}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal={preventDismiss}>
            <DialogContent
                showCloseButton={!preventDismiss}
                className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(60rem,calc(100%-2rem))]"
            >
                <DialogHeader className="shrink-0 border-b px-6 pt-6 pr-14 pb-4">
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                    {stepBar}
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                    {children}
                </div>
                <DialogFooter className="shrink-0 border-t px-6 py-4 sm:justify-between">
                    {footer}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
