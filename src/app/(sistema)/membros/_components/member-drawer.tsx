"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { useAction } from "next-safe-action/hooks";
import animationCheck from "@/assets/animations/lottie/check.json" with { type: "json" };
import { createMemberAction, deleteMemberAction, setMemberPasswordAction, updateMemberAction } from "@/app/(sistema)/membros/action";
import { MemberDangerZoneDialog } from "@/app/(sistema)/membros/_components/member-danger-zone-dialog";
import { MemberPasswordDialog } from "@/app/(sistema)/membros/_components/member-password-dialog";
import { AdminPasswordDialog } from "@/components/shared/admin-password-dialog";
import { SystemDialog } from "@/components/shared/system-dialog";
import { notify } from "@/lib/notify";
import { memberFormSchema, type MemberFormValues } from "@/app/(sistema)/membros/schema";
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
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatContact } from "@/lib/validate-contact";
import { formatCpf } from "@/lib/validate-cpf";
import { formatDateOfBirthInput } from "@/lib/validate-date-of-birth";
import {
    userAccessLabels,
    userPermissionLabels,
    userPermissions,
    userRoleLabels,
    userRoles,
    type Member,
    type MemberCredentials,
    type UserAccess,
    type UserPermission,
    type UserRole,
} from "@/services/user/user.type";
import SeparatorSection from "@/components/separator-section";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import { BirthdayCakeIcon, Call02Icon, IdCardIcon, Key01Icon, Location01Icon, Mail02Icon, PowerIcon, SquareLock01Icon, StarAward02Icon, UserCircleIcon, UserRemove01Icon } from "@hugeicons/core-free-icons";
import { LordIcon } from "@lordicon/react";

const takenFieldMessages = {
    "Este CPF já está em uso.": {
        field: "cpf",
        message: "Alguém já possui este CPF!",
    },
    "Este e-mail já está em uso.": {
        field: "email",
        message: "Alguém já possui este email!",
    },
} as const;

const emptyMemberFormValues: MemberFormValues = {
    name: "",
    cpf: "",
    email: "",
    contact: "",
    address: "",
    dateOfBirth: "",
    role: "member",
    access: "active",
    permission: "read",
};

type MemberDrawerProps = {
    open: boolean;
    member: Member | null;
    currentUserId: string;
    onOpenChange: (open: boolean) => void;
    onCreated: (credentials: MemberCredentials, message: string) => void;
    onUpdated: (message: string) => void;
};

