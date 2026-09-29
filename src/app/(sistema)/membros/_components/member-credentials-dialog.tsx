"use client";

import { useState } from "react";

import { Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { notify } from "@/app/(sistema)/membros/_components/notify";

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
    const [copied, setCopied] = useState(false);

    async function copyAccess() {
        const text = `E-mail: ${email}\nSenha: ${password}`;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                return;
            }
        } catch {
            // The clipboard API can reject without a focused document. Fall through.
        }

        try {
            const area = document.createElement("textarea");
            area.value = text;
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

            setCopied(true);
        } catch {
            notify("error", "Não foi possível copiar o acesso.");
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    setCopied(false);
                }

                onOpenChange(nextOpen);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Membro adicionado</DialogTitle>
                    <DialogDescription>{message}</DialogDescription>
                </DialogHeader>
                <div className="rounded-2xl border bg-muted/40 p-4 font-mono text-sm break-all">
                    <p>E-mail: {email}</p>
                    <p className="mt-2">Senha: {password}</p>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={copyAccess}>
                        <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
                        {copied ? "Copiado" : "Copiar acesso"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
