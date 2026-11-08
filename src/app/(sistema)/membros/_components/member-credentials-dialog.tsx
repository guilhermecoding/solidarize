"use client";

import { useState } from "react";

import { CheckIcon, Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { LordIcon } from "@lordicon/react";

import animationCheck from "@/assets/animations/lottie/check.json" with { type: "json" };

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { notify } from "@/lib/notify";

type MemberCredentialsDialogProps = {
    open: boolean;
    message: string;
    email: string;
    password: string;
    onOpenChange: (open: boolean) => void;
};

export function MemberCredentialsDialog({
    open,
    message,
    email,
    password,
    onOpenChange,
}: MemberCredentialsDialogProps) {
    const [copiedFor, setCopiedFor] = useState<string | null>(null);
    const accessText = `Olá! Este é o seu acesso ao Solidarize:\n\nE-mail: ${email}\nSenha: ${password}`;
    const copied = copiedFor === accessText;

    async function copyAccess() {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(accessText);
                setCopiedFor(accessText);
                return;
            }
        } catch {
            // The clipboard API can reject without a focused document. Fall through.
        }

        try {
            const area = document.createElement("textarea");
            area.value = accessText;
            area.setAttribute("readonly", "");
            area.style.position = "fixed";
            area.style.left = "-9999px";
            document.body.appendChild(area);
            area.select();
            const copiedToClipboard = document.execCommand("copy");
            area.remove();

            if (!copiedToClipboard) {
                throw new Error("copy failed");
            }

            setCopiedFor(accessText);
        } catch {
            notify("error", "Não foi possível copiar o acesso.");
        }
    }

    return (
        <Dialog
            open={open}
            disablePointerDismissal
            onOpenChange={(nextOpen, details) => {
                if (!nextOpen && !copied) {
                    details.cancel();
                    return;
                }

                onOpenChange(nextOpen);
            }}
        >
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Membro adicionado</DialogTitle>
                    <DialogDescription className="sr-only">{message}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center">
                    <LordIcon
                        icon={animationCheck}
                        trigger="in"
                        className="size-24"
                    />
                    <h2 className="text-3xl font-bold mt-4">
                        Deu certo!
                    </h2>
                    <p className="text-lg text-muted-foreground mt-2 text-center">
                        Copie as informações de acesso abaixo e encaminhe para o membro.
                    </p>
                </div>
                <div className="rounded-2xl border bg-muted/40 p-4 font-mono text-sm break-all">
                    <p>E-mail: {email}</p>
                    <p className="mt-2">Senha: {password}</p>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button type="button" variant="outline" onClick={copyAccess}>
                        <HugeiconsIcon
                            icon={
                                copied ? CheckIcon : Copy01Icon
                            }
                            strokeWidth={2}
                        />
                        {copied ? "Copiado" : "Copiar acesso"}
                    </Button>
                    <Button
                        type="button"
                        variant="default"
                        disabled={!copied}
                        onClick={() => onOpenChange(false)}
                    >
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
