"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Tema visual do dialog. `default` quando a variante não é informada. */
export type SystemDialogVariant = "default" | "destructive";

/**
 * Forma de encerrar o dialog.
 *
 * - `manual-close`: o rodapé aceita ações. Sem ações, mostra o botão "Tudo bem".
 * - `auto-close`: não aceita ações e fecha sozinho depois de {@link AUTO_CLOSE_DELAY_MS}.
 */
export type SystemDialogMode = "manual-close" | "auto-close";

/** Tempo, em milissegundos, até o fechamento no modo `auto-close`. */
const AUTO_CLOSE_DELAY_MS = 3000;

/**
 * Estado exposto por {@link useSystemDialog}.
 */
export type SystemDialogState = {
    /** Se o dialog está aberto. */
    open: boolean;
    /** Abre (`true`) ou fecha (`false`) o dialog. Aceita o valor novo ou um updater. */
    setOpen: (open: boolean | ((open: boolean) => boolean)) => void;
};

/**
 * Props compartilhadas pelos dois modos do {@link SystemDialog}.
 */
type SystemDialogSharedProps = {
    /** Controla se o dialog está aberto. */
    open: boolean;
    /**
     * Recebe o próximo estado de abertura.
     * O clique fora, o X e o botão "Tudo bem" também disparam este callback.
     */
    onOpenChange: (open: boolean) => void;
    /** Título visível do dialog. */
    title: ReactNode;
    /** Descrição anunciada só para leitores de tela. Não aparece na tela. */
    description: string;
    /** Corpo visível do dialog. */
    children?: ReactNode;
    /**
     * Tema visual.
     * `default` mantém o popup atual. `destructive` destaca título, anel e o botão padrão.
     * @default "default"
     */
    variant?: SystemDialogVariant;
    /**
     * Mostra o botão X no canto do dialog.
     * @default true
     */
    showCloseButton?: boolean;
    /**
     * Impede o fechamento ao clicar fora do dialog.
     * Omitido ou `false`, o clique fora fecha, como no dialog base.
     * @default false
     */
    disablePointerDismissal?: boolean;
};

/**
 * Modo manual. O rodapé pode receber ações customizadas.
 * Sem `actions`, o dialog mostra o botão padrão "Tudo bem".
 */
export type SystemDialogManualProps = SystemDialogSharedProps & {
    /**
     * Exige uma ação do usuário para fechar pelo rodapé.
     * @default "manual-close"
     */
    mode?: "manual-close";
    /**
     * Conteúdo do rodapé no lugar do botão "Tudo bem".
     * Quem passar ações customizadas fecha o dialog por `onOpenChange(false)`.
     */
    actions?: ReactNode;
};

/**
 * Modo automático. Fecha sozinho após 3 segundos.
 * Não aceita `actions`: o rodapé não é renderizado.
 */
export type SystemDialogAutoProps = SystemDialogSharedProps & {
    /** Fecha o dialog sozinho e esconde o rodapé de ações. */
    mode: "auto-close";
    /** Proibido neste modo. O rodapé não é exibido. */
    actions?: never;
};

/** Props do {@link SystemDialog}. O modo discrimina se `actions` pode existir. */
export type SystemDialogProps = SystemDialogManualProps | SystemDialogAutoProps;

/**
 * Estado e setter para controlar a abertura do {@link SystemDialog}.
 *
 * @param initialOpen - Se o dialog começa aberto. Padrão: `false`.
 * @returns `open` e `setOpen`. Passe os dois para `open` e `onOpenChange`.
 *
 * @example
 * const { open, setOpen } = useSystemDialog();
 */
export function useSystemDialog(initialOpen = false): SystemDialogState {
    const [open, setOpen] = useState(initialOpen);

    return { open, setOpen };
}

/**
 * Dialog de aviso do sistema.
 *
 * @param variant - Tipo de dialog.
 * - `default`: popup atual.
 * - `destructive`: destaca título, anel e o botão padrão.
 * 
 * @param mode - Modo de fechamento.
 * - `manual-close`: o rodapé aceita ações. Sem ações, mostra o botão "Tudo bem".
 * - `auto-close`: não aceita ações e fecha sozinho depois de {@link AUTO_CLOSE_DELAY_MS}.
 * 
 * @param open - Se o dialog está aberto.
 * @param onOpenChange - Recebe o próximo estado de abertura.
 * O clique fora, o X e o botão "Tudo bem" também disparam este callback.
 * 
 * @param title - Título visível do dialog.
 * @param description - Descrição anunciada só para leitores de tela. Não aparece na tela.
 * @param children - Conteúdo visível do dialog.
 * @param actions - Conteúdo do rodapé no lugar do botão "Tudo bem".
 * Quem passar ações customizadas fecha o dialog por `onOpenChange(false)`.
 * 
 * @param showCloseButton - Mostra o botão X no canto do dialog.
 * @param disablePointerDismissal - Impede o fechamento ao clicar fora do dialog.
 * Omitido ou `false`, o clique fora fecha, como no dialog base.
 * 
 * ```tsx
 * const { open, setOpen } = useSystemDialog();
 *
 * <SystemDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Aviso"
 *   description="Texto só para leitores de tela"
 * >
 *   Conteúdo visível
 * </SystemDialog>
 * ```
 *
 * @example Automático, sem rodapé
 * ```tsx
 * <SystemDialog
 *   mode="auto-close"
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Salvo"
 *   description="As alterações foram salvas."
 * />
 * ```
 */
export function SystemDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    variant = "default",
    showCloseButton = true,
    disablePointerDismissal = false,
    mode = "manual-close",
    actions,
}: SystemDialogProps) {
    useEffect(() => {
        if (mode !== "auto-close" || !open) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            onOpenChange(false);
        }, AUTO_CLOSE_DELAY_MS);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [mode, open, onOpenChange]);

    const isDestructive = variant === "destructive";

    return (
        <Dialog
            open={open}
            disablePointerDismissal={disablePointerDismissal}
            onOpenChange={(nextOpen) => {
                onOpenChange(nextOpen);
            }}
        >
            <DialogContent
                showCloseButton={showCloseButton}
                data-variant={variant}
                className={cn(isDestructive && "ring-destructive/25")}
            >
                <DialogHeader>
                    <DialogTitle className={cn(isDestructive && "text-destructive")}>
                        {title}
                    </DialogTitle>
                    <DialogDescription className="sr-only">{description}</DialogDescription>
                </DialogHeader>
                {children}
                {mode === "manual-close" ? (
                    <DialogFooter>
                        {actions ?? (
                            <DialogClose
                                render={
                                    <Button
                                        type="button"
                                        variant={isDestructive ? "destructive" : "default"}
                                    />
                                }
                            >
                                Tudo bem
                            </DialogClose>
                        )}
                    </DialogFooter>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
