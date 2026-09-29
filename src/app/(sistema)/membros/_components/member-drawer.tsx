"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useAction } from "next-safe-action/hooks";

import { createMemberAction, updateMemberAction } from "@/app/(sistema)/membros/action";
import { notify } from "@/app/(sistema)/membros/_components/notify";
import { memberFormSchema, type MemberFormValues } from "@/app/(sistema)/membros/schema";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatContact } from "@/lib/validate-contact";
import { formatCpf } from "@/lib/validate-cpf";
import { formatDateOfBirthInput } from "@/lib/validate-date-of-birth";
import {
    userAccesses,
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
    onOpenChange: (open: boolean) => void;
    onCreated: (credentials: MemberCredentials, message: string) => void;
    onUpdated: (message: string) => void;
};

export function MemberDrawer({
    open,
    member,
    onOpenChange,
    onCreated,
    onUpdated,
}: MemberDrawerProps) {
    const isMobile = useIsMobile();

    return (
        <Drawer
            key={isMobile ? "mobile" : "desktop"}
            open={open}
            onOpenChange={onOpenChange}
            swipeDirection={isMobile ? "down" : "right"}
            snapPoints={isMobile ? [1] : undefined}
            showSwipeHandle={isMobile}
        >
            <DrawerContent
                className={isMobile ? "rounded-none" : undefined}
                style={isMobile ? {
                    "--drawer-content-height": "100dvh",
                    "--drawer-content-max-height": "100dvh",
                    "--drawer-inset": "0px",
                } as React.CSSProperties : undefined}
            >
                <DrawerHeader>
                    <DrawerTitle>{member ? "Editar membro" : "Adicionar membro"}</DrawerTitle>
                    <DrawerDescription>
                        {member
                            ? "Atualize os dados e o acesso deste membro."
                            : "Preencha os dados para criar o acesso do membro."}
                    </DrawerDescription>
                </DrawerHeader>
                <MemberForm
                    key={member?.id ?? "new"}
                    member={member}
                    onCreated={onCreated}
                    onUpdated={onUpdated}
                />
            </DrawerContent>
        </Drawer>
    );
}

function MemberForm({
    member,
    onCreated,
    onUpdated,
}: {
    member: Member | null;
    onCreated: (credentials: MemberCredentials, message: string) => void;
    onUpdated: (message: string) => void;
}) {
    const { execute: createMember, isPending: isCreating } = useAction(createMemberAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                notify("error", data.message);
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
                notify("error", data.message);
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
                className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
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
                                label="Nome"
                                autoComplete="name"
                                attempts={submissionAttempts}
                            />
                        )}
                    </form.Field>
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
                                attempts={submissionAttempts}
                            />
                        )}
                    </form.Field>
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
                            />
                        )}
                    </form.Field>
                    <form.Field name="address">
                        {(field) => (
                            <TextField
                                field={field}
                                label="Endereço"
                                autoComplete="street-address"
                                attempts={submissionAttempts}
                            />
                        )}
                    </form.Field>
                    <form.Field name="dateOfBirth">
                        {(field) => (
                            <TextField
                                field={field}
                                label="Data de nascimento"
                                inputMode="numeric"
                                autoComplete="bday"
                                placeholder="DD/MM/AAAA"
                                attempts={submissionAttempts}
                                format={formatDateOfBirthInput}
                            />
                        )}
                    </form.Field>
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
                            />
                        )}
                    </form.Field>
                    <form.Field name="access">
                        {(field) => (
                            <ChoiceField
                                field={field}
                                label="Acesso"
                                attempts={submissionAttempts}
                                options={userAccesses.map((access) => ({
                                    value: access,
                                    label: userAccessLabels[access],
                                }))}
                                onChange={(value) => {
                                    if (isUserAccess(value)) {
                                        field.handleChange(value);
                                    }
                                }}
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
                            />
                        )}
                    </form.Field>
                </FieldGroup>
            </form>
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
        </>
    );
}

function TextField({
    field,
    label,
    attempts,
    format,
    ...inputProps
}: {
    field: MemberFieldApi<string>;
    label: string;
    attempts: number;
    format?: (value: string) => string;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "onBlur" | "id" | "name">) {
    const errors = visibleErrors(field, attempts);
    const invalid = errors.length > 0;

    return (
        <Field data-invalid={invalid || undefined}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                    const nextValue = format ? format(event.target.value) : event.target.value;
                    field.handleChange(nextValue);
                }}
                aria-invalid={invalid || undefined}
                {...inputProps}
            />
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
}: {
    field: ChoiceFieldApi;
    label: string;
    attempts: number;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string | null) => void;
}) {
    const errors = visibleErrors(field, attempts);
    const invalid = errors.length > 0;

    return (
        <Field data-invalid={invalid || undefined}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <Select value={field.state.value} onValueChange={onChange}>
                <SelectTrigger
                    id={field.name}
                    className="h-12 w-full rounded-2xl px-5 text-base"
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

function isUserAccess(value: string | null): value is UserAccess {
    return userAccesses.some((access) => access === value);
}

function isUserPermission(value: string | null): value is UserPermission {
    return userPermissions.some((permission) => permission === value);
}