export function MemberDrawer({
    open,
    member,
    currentUserId,
    onOpenChange,
    onCreated,
    onUpdated,
}: MemberDrawerProps) {
    const router = useRouter();
    const isMobile = useIsMobile();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [memberPasswordOpen, setMemberPasswordOpen] = useState(false);
    const [nextPassword, setNextPassword] = useState("");
    const [dangerAction, setDangerAction] = useState<"delete" | "set-password">("delete");
    const [successKind, setSuccessKind] = useState<"delete" | "set-password">("delete");
    const [successOpen, setSuccessOpen] = useState(false);
    const { executeAsync: deleteMember } = useAction(deleteMemberAction);
    const { executeAsync: changeMemberPassword } = useAction(setMemberPasswordAction);
    const canChangePassword = member !== null;
    const canDelete = canChangePassword && member.id !== currentUserId;
    const title = member ? "Editar Membro" : "Adicionar Membro";
    const description = member
        ? "Atualize os dados e o acesso deste membro."
        : "Preencha os dados para criar o acesso do membro.";

    function handleEditOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            setConfirmOpen(false);
            setPasswordOpen(false);
            setMemberPasswordOpen(false);
            setNextPassword("");
        }

        onOpenChange(nextOpen);
    }

    function handleDeleted() {
        setConfirmOpen(false);
        setPasswordOpen(false);
        setMemberPasswordOpen(false);
        setNextPassword("");
        onOpenChange(false);
        setSuccessKind("delete");
        setSuccessOpen(true);
        router.refresh();
    }

    function handlePasswordChanged() {
        setMemberPasswordOpen(false);
        setPasswordOpen(false);
        setNextPassword("");
        onOpenChange(false);
        setSuccessKind("set-password");
        setSuccessOpen(true);
    }

    const form = (
        <MemberForm
            key={member?.id ?? "new"}
            member={member}
            surface={isMobile ? "drawer" : "dialog"}
            canChangePassword={canChangePassword}
            canDelete={canDelete}
            onRequestDelete={() => setConfirmOpen(true)}
            onRequestPasswordChange={() => setMemberPasswordOpen(true)}
            onCreated={onCreated}
            onUpdated={onUpdated}
        />
    );
    const deleteDialogs = (
        <>
            <MemberDangerZoneDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                onConfirm={() => {
                    setDangerAction("delete");
                    setConfirmOpen(false);
                    setPasswordOpen(true);
                }}
            />
            <MemberPasswordDialog
                open={memberPasswordOpen}
                onOpenChange={setMemberPasswordOpen}
                onSubmit={(newPassword) => {
                    setNextPassword(newPassword);
                    setDangerAction("set-password");
                    setPasswordOpen(true);
                }}
            />
            <AdminPasswordDialog
                open={passwordOpen}
                onOpenChange={setPasswordOpen}
                onConfirm={async (password) => {
                    if (!member) {
                        return { ok: false, message: "Membro inválido." };
                    }

                    const changingPassword = dangerAction === "set-password";
                    const result = changingPassword
                        ? await changeMemberPassword({
                            id: member.id,
                            password,
                            newPassword: nextPassword,
                        })
                        : await deleteMember({ id: member.id, password });

                    if (result.serverError) {
                        return { ok: false, message: result.serverError };
                    }

                    if (result.validationErrors) {
                        return { ok: false, message: "A senha deve ter pelo menos 8 caracteres." };
                    }

                    if (!result.data?.ok) {
                        return {
                            ok: false,
                            message: result.data?.message ?? (
                                changingPassword
                                    ? "Não foi possível alterar a senha."
                                    : "Não foi possível excluir o membro."
                            ),
                        };
                    }

                    return { ok: true };
                }}
                onSuccess={() => {
                    if (dangerAction === "set-password") {
                        handlePasswordChanged();
                        return;
                    }

                    handleDeleted();
                }}
            />
            <SystemDialog
                mode="auto-close"
                open={successOpen}
                onOpenChange={setSuccessOpen}
                title={successKind === "set-password" ? "Senha alterada" : "Membro excluído"}
                showCloseButton={false}
                description={successKind === "set-password" ? "Senha alterada com sucesso." : "Membro excluído com sucesso."}
            >
                <div className="flex flex-col items-center justify-center">
                    <LordIcon
                        icon={animationCheck}
                        trigger="in"
                        className="size-24"
                    />
                    <h2 className="text-3xl font-bold mt-4">
                        Deu certo!
                    </h2>
                </div>
                <p className="text-muted-foreground text-center text-lg font-medium">
                    {successKind === "set-password" ? "Senha alterada com sucesso." : "Membro excluído com sucesso."}
                </p>
            </SystemDialog>
        </>
    );

    if (isMobile) {
        return (
            <>
                <Drawer
                    open={open}
                    onOpenChange={handleEditOpenChange}
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
                        <DrawerHeader>
                            <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>
                            <DrawerDescription>{description}</DrawerDescription>
                        </DrawerHeader>
                        {form}
                    </DrawerContent>
                </Drawer>
                {deleteDialogs}
            </>
        );
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleEditOpenChange}>
                <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(64rem,calc(100%-2rem))]">
                    <DialogHeader className="shrink-0 px-6 pt-6 pr-14">
                        <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    {form}
                </DialogContent>
            </Dialog>
            {deleteDialogs}
        </>
    );
}

