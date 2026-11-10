"use client";

import { useState, type FormEvent } from "react";
import SquareLock01Icon from "@hugeicons/core-free-icons/SquareLock01Icon";
import ViewIcon from "@hugeicons/core-free-icons/ViewIcon";
import ViewOffSlashIcon from "@hugeicons/core-free-icons/ViewOffSlashIcon";
import { HugeiconsIcon } from "@hugeicons/react";

import { SystemDialog } from "@/components/shared/system-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircleUnlock01Icon } from "@hugeicons/core-free-icons";

/** Tamanho mínimo da senha, igual ao login. */
const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_FORM_ID = "admin-password-form";

/** Mensagem visível e anunciada do dialog de senha. */
const PASSWORD_PROMPT = "Digite a sua senha para confirmar a ação.";

/**
 * Resultado da ação confirmada com a senha de administrador.
 * `ok: true` indica senha correta e ação concluída.
 */
export type AdminPasswordConfirmResult =
    | { ok: true }
    | { ok: false; message: string };

/**
 * Props do {@link AdminPasswordDialog}.
 */
type AdminPasswordDialogProps = {
    /** Se o dialog está aberto. */
    open: boolean;
    /** Recebe o próximo estado de abertura. O X também dispara este callback. */
    onOpenChange: (open: boolean) => void;
    /**
     * Confere a senha e executa a ação protegida.
     * @param password - Senha digitada pelo administrador.
     * @returns `ok: true` quando a senha está correta e a ação terminou bem.
     */
    onConfirm: (password: string) => Promise<AdminPasswordConfirmResult>;
    /** Chamado depois que `onConfirm` retorna sucesso. */
    onSuccess: () => void;
};

/**
 * Pede a senha do administrador antes de uma ação sensível.
 *
 * Não fecha ao clicar fora. A senha começa oculta. O botão Confirmar fica
 * desabilitado enquanto a senha está vazia, tem menos de 8 caracteres ou a
 * confirmação está em andamento. Senha incorreta mantém o dialog aberto e
 * mostra a mensagem retornada.
 */
export function AdminPasswordDialog(props: AdminPasswordDialogProps) {
    const [session, setSession] = useState(0);
    const [lastOpen, setLastOpen] = useState(props.open);

    if (props.open !== lastOpen) {
        setLastOpen(props.open);

        if (props.open) {
            setSession((current) => current + 1);
        }
    }

    return <AdminPasswordDialogSession key={session} {...props} />;
}

function AdminPasswordDialogSession({
    open,
    onOpenChange,
    onConfirm,
    onSuccess,
}: AdminPasswordDialogProps) {
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const canSubmit = password.length >= PASSWORD_MIN_LENGTH && !pending;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!canSubmit) {
            return;
        }

        setPending(true);
        setError(null);

        try {
            const result = await onConfirm(password);

            if (!result.ok) {
                setError(result.message);
                setPending(false);
                return;
            }

            onSuccess();
        } catch {
            setError("Não foi possível confirmar a senha.");
            setPending(false);
        }
    }

    return (
        <SystemDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Senha de administrador"
            description={PASSWORD_PROMPT}
            disablePointerDismissal
            actions={
                <Button
                    type="submit"
                    form={PASSWORD_FORM_ID}
                    disabled={!canSubmit}
                    loading={pending}
                    loadingText="Confirmando"
                >
                    Confirmar
                </Button>
            }
        >
            <form id={PASSWORD_FORM_ID} className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex items-center justify-center">
                    <div className="flex items-center justify-center bg-muted rounded-full p-4 w-fit">
                        <HugeiconsIcon icon={CircleUnlock01Icon} strokeWidth={1.5} className="size-12" />
                    </div>
                </div>
                <p className="text-center text-muted-foreground text-lg font-medium">{PASSWORD_PROMPT}</p>
                <Input
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    placeholder="Senha"
                    autoComplete="current-password"
                    disabled={pending}
                    aria-invalid={error ? true : undefined}
                    onChange={(event) => {
                        setPassword(event.currentTarget.value);
                        setError(null);
                    }}
                    startIcon={<HugeiconsIcon icon={SquareLock01Icon} strokeWidth={1.5} />}
                    endIcon={
                        <button
                            type="button"
                            onClick={() => setPasswordVisible((visible) => !visible)}
                            aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                            className="cursor-pointer"
                        >
                            <HugeiconsIcon
                                icon={passwordVisible ? ViewOffSlashIcon : ViewIcon}
                                strokeWidth={1.5}
                            />
                        </button>
                    }
                />
                {error ? (
                    <p className="text-center text-sm text-destructive" role="alert">
                        {error}
                    </p>
                ) : null}
            </form>
        </SystemDialog>
    );
}
