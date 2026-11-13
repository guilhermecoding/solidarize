"use client";

import { useState } from "react";

import { CheckIcon, Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { ResultDialog } from "@/components/shared/result-dialog";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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
        <ResultDialog
            status="success"
            open={open}
            duration={null}
            disablePointerDismissal
            title="Deu certo!"
            subtitle="Copie as informações de acesso abaixo e encaminhe para o membro."
            onOpenChange={(nextOpen, details) => {
                if (!nextOpen && !copied) {
                    details?.cancel();
                    return;
                }

                onOpenChange(nextOpen);
            }}
        >
            {message ? <p className="sr-only">{message}</p> : null}
            <div className="rounded-2xl border bg-muted/40 p-4 font-mono text-sm break-all">
                <p>E-mail: {email}</p>
                <p className="mt-2">Senha: {password}</p>
            </div>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
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
        </ResultDialog>
    );
}
