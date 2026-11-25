"use client";

import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ReadOnlyTooltipProps = {
    children: ReactNode;
    message?: string;
    className?: string;
    side?: "top" | "bottom" | "left" | "right";
};

/**
 * Envolve controles desabilitados de leitura para exibir cursor not-allowed e tooltip explicativo.
 */
export function ReadOnlyTooltip({
    children,
    message = "Você não possui permissão para esta ação pois seu usuário é somente leitura.",
    className,
    side = "top",
}: ReadOnlyTooltipProps) {
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <span
                        tabIndex={0}
                        className={cn(
                            "inline-flex cursor-not-allowed outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            className,
                        )}
                    />
                }
            >
                {children}
            </TooltipTrigger>
            <TooltipContent side={side} className="text-center">
                {message}
            </TooltipContent>
        </Tooltip>
    );
}