function MemberForm({
    member,
    surface,
    canChangePassword,
    canDelete,
    onRequestDelete,
    onRequestPasswordChange,
    onCreated,
    onUpdated,
}: {
    member: Member | null;
    surface: "drawer" | "dialog";
    canChangePassword: boolean;
    canDelete: boolean;
    onRequestDelete: () => void;
    onRequestPasswordChange: () => void;
    onCreated: (credentials: MemberCredentials, message: string) => void;
    onUpdated: (message: string) => void;
}) {
    const [takenField, setTakenField] = useState<"cpf" | "email" | null>(null);

    function showActionError(message: string) {
        const taken = takenFieldMessages[message as keyof typeof takenFieldMessages];

        if (!taken) {
            setTakenField(null);
            notify("error", message);
            return;
        }

        setTakenField(taken.field);
    }

    const { execute: createMember, isPending: isCreating } = useAction(createMemberAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                showActionError(data.message);
                return;
            }

            onCreated(data.data, data.message ?? "Membro adicionado com sucesso.");
        },
        onError: ({ error }) => {
            notify("error", error.serverError ?? "Não foi possível adicionar o membro.");
        },
    });
    const { execute: updateMember, isPending: isUpdating } = useAction(updateMemberAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                showActionError(data.message);
                return;
            }

            onUpdated(data.message ?? "Membro atualizado com sucesso.");
        },
        onError: ({ error }) => {
            notify("error", error.serverError ?? "Não foi possível editar o membro.");
        },
    });
    const isPending = isCreating || isUpdating;
    const form = useForm({
        defaultValues: member ? toFormValues(member) : emptyMemberFormValues,
        validators: {
            onSubmit: memberFormSchema,
        },
        onSubmit: ({ value }) => {
            if (member) {
                updateMember({ id: member.id, ...value });
                return;
            }

            createMember(value);
        },
    });
    const submissionAttempts = useStore(form.store, (state) => state.submissionAttempts);

    return (
        <>
            <form
                id="member-form"
                className={
                    surface === "dialog"
                        ? "min-h-0 flex-1 overflow-y-auto px-6 py-4"
                        : "min-h-0 flex-1 overflow-y-auto px-4 py-4"
                }
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    form.handleSubmit();
                }}
            >
                <FieldGroup>
                    <form.Field name="name">
                        {(field) => (
                            <TextField
                                field={field}
                                label="Nome Completo"
                                autoComplete="name"
                                placeholder="Ex: João da Silva"
                                attempts={submissionAttempts}
                                icon={UserCircleIcon}
                            />
                        )}
                    </form.Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <form.Field name="cpf">
                            {(field) => (
                                <TextField
                                    field={field}
                                    label="CPF"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="000.000.000-00"
                                    attempts={submissionAttempts}
                                    format={formatCpf}
                                    icon={IdCardIcon}
                                    serverError={takenField === "cpf" ? takenFieldMessages["Este CPF já está em uso."].message : undefined}
                                    onEdit={() => {
                                        setTakenField((current) => current === "cpf" ? null : current);
                                    }}
                                />
                            )}
                        </form.Field>
                        <form.Field name="email">
                            {(field) => (
                                <TextField
                                    field={field}
                                    label="E-mail"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    placeholder="exemplo@email.com"
                                    attempts={submissionAttempts}
                                    icon={Mail02Icon}
                                    serverError={takenField === "email" ? takenFieldMessages["Este e-mail já está em uso."].message : undefined}
                                    onEdit={() => {
                                        setTakenField((current) => current === "email" ? null : current);
                                    }}
                                />
                            )}
                        </form.Field>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <form.Field name="contact">
                            {(field) => (
                                <TextField
                                    field={field}
                                    label="Contato"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    placeholder="(00) 00000-0000"
                                    attempts={submissionAttempts}
                                    format={formatContact}
                                    icon={Call02Icon}
                                />
                            )}
                        </form.Field>
                        <form.Field name="dateOfBirth">
                            {(field) => (
                                <TextField
                                    field={field}
                                    label="Data de Nascimento"
                                    inputMode="numeric"
                                    autoComplete="bday"
                                    placeholder="DD/MM/AAAA"
                                    attempts={submissionAttempts}
                                    format={formatDateOfBirthInput}
                                    icon={BirthdayCakeIcon}
                                />
                            )}
                        </form.Field>
                    </div>
                    <form.Field name="address">
                        {(field) => (
                            <TextField
                                field={field}
                                label="Endereço"
                                placeholder="Ex: Rua das Flores, 123"
                                autoComplete="street-address"
                                attempts={submissionAttempts}
                                icon={Location01Icon}
                            />
                        )}
                    </form.Field>

                    <SeparatorSection title="Permissões" />

                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                        <form.Field name="role">
                            {(field) => (
                                <ChoiceField
                                    field={field}
                                    label="Papel"
                                    attempts={submissionAttempts}
                                    options={userRoles.map((role) => ({
                                        value: role,
                                        label: userRoleLabels[role],
                                    }))}
                                    onChange={(value) => {
                                        if (isUserRole(value)) {
                                            field.handleChange(value);
                                        }
                                    }}
                                    icon={StarAward02Icon}
                                />
                            )}
                        </form.Field>

                        <form.Field name="permission">
                            {(field) => (
                                <ChoiceField
                                    field={field}
                                    label="Permissão"
                                    attempts={submissionAttempts}
                                    options={userPermissions.map((permission) => ({
                                        value: permission,
                                        label: userPermissionLabels[permission],
                                    }))}
                                    onChange={(value) => {
                                        if (isUserPermission(value)) {
                                            field.handleChange(value);
                                        }
                                    }}
                                    icon={Key01Icon}
                                />
                            )}
                        </form.Field>
                    </div>

                    <form.Field name="access">
                        {(field) => (
                            <AccessField field={field} attempts={submissionAttempts} />
                        )}
                    </form.Field>

                    {canChangePassword ? (
                        <>
                            <SeparatorSection title="Zona de Perigo" />

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="font-bold"
                                    disabled={isPending}
                                    onClick={onRequestPasswordChange}
                                >
                                    <HugeiconsIcon icon={SquareLock01Icon} strokeWidth={2.5} className="size-5" />
                                    Alterar Senha
                                </Button>
                                {canDelete ? (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="font-bold"
                                        disabled={isPending}
                                        onClick={onRequestDelete}
                                    >
                                        <HugeiconsIcon icon={UserRemove01Icon} strokeWidth={2.5} className="size-5" />
                                        Excluir Membro
                                    </Button>
                                ) : null}
                            </div>
                        </>
                    ) : null}

                </FieldGroup>
            </form>
            {surface === "dialog" ? (
                <DialogFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
                    <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
                        Cancelar
                    </DialogClose>
                    <Button
                        type="submit"
                        form="member-form"
                        loading={isPending}
                        loadingText="Salvando"
                    >
                        Salvar
                    </Button>
                </DialogFooter>
            ) : (
                <DrawerFooter>
                    <Button
                        type="submit"
                        form="member-form"
                        loading={isPending}
                        loadingText="Salvando"
                    >
                        Salvar
                    </Button>
                    <DrawerClose render={<Button type="button" variant="outline" disabled={isPending} />}>
                        Cancelar
                    </DrawerClose>
                </DrawerFooter>
            )}
        </>
    );
}

