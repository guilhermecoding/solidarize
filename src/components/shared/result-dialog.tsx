"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { LordIcon } from "@lordicon/react";

import animationSuccess from "@/assets/animations/lottie/folder-check.json" with { type: "json" };
import animationWarning from "@/assets/animations/lottie/warning.json" with { type: "json" };

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Resultado visual do dialog. */
export type ResultDialogStatus = "success" | "warning";

/** Tempo, em milissegundos, até o fechamento quando `duration` não é informado. */
const DEFAULT_DURATION_MS = 3000;

const animations = {
    success: animationSuccess,
    warning: animationWarning,
} as const;

const titleClassName = {
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-destructive",
} as const;

const resultDialogFade =
    "result-dialog-fade transition-opacity duration-300 ease-out data-starting-style:opacity-0 data-ending-style:opacity-0";

type DismissDetails = Parameters<
    NonNullable<DialogPrimitive.Root.Props["onOpenChange"]>
>[1];

export type ResultDialogProps = {
    /** Controla se o dialog está aberto. */
    open: boolean;
    /**
     * Recebe o próximo estado de abertura.
     * O segundo argumento permite cancelar o fechamento, como no dialog base.
     */
    onOpenChange: (open: boolean, details?: DismissDetails) => void;
    /** Escolhe a animação e a cor do título. */
    status: ResultDialogStatus;
    /** Título visível. Verde no sucesso e vermelho no aviso. */
    title: string;
    /** Texto menor, abaixo do título. Também é anunciado para leitores de tela. */
    subtitle: string;
    /**
     * Tempo até fechar, em milissegundos.
     * `null` mantém o dialog aberto.
     * @default 3000
     */
    duration?: number | null;
    /**
     * Impede o fechamento ao clicar fora do dialog.
     * @default false
     */
    disablePointerDismissal?: boolean;
    /** Conteúdo extra abaixo do subtítulo. */
    children?: ReactNode;
};

/**
 * Dialog de resultado para ações de salvar.
 * Fecha sozinho depois de {@link DEFAULT_DURATION_MS}, salvo quando `duration` é `null`.
 */
export function ResultDialog({
    open,
    onOpenChange,
    status,
    title,
    subtitle,
    duration = DEFAULT_DURATION_MS,
    disablePointerDismissal = false,
    children,
}: ResultDialogProps) {
    const onOpenChangeRef = useRef(onOpenChange);

    useEffect(() => {
        onOpenChangeRef.current = onOpenChange;
    });

    useEffect(() => {
        if (!open || duration === null) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            onOpenChangeRef.current(false);
        }, duration);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [open, duration]);

    return (
        <Dialog
            open={open}
            disablePointerDismissal={disablePointerDismissal}
            onOpenChange={(nextOpen, details) => {
                onOpenChange(nextOpen, details);
            }}
        >
            <DialogContent
                showCloseButton={false}
                overlayClassName={resultDialogFade}
                className={cn(
                    "top-0 right-0 bottom-0 left-0 flex h-auto max-h-none w-full max-w-none translate-x-0 translate-y-0 flex-col items-center justify-center overflow-y-auto rounded-none ring-0 sm:max-w-none md:top-1/2 md:right-auto md:bottom-auto md:left-1/2 md:h-auto md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:overflow-visible md:rounded-4xl md:ring-1",
                    resultDialogFade,
                )}
            >
                <div className="flex w-full flex-col items-center justify-center">
                    {open ? (
                        <LordIcon
                            icon={animations[status]}
                            trigger="in"
                            className="size-24"
                        />
                    ) : null}
                    <DialogTitle
                        className={cn(
                            "mt-4 text-center text-3xl font-bold",
                            titleClassName[status],
                        )}
                    >
                        {title}
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-center text-lg">
                        {subtitle}
                    </DialogDescription>
                </div>
                {children}
            </DialogContent>
        </Dialog>
    );
}
