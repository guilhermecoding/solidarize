"use client";

import { SystemDialog } from "@/components/shared/system-dialog";
import { Button } from "@/components/ui/button";

const CONFIRM_TITLE = "Tem certeza disso?";
const CONFIRM_WARNING =
    "Esta é uma ação irreversível. Assistidos vinculados a ele não serão excluídos. Confirme somente se você estiver seguro disso.";

type MemberDangerZoneDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

/**
 * Confirmação destrutiva antes de pedir a senha e excluir o membro.
 */
export function MemberDangerZoneDialog({
    open,
    onOpenChange,
    onConfirm,
}: MemberDangerZoneDialogProps) {
    return (
        <SystemDialog
            open={open}
            onOpenChange={onOpenChange}
            variant="destructive"
            title="Excluir membro"
            description={`${CONFIRM_TITLE} ${CONFIRM_WARNING}`}
            actions={
                <>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm}>
                        Confirmar
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-2">
                <p className="text-xl font-bold mb-2">{CONFIRM_TITLE}</p>
                <p className="text-muted-foreground">{CONFIRM_WARNING}</p>
            </div>
        </SystemDialog>
    );
}