function TextField({
    field,
    label,
    attempts,
    format,
    icon,
    serverError,
    onEdit,
    ...inputProps
}: {
    field: MemberFieldApi<string>;
    label: string;
    attempts: number;
    format?: (value: string) => string;
    icon?: IconSvgElement;
    serverError?: string;
    onEdit?: () => void;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "onBlur" | "id" | "name">) {
    const errors = [
        ...visibleErrors(field, attempts),
        ...(serverError ? [{ message: serverError }] : []),
    ];
    const invalid = errors.length > 0;

    return (
        <Field data-invalid={invalid || undefined}>
            <div className="flex items-center gap-2">
                {icon && <HugeiconsIcon icon={icon} strokeWidth={2} className="pointer-events-none size-4" />}
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            </div>
            <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                    const nextValue = format ? format(event.target.value) : event.target.value;
                    field.handleChange(nextValue);
                    onEdit?.();
                }}
                aria-invalid={invalid || undefined}
                {...inputProps}
            />
            <FieldError errors={errors} />
        </Field>
    );
}

function AccessField({
    field,
    attempts,
}: {
    field: MemberFieldApi<UserAccess>;
    attempts: number;
}) {
    const errors = visibleErrors(field, attempts);
    const invalid = errors.length > 0;

    return (
        <Field className="w-fit" data-invalid={invalid || undefined}>
            <div className="flex justify-between gap-4">
                <FieldContent>
                    <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={PowerIcon} strokeWidth={2} className="pointer-events-none size-4" />
                        <FieldLabel htmlFor={field.name}>Status do Usuário</FieldLabel>
                    </div>
                    <FieldDescription>{userAccessLabels[field.state.value]}</FieldDescription>
                </FieldContent>
                <Switch
                    id={field.name}
                    className="data-checked:bg-emerald-600"
                    checked={field.state.value === "active"}
                    onCheckedChange={(checked) => {
                        field.handleChange(checked ? "active" : "inactive");
                    }}
                    onBlur={field.handleBlur}
                    aria-invalid={invalid || undefined}
                />
            </div>
            <FieldError errors={errors} />
        </Field>
    );
}

