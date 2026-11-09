"use client";

import { useState, type FormEvent } from "react";
import SquareLock01Icon from "@hugeicons/core-free-icons/SquareLock01Icon";
import ViewIcon from "@hugeicons/core-free-icons/ViewIcon";
import ViewOffSlashIcon from "@hugeicons/core-free-icons/ViewOffSlashIcon";
import { HugeiconsIcon } from "@hugeicons/react";

import { SystemDialog } from "@/components/shared/system-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_FORM_ID = "member-password-form";
const PASSWORD_HINT = "Use pelo menos 8 caracteres.";

type MemberPasswordDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (newPassword: string) => void;
};

/**
 * Pede a nova senha do membro e a repetição dela.
 * O botão Alterar só libera quando as duas têm pelo menos 8 caracteres e são iguais.
 */
export function MemberPasswordDialog(props: MemberPasswordDialogProps) {
    const [session, setSession] = useState(0);
    const [lastOpen, setLastOpen] = useState(props.open);

    if (props.open !== lastOpen) {
        setLastOpen(props.open);

        if (props.open) {
            setSession((current) => current + 1);
        }
    }

    return <MemberPasswordDialogSession key={session} {...props} />;
}

function MemberPasswordDialogSession({
    open,
    onOpenChange,
    onSubmit,
}: MemberPasswordDialogProps) {
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const passwordsDiffer = password.length > 0 && confirmation.length > 0 && password !== confirmation;
    const canSubmit = password.length >= PASSWORD_MIN_LENGTH
        && confirmation.length >= PASSWORD_MIN_LENGTH
        && password === confirmation;

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!canSubmit) {
            return;
        }

        onSubmit(password);
    }

    return (
        <SystemDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Alterar senha"
            description={`${PASSWORD_HINT} Repita a senha para confirmar.`}
            actions={
                <Button
                    type="submit"
                    form={PASSWORD_FORM_ID}
                    disabled={!canSubmit}
                >
                    Alterar
                </Button>
            }
        >
            <form id={PASSWORD_FORM_ID} className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <p className="text-muted-foreground">{PASSWORD_HINT}</p>
                <PasswordField
                    id="member-new-password"
                    label="Nova senha"
                    value={password}
                    autoComplete="new-password"
                    onChange={setPassword}
                />
                <PasswordField
                    id="member-repeat-password"
                    label="Repetir senha"
                    value={confirmation}
                    autoComplete="new-password"
                    invalid={passwordsDiffer}
                    onChange={setConfirmation}
                />
                {passwordsDiffer ? (
                    <p className="text-center text-sm text-destructive" role="alert">
                        As senhas não conferem.
                    </p>
                ) : null}
            </form>
        </SystemDialog>
    );
}

function PasswordField({
    id,
    label,
    value,
    autoComplete,
    invalid = false,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    autoComplete: string;
    invalid?: boolean;
    onChange: (value: string) => void;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>
            <Input
                id={id}
                name={id}
                type={visible ? "text" : "password"}
                value={value}
                placeholder={label}
                autoComplete={autoComplete}
                aria-invalid={invalid || undefined}
                onChange={(event) => onChange(event.currentTarget.value)}
                startIcon={<HugeiconsIcon icon={SquareLock01Icon} strokeWidth={1.5} />}
                endIcon={
                    <button
                        type="button"
                        onClick={() => setVisible((current) => !current)}
                        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                        className="cursor-pointer"
                    >
                        <HugeiconsIcon
                            icon={visible ? ViewOffSlashIcon : ViewIcon}
                            strokeWidth={1.5}
                        />
                    </button>
                }
            />
        </div>
    );
}
