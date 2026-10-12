"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useAction } from "next-safe-action/hooks";

import { createMemberAction, updateMemberAction } from "@/app/(sistema)/membros/action";
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
    const title = member ? "Editar Membro" : "Adicionar Membro";
    const description = member
        ? "Atualize os dados e o acesso deste membro."
        : "Preencha os dados para criar o acesso do membro.";
    const form = (
        <MemberForm
            key={member?.id ?? "new"}
            member={member}
            surface={isMobile ? "drawer" : "dialog"}
            onCreated={onCreated}
            onUpdated={onUpdated}
        />
    );

    if (isMobile) {
        return (
            <Drawer
                open={open}
                onOpenChange={onOpenChange}
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
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(64rem,calc(100%-2rem))]">
                <DialogHeader className="shrink-0 px-6 pt-6 pr-14">
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {form}
            </DialogContent>
        </Dialog>
    );
}

function MemberForm({
    member,
    surface,
    onCreated,
    onUpdated,
}: {
    member: Member | null;
    surface: "drawer" | "dialog";
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
                    </div>
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
                            <AccessField field={field} attempts={submissionAttempts} />
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
        <Field data-invalid={invalid || undefined}>
            <div className="flex items-center justify-between gap-4">
                <FieldContent>
                    <FieldLabel htmlFor={field.name}>Acesso</FieldLabel>
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
            <Select value={field.state.value} items={options} onValueChange={onChange}>
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

function isUserPermission(value: string | null): value is UserPermission {
    return userPermissions.some((permission) => permission === value);
}