function ChoiceField({
    field,
    label,
    attempts,
    options,
    onChange,
    icon,
}: {
    field: ChoiceFieldApi;
    label: string;
    attempts: number;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string | null) => void;
    icon?: IconSvgElement;
}) {
    const errors = visibleErrors(field, attempts);
    const invalid = errors.length > 0;

    return (
        <Field data-invalid={invalid || undefined}>
            <div className="flex items-center gap-2">
                {icon && <HugeiconsIcon icon={icon} strokeWidth={2} className="pointer-events-none size-4" />}
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            </div>
            <Select value={field.state.value} items={options} onValueChange={onChange}>
                <SelectTrigger
                    id={field.name}
                    className="text-base"
                    aria-invalid={invalid || undefined}
                    onBlur={field.handleBlur}
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <FieldError errors={errors} />
        </Field>
    );
}

type MemberFieldState = {
    name: string;
    state: {
        value: string;
        meta: {
            isTouched: boolean;
            errors: ReadonlyArray<unknown>;
        };
    };
    handleBlur: () => void;
};

type MemberFieldApi<TValue extends string> = MemberFieldState & {
    state: MemberFieldState["state"] & {
        value: TValue;
    };
    handleChange: (value: TValue) => void;
};

type ChoiceFieldApi = MemberFieldState;

function visibleErrors(field: MemberFieldState, attempts: number) {
    const visible = field.state.meta.isTouched || attempts > 0;

    if (!visible) {
        return [];
    }

    return field.state.meta.errors.flatMap((error) => {
        if (typeof error === "string" && error.length > 0) {
            return [{ message: error }];
        }

        if (
            error
            && typeof error === "object"
            && "message" in error
            && typeof error.message === "string"
            && error.message.length > 0
        ) {
            return [{ message: error.message }];
        }

        return [];
    });
}

function toFormValues(member: Member): MemberFormValues {
    return {
        name: member.name,
        cpf: member.cpf,
        email: member.email,
        contact: member.contact,
        address: member.address,
        dateOfBirth: member.dateOfBirth,
        role: member.role,
        access: member.access,
        permission: member.permission,
    };
}

function isUserRole(value: string | null): value is UserRole {
    return userRoles.some((role) => role === value);
}

function isUserPermission(value: string | null): value is UserPermission {
    return userPermissions.some((permission) => permission === value);
}
