"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { useAction } from "next-safe-action/hooks";
import {
    createBeneficiaryAction,
    deleteBeneficiaryAction,
    updateBeneficiaryAction,
} from "@/app/(sistema)/beneficiarios/action";
import { AssistantLinker } from "@/app/(sistema)/beneficiarios/_components/assistant-linker";
import {
    beneficiaryFormSchema,
    emptyBeneficiaryFormValues,
    emptyFamilyMemberFormValues,
    type BeneficiaryFormValues,
    type FamilyMemberFormValues,
} from "@/app/(sistema)/beneficiarios/schema";
import SeparatorSection from "@/components/separator-section";
import { AdminPasswordDialog } from "@/components/shared/admin-password-dialog";
import { ResultDialog } from "@/components/shared/result-dialog";
import { SystemDialog } from "@/components/shared/system-dialog";
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
import { cn } from "@/lib/utils";
import { formatContact } from "@/lib/validate-contact";
import { formatCpf, normalizeCpf } from "@/lib/validate-cpf";
import { formatDateOfBirthInput } from "@/lib/validate-date-of-birth";
import { takenCpfDigits } from "@/services/beneficiary/beneficiary.type";
import {
    aidTypeLabels,
    aidTypes,
    beneficiaryGenderLabels,
    beneficiaryGenders,
    beneficiaryStatusLabels,
    beneficiaryStatuses,
    brazilianStates,
    employmentLabels,
    employments,
    isKinshipAllowed,
    kinshipLabel,
    kinshipOptionsForGender,
    maritalStatusLabels,
    maritalStatuses,
    type BeneficiaryAssistantRecord,
    type BeneficiaryRecord,
} from "@/services/beneficiary/beneficiary.type";
import {
    Add01Icon,
    BirthdayCakeIcon,
    Call02Icon,
    Cancel01Icon,
    IdCardIcon,
    Location01Icon,
    Mail02Icon,
    UserCircleIcon,
    UserRemove01Icon,
    VenusAndMarsIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

const CPF_TAKEN_FIELD_MESSAGE = "Alguém já possui este CPF!";

type BeneficiaryDrawerProps = {
    open: boolean;
    beneficiary: BeneficiaryRecord | null;
    assistants: BeneficiaryAssistantRecord[];
    onOpenChange: (open: boolean) => void;
    onSaved: (message: string) => void;
    onDeleted: () => void;
};

export function BeneficiaryDrawer({
    open,
    beneficiary,
    assistants,
    onOpenChange,
    onSaved,
    onDeleted,
}: BeneficiaryDrawerProps) {
    const router = useRouter();
    const isMobile = useIsMobile();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const { executeAsync: removeBeneficiary } = useAction(deleteBeneficiaryAction);
    const title = beneficiary ? "Editar Beneficiário" : "Adicionar Beneficiário";
    const description = beneficiary
        ? "Atualize os dados do titular e dos membros da família."
        : "Preencha os dados do titular e, se houver, dos membros da família.";

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            setConfirmOpen(false);
            setPasswordOpen(false);
        }

        onOpenChange(nextOpen);
    }

    function handleDeleted() {
        setConfirmOpen(false);
        setPasswordOpen(false);
        onOpenChange(false);
        setSuccessOpen(true);
        onDeleted();
        router.refresh();
    }

    const form = (
        <BeneficiaryForm
            key={beneficiary?.id ?? "new"}
            beneficiary={beneficiary}
            assistants={assistants}
            surface={isMobile ? "drawer" : "dialog"}
            onRequestDelete={() => setConfirmOpen(true)}
            onSaved={onSaved}
        />
    );

    const dialogs = (
        <>
            <SystemDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                variant="destructive"
                title="Excluir beneficiário"
                description="Tem certeza disso? Esta ação exclui o titular e os membros da família."
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                setConfirmOpen(false);
                                setPasswordOpen(true);
                            }}
                        >
                            Confirmar
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col gap-2">
                    <p className="mb-2 text-xl font-bold">Tem certeza disso?</p>
                    <p className="text-muted-foreground">
                        Esta ação exclui o titular e os membros da família. Não é possível desfazer.
                    </p>
                </div>
            </SystemDialog>
            <AdminPasswordDialog
                open={passwordOpen}
                onOpenChange={setPasswordOpen}
                onConfirm={async (password) => {
                    if (!beneficiary) {
                        return { ok: false, message: "Beneficiário inválido." };
                    }

                    const result = await removeBeneficiary({ id: beneficiary.id, password });

                    if (result?.serverError) {
                        return { ok: false, message: result.serverError };
                    }

                    if (result?.validationErrors) {
                        return { ok: false, message: "A senha deve ter pelo menos 8 caracteres." };
                    }

                    if (!result?.data?.ok) {
                        return {
                            ok: false,
                            message: result?.data?.message ?? "Não foi possível excluir o beneficiário.",
                        };
                    }

                    return { ok: true };
                }}
                onSuccess={handleDeleted}
            />
            <ResultDialog
                status="success"
                open={successOpen}
                onOpenChange={setSuccessOpen}
                title="Deu certo!"
                subtitle="Beneficiário excluído com sucesso."
            />
        </>
    );

    if (isMobile) {
        return (
            <>
                <Drawer
                    open={open}
                    onOpenChange={handleOpenChange}
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
                {dialogs}
            </>
        );
    }

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={handleOpenChange}
                disablePointerDismissal
            >
                <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(64rem,calc(100%-2rem))]">
                    <DialogHeader className="shrink-0 px-6 pt-6 pr-14">
                        <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    {form}
                </DialogContent>
            </Dialog>
            {dialogs}
        </>
    );
}

function BeneficiaryForm({
    beneficiary,
    assistants,
    surface,
    onRequestDelete,
    onSaved,
}: {
    beneficiary: BeneficiaryRecord | null;
    assistants: BeneficiaryAssistantRecord[];
    surface: "drawer" | "dialog";
    onRequestDelete: () => void;
    onSaved: (message: string) => void;
}) {
    const [takenCpf, setTakenCpf] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    function showActionError(message: string) {
        if (message.startsWith("Este CPF já está em uso.")) {
            setTakenCpf(takenCpfDigits(message) ?? "*");
            return;
        }

        setTakenCpf(null);
        setSaveError(message);
    }

    const { execute: createBeneficiary, isPending: isCreating } = useAction(createBeneficiaryAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                showActionError(data.message);
                return;
            }

            onSaved(data.message ?? "Beneficiário adicionado com sucesso.");
        },
        onError: ({ error }) => {
            setSaveError(error.serverError ?? "Não foi possível adicionar o beneficiário.");
        },
    });
    const { execute: updateBeneficiary, isPending: isUpdating } = useAction(updateBeneficiaryAction, {
        onSuccess: ({ data }) => {
            if (!data.ok) {
                showActionError(data.message);
                return;
            }

            onSaved(data.message ?? "Beneficiário atualizado com sucesso.");
        },
        onError: ({ error }) => {
            setSaveError(error.serverError ?? "Não foi possível editar o beneficiário.");
        },
    });
    const isPending = isCreating || isUpdating;
    const form = useForm({
        defaultValues: beneficiary ? toFormValues(beneficiary) : createEmptyBeneficiary(),
        validators: {
            onSubmit: beneficiaryFormSchema,
        },
        onSubmit: ({ value }) => {
            if (beneficiary) {
                updateBeneficiary({ id: beneficiary.id, ...value });
                return;
            }

            createBeneficiary(value);
        },
    });
    const submissionAttempts = useStore(form.store, (state) => state.submissionAttempts);
    const employment = useStore(form.store, (state) => state.values.employment);
    const members = useStore(form.store, (state) => state.values.members);

    return (
        <>
            <form
                id="beneficiary-form"
                className={surface === "dialog" ? "min-h-0 flex-1 overflow-y-auto px-6 py-4" : "min-h-0 flex-1 overflow-y-auto px-4 py-4"}
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    form.handleSubmit();
                }}
            >
                <FieldGroup>
                    <SeparatorSection title="Titular" />
                    <form.Field name="name">
                        {(field) => (
                            <TextField
                                field={field}
                                label="Nome Completo"
                                autoComplete="name"
                                placeholder="Ex: João da Silva"
                                attempts={submissionAttempts}
                                icon={UserCircleIcon}
                                required
                            />
                        )}
                    </form.Field>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                    serverError={cpfFieldError(field.state.value, takenCpf)}
                                    onEdit={() => setTakenCpf((current) => current === normalizeCpf(field.state.value) || current === "*" ? null : current)}
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
                                />
                            )}
                        </form.Field>
                    </div>
                    <form.Field name="contacts" mode="array">
                        {(field) => (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-3">
                                    <FieldLabel required>Contatos</FieldLabel>
                                    <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
                                        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                                        Adicionar contato
                                    </Button>
                                </div>
                                {field.state.value.map((_, index) => (
                                    <form.Field key={index} name={`contacts[${index}]`}>
                                        {(contactField) => (
                                            <div className="flex items-start gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <TextField
                                                        field={contactField}
                                                        label={`Contato ${index + 1}`}
                                                        inputMode="tel"
                                                        autoComplete="tel"
                                                        placeholder="(00) 00000-0000"
                                                        attempts={submissionAttempts}
                                                        format={formatContact}
                                                        icon={Call02Icon}
                                                        required
                                                    />
                                                </div>
                                                {field.state.value.length > 1 ? (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="mt-8 text-muted-foreground"
                                                        aria-label={`Remover contato ${index + 1}`}
                                                        onClick={() => field.removeValue(index)}
                                                    >
                                                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                                                    </Button>
                                                ) : null}
                                            </div>
                                        )}
                                    </form.Field>
                                ))}
                                <ArrayFieldError field={field} attempts={submissionAttempts} />
                            </div>
                        )}
                    </form.Field>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                                    required
                                />
                            )}
                        </form.Field>
                        <form.Field name="gender">
                            {(field) => (
                                <ChoiceField
                                    field={field}
                                    label="Gênero"
                                    attempts={submissionAttempts}
                                    placeholder="Selecione"
                                    required
                                    options={beneficiaryGenders.map((gender) => ({
                                        value: gender,
                                        label: beneficiaryGenderLabels[gender],
                                    }))}
                                    onChange={(value) => field.handleChange(value ?? "")}
                                    icon={VenusAndMarsIcon}
                                />
                            )}
                        </form.Field>
                        <form.Field name="maritalStatus">
                            {(field) => (
                                <ChoiceField
                                    field={field}
                                    label="Estado Civil"
                                    attempts={submissionAttempts}
                                    placeholder="Selecione"
                                    required
                                    options={maritalStatuses.map((status) => ({
                                        value: status,
                                        label: maritalStatusLabels[status],
                                    }))}
                                    onChange={(value) => field.handleChange(value ?? "")}
                                />
                            )}
                        </form.Field>
                    </div>
                    <SeparatorSection title="Endereço" />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <form.Field name="street">
                            {(field) => (
                                <TextField
                                    field={field}
                                    label="Rua"
                                    autoComplete="street-address"
                                    placeholder="Ex: Rua das Flores, 123"
                                    attempts={submissionAttempts}
                                    icon={Location01Icon}
                                    required
                                />
                            )}
                        </form.Field>
                        <form.Field name="neighborhood">
                            {(field) => (
                                <TextField
                                    field={field}
                                    label="Bairro"
                                    placeholder="Ex: Centro"
                                    attempts={submissionAttempts}
                                    required
                                />
                            )}
                        </form.Field>
                        <form.Field name="city">
                            {(field) => (
                                <TextField
                                    field={field}
                                    label="Cidade"
                                    placeholder="Ex: São Paulo"
                                    attempts={submissionAttempts}
                                    required
                                />
                            )}
                        </form.Field>
                        <form.Field name="state">
                            {(field) => (
                                <ChoiceField
                                    field={field}
                                    label="UF"
                                    attempts={submissionAttempts}
                                    placeholder="Selecione"
                                    required
                                    options={brazilianStates.map((state) => ({
                                        value: state,
                                        label: state,
                                    }))}
                                    onChange={(value) => field.handleChange(value ?? "")}
                                />
                            )}
                        </form.Field>
                    </div>
                    <SeparatorSection title="Trabalho e assistência" />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <form.Field name="employment">
                            {(field) => (
                                <ChoiceField
                                    field={field}
                                    label="Trabalho"
                                    attempts={submissionAttempts}
                                    placeholder="Selecione"
                                    required
                                    options={employments.map((item) => ({
                                        value: item,
                                        label: employmentLabels[item],
                                    }))}
                                    onChange={(value) => {
                                        const next = value ?? "";
                                        field.handleChange(next);

                                        if (next !== "employed") {
                                            form.setFieldValue("profession", "");
                                        }
                                    }}
                                />
                            )}
                        </form.Field>
                        {employment === "employed" ? (
                            <form.Field name="profession">
                                {(field) => (
                                    <TextField
                                        field={field}
                                        label="Profissão"
                                        placeholder="Ex: Costureira"
                                        attempts={submissionAttempts}
                                        required
                                    />
                                )}
                            </form.Field>
                        ) : null}
                        <form.Field name="status">
                            {(field) => (
                                <ChoiceField
                                    field={field}
                                    label="Situação"
                                    attempts={submissionAttempts}
                                    placeholder="Selecione"
                                    required
                                    options={beneficiaryStatuses.map((status) => ({
                                        value: status,
                                        label: beneficiaryStatusLabels[status],
                                    }))}
                                    onChange={(value) => field.handleChange(value ?? "")}
                                />
                            )}
                        </form.Field>
                        <form.Field name="aidType">
                            {(field) => (
                                <ChoiceField
                                    field={field}
                                    label="Tipo de Auxílio"
                                    attempts={submissionAttempts}
                                    placeholder="Selecione"
                                    required
                                    options={aidTypes.map((aidType) => ({
                                        value: aidType,
                                        label: aidTypeLabels[aidType],
                                    }))}
                                    onChange={(value) => field.handleChange(value ?? "")}
                                />
                            )}
                        </form.Field>
                    </div>
                    <form.Field name="notes">
                        {(field) => (
                            <NotesField field={field} attempts={submissionAttempts} />
                        )}
                    </form.Field>

                    <SeparatorSection title="Membros da Família" />
                    <form.Field name="members" mode="array">
                        {(field) => (
                            <div className="flex flex-col gap-4">
                                {field.state.value.map((member, index) => {
                                    const current = members[index] ?? member;
                                    const kinshipOptions = kinshipOptionsForGender(current.gender).map((kinship) => ({
                                        value: kinship,
                                        label: kinshipLabel(kinship, current.gender),
                                    }));

                                    return (
                                        <div key={member.id || index} className="flex flex-col gap-4 rounded-2xl border p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="font-medium">Familiar {index + 1}</p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="text-muted-foreground"
                                                    onClick={() => field.removeValue(index)}
                                                >
                                                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                                                    Remover
                                                </Button>
                                            </div>
                                            <form.Field name={`members[${index}].name`}>
                                                {(nameField) => (
                                                    <TextField
                                                        field={nameField}
                                                        label="Nome Completo"
                                                        placeholder="Ex: Maria da Silva"
                                                        attempts={submissionAttempts}
                                                        icon={UserCircleIcon}
                                                        required
                                                    />
                                                )}
                                            </form.Field>
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <form.Field name={`members[${index}].gender`}>
                                                    {(genderField) => (
                                                        <ChoiceField
                                                            field={genderField}
                                                            label="Gênero"
                                                            attempts={submissionAttempts}
                                                            placeholder="Não informado"
                                                            options={optionalOptions(beneficiaryGenders.map((gender) => ({
                                                                value: gender,
                                                                label: beneficiaryGenderLabels[gender],
                                                            })))}
                                                            onChange={(value) => {
                                                                const nextGender = value ?? "";
                                                                const kinship = isKinshipAllowed(current.kinship, nextGender)
                                                                    ? current.kinship
                                                                    : "";
                                                                field.replaceValue(index, {
                                                                    ...current,
                                                                    gender: nextGender,
                                                                    kinship,
                                                                });
                                                            }}
                                                            icon={VenusAndMarsIcon}
                                                        />
                                                    )}
                                                </form.Field>
                                                <form.Field name={`members[${index}].kinship`}>
                                                    {(kinshipField) => (
                                                        <ChoiceField
                                                            field={kinshipField}
                                                            label="Vínculo"
                                                            attempts={submissionAttempts}
                                                            placeholder="Selecione"
                                                            required
                                                            options={kinshipOptions}
                                                            onChange={(value) => kinshipField.handleChange(value ?? "")}
                                                        />
                                                    )}
                                                </form.Field>
                                            </div>
                                            <FamilyMemberFields
                                                form={form}
                                                index={index}
                                                attempts={submissionAttempts}
                                                takenCpf={takenCpf}
                                                onEditCpf={(value) => {
                                                    setTakenCpf((cpf) => cpf === normalizeCpf(value) || cpf === "*" ? null : cpf);
                                                }}
                                                member={current}
                                                membersField={field}
                                            />
                                        </div>
                                    );
                                })}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => field.pushValue(createEmptyFamilyMember())}
                                >
                                    <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                                    Adicionar familiar
                                </Button>
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="assistantIds">
                        {(field) => (
                            <AssistantLinker
                                assistants={assistants}
                                selectedIds={field.state.value}
                                onChange={field.handleChange}
                            />
                        )}
                    </form.Field>

                    {beneficiary ? (
                        <>
                            <SeparatorSection title="Zona de Perigo" />
                            <Button
                                type="button"
                                variant="destructive"
                                className="w-fit font-bold"
                                disabled={isPending}
                                onClick={onRequestDelete}
                            >
                                <HugeiconsIcon icon={UserRemove01Icon} strokeWidth={2.5} className="size-5" />
                                Excluir Beneficiário
                            </Button>
                        </>
                    ) : null}
                </FieldGroup>
            </form>
            {surface === "dialog" ? (
                <DialogFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
                    <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
                        Cancelar
                    </DialogClose>
                    <Button type="submit" form="beneficiary-form" loading={isPending} loadingText="Salvando">
                        Salvar
                    </Button>
                </DialogFooter>
            ) : (
                <DrawerFooter>
                    <Button type="submit" form="beneficiary-form" loading={isPending} loadingText="Salvando">
                        Salvar
                    </Button>
                    <DrawerClose render={<Button type="button" variant="outline" disabled={isPending} />}>
                        Cancelar
                    </DrawerClose>
                </DrawerFooter>
            )}
            <ResultDialog
                status="warning"
                open={saveError !== null}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setSaveError(null);
                    }
                }}
                title="Não foi possível salvar"
                subtitle={saveError ?? ""}
            />
        </>
    );
}

function useBeneficiaryFormShape() {
    return useForm({
        defaultValues: createEmptyBeneficiary(),
        validators: {
            onSubmit: beneficiaryFormSchema,
        },
        onSubmit: () => undefined,
    });
}

type BeneficiaryFormApi = ReturnType<typeof useBeneficiaryFormShape>;

void useBeneficiaryFormShape;

function FamilyMemberFields({
    form,
    index,
    attempts,
    takenCpf,
    onEditCpf,
    member,
    membersField,
}: {
    form: BeneficiaryFormApi;
    index: number;
    attempts: number;
    takenCpf: string | null;
    onEditCpf: (value: string) => void;
    member: FamilyMemberFormValues;
    membersField: {
        replaceValue: (index: number, value: FamilyMemberFormValues) => void;
    };
}) {
    return (
        <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <form.Field name={`members[${index}].cpf`}>
                    {(field) => (
                        <TextField
                            field={field}
                            label="CPF"
                            inputMode="numeric"
                            placeholder="000.000.000-00"
                            attempts={attempts}
                            format={formatCpf}
                            icon={IdCardIcon}
                            serverError={cpfFieldError(field.state.value, takenCpf)}
                            onEdit={() => onEditCpf(field.state.value)}
                        />
                    )}
                </form.Field>
                <form.Field name={`members[${index}].email`}>
                    {(field) => (
                        <TextField
                            field={field}
                            label="E-mail"
                            type="email"
                            placeholder="exemplo@email.com"
                            attempts={attempts}
                            icon={Mail02Icon}
                        />
                    )}
                </form.Field>
            </div>
            <form.Field name={`members[${index}].contacts`} mode="array">
                {(field) => (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                            <FieldLabel>Contatos</FieldLabel>
                            <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
                                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                                Adicionar contato
                            </Button>
                        </div>
                        {field.state.value.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhum contato informado.</p>
                        ) : null}
                        {field.state.value.map((_, contactIndex) => (
                            <form.Field key={contactIndex} name={`members[${index}].contacts[${contactIndex}]`}>
                                {(contactField) => (
                                    <div className="flex items-start gap-2">
                                        <div className="min-w-0 flex-1">
                                            <TextField
                                                field={contactField}
                                                label={`Contato ${contactIndex + 1}`}
                                                inputMode="tel"
                                                placeholder="(00) 00000-0000"
                                                attempts={attempts}
                                                format={formatContact}
                                                icon={Call02Icon}
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="mt-8 text-muted-foreground"
                                            aria-label={`Remover contato ${contactIndex + 1}`}
                                            onClick={() => field.removeValue(contactIndex)}
                                        >
                                            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                                        </Button>
                                    </div>
                                )}
                            </form.Field>
                        ))}
                        <ArrayFieldError field={field} attempts={attempts} />
                    </div>
                )}
            </form.Field>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <form.Field name={`members[${index}].dateOfBirth`}>
                    {(field) => (
                        <TextField
                            field={field}
                            label="Data de Nascimento"
                            inputMode="numeric"
                            placeholder="DD/MM/AAAA"
                            attempts={attempts}
                            format={formatDateOfBirthInput}
                            icon={BirthdayCakeIcon}
                        />
                    )}
                </form.Field>
                <form.Field name={`members[${index}].maritalStatus`}>
                    {(field) => (
                        <ChoiceField
                            field={field}
                            label="Estado Civil"
                            attempts={attempts}
                            placeholder="Não informado"
                            options={optionalOptions(maritalStatuses.map((status) => ({
                                value: status,
                                label: maritalStatusLabels[status],
                            })))}
                            onChange={(value) => field.handleChange(value ?? "")}
                        />
                    )}
                </form.Field>
                <form.Field name={`members[${index}].employment`}>
                    {(field) => (
                        <ChoiceField
                            field={field}
                            label="Trabalho"
                            attempts={attempts}
                            placeholder="Não informado"
                            options={optionalOptions(employments.map((item) => ({
                                value: item,
                                label: employmentLabels[item],
                            })))}
                            onChange={(value) => {
                                const next = value ?? "";
                                membersField.replaceValue(index, {
                                    ...member,
                                    employment: next,
                                    profession: next === "employed" ? member.profession : "",
                                });
                            }}
                        />
                    )}
                </form.Field>
            </div>
            {member.employment === "employed" ? (
                <form.Field name={`members[${index}].profession`}>
                    {(field) => (
                        <TextField
                            field={field}
                            label="Profissão"
                            placeholder="Ex: Pedreiro"
                            attempts={attempts}
                            required
                        />
                    )}
                </form.Field>
            ) : null}
            <SeparatorSection title="Endereço do familiar" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <form.Field name={`members[${index}].street`}>
                    {(field) => (
                        <TextField field={field} label="Rua" placeholder="Ex: Rua das Flores, 123" attempts={attempts} icon={Location01Icon} />
                    )}
                </form.Field>
                <form.Field name={`members[${index}].neighborhood`}>
                    {(field) => (
                        <TextField field={field} label="Bairro" placeholder="Ex: Centro" attempts={attempts} />
                    )}
                </form.Field>
                <form.Field name={`members[${index}].city`}>
                    {(field) => (
                        <TextField field={field} label="Cidade" placeholder="Ex: São Paulo" attempts={attempts} />
                    )}
                </form.Field>
                <form.Field name={`members[${index}].state`}>
                    {(field) => (
                        <ChoiceField
                            field={field}
                            label="UF"
                            attempts={attempts}
                            placeholder="Não informado"
                            options={optionalOptions(brazilianStates.map((state) => ({ value: state, label: state })))}
                            onChange={(value) => field.handleChange(value ?? "")}
                        />
                    )}
                </form.Field>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <form.Field name={`members[${index}].status`}>
                    {(field) => (
                        <ChoiceField
                            field={field}
                            label="Situação"
                            attempts={attempts}
                            placeholder="Não informado"
                            options={optionalOptions(beneficiaryStatuses.map((status) => ({
                                value: status,
                                label: beneficiaryStatusLabels[status],
                            })))}
                            onChange={(value) => field.handleChange(value ?? "")}
                        />
                    )}
                </form.Field>
                <form.Field name={`members[${index}].aidType`}>
                    {(field) => (
                        <ChoiceField
                            field={field}
                            label="Tipo de Auxílio"
                            attempts={attempts}
                            placeholder="Não informado"
                            options={optionalOptions(aidTypes.map((aidType) => ({
                                value: aidType,
                                label: aidTypeLabels[aidType],
                            })))}
                            onChange={(value) => field.handleChange(value ?? "")}
                        />
                    )}
                </form.Field>
            </div>
            <form.Field name={`members[${index}].notes`}>
                {(field) => (
                    <NotesField field={field} attempts={attempts} />
                )}
            </form.Field>
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
    required = false,
    ...inputProps
}: {
    field: TextFieldApi;
    label: string;
    attempts: number;
    format?: (value: string) => string;
    icon?: IconSvgElement;
    serverError?: string;
    onEdit?: () => void;
    required?: boolean;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "onBlur" | "id" | "name">) {
    const errors = [
        ...visibleErrors(field, attempts),
        ...(serverError ? [{ message: serverError }] : []),
    ];
    const invalid = errors.length > 0;

    return (
        <Field data-invalid={invalid || undefined}>
            <div className="flex items-center gap-2">
                {icon ? <HugeiconsIcon icon={icon} strokeWidth={2} className="pointer-events-none size-4" /> : null}
                <FieldLabel htmlFor={field.name} required={required}>{label}</FieldLabel>
            </div>
            <Input
                id={field.name}
                name={field.name}
                required={required}
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

function NotesField({
    field,
    attempts,
}: {
    field: TextFieldApi;
    attempts: number;
}) {
    const errors = visibleErrors(field, attempts);
    const invalid = errors.length > 0;

    return (
        <Field data-invalid={invalid || undefined}>
            <FieldLabel htmlFor={field.name}>Observações</FieldLabel>
            <textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                rows={4}
                maxLength={2000}
                placeholder="Anotações sobre o atendimento"
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={invalid || undefined}
                className={cn(
                    "w-full min-w-0 rounded-2xl border border-input bg-input/30 px-5 py-3 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
                )}
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
    placeholder,
    icon,
    required = false,
}: {
    field: TextFieldApi;
    label: string;
    attempts: number;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string | null) => void;
    placeholder: string;
    icon?: IconSvgElement;
    required?: boolean;
}) {
    const errors = visibleErrors(field, attempts);
    const invalid = errors.length > 0;

    return (
        <Field data-invalid={invalid || undefined}>
            <div className="flex items-center gap-2">
                {icon ? <HugeiconsIcon icon={icon} strokeWidth={2} className="pointer-events-none size-4" /> : null}
                <FieldLabel htmlFor={field.name} required={required}>{label}</FieldLabel>
            </div>
            <Select value={field.state.value === "" ? null : field.state.value} items={options} onValueChange={onChange}>
                <SelectTrigger id={field.name} className="text-base" aria-required={required || undefined} aria-invalid={invalid || undefined} onBlur={field.handleBlur}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value || "empty"} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <FieldError errors={errors} />
        </Field>
    );
}

function ArrayFieldError({
    field,
    attempts,
}: {
    field: {
        state: {
            meta: {
                isTouched: boolean;
                errors: ReadonlyArray<unknown>;
            };
        };
    };
    attempts: number;
}) {
    const errors = visibleErrors(field, attempts).filter((error) => error.message !== "Contato repetido.");

    if (errors.length === 0) {
        return null;
    }

    return <FieldError errors={errors} />;
}

type TextFieldApi = {
    name: string;
    state: {
        value: string;
        meta: {
            isTouched: boolean;
            errors: ReadonlyArray<unknown>;
        };
    };
    handleBlur: () => void;
    handleChange: (value: string) => void;
};

function visibleErrors(field: {
    state: {
        meta: {
            isTouched: boolean;
            errors: ReadonlyArray<unknown>;
        };
    };
}, attempts: number) {
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

function optionalOptions(options: Array<{ value: string; label: string }>) {
    return [{ value: "", label: "Não informado" }, ...options];
}

function cpfFieldError(value: string, takenCpf: string | null) {
    if (!takenCpf) {
        return undefined;
    }

    const digits = normalizeCpf(value);

    if (digits.length !== 11) {
        return undefined;
    }

    if (takenCpf === "*" || takenCpf === digits) {
        return CPF_TAKEN_FIELD_MESSAGE;
    }

    return undefined;
}

function createEmptyBeneficiary(): BeneficiaryFormValues {
    return {
        ...emptyBeneficiaryFormValues,
        contacts: [""],
        members: [],
    };
}

function createEmptyFamilyMember(): FamilyMemberFormValues {
    return {
        ...emptyFamilyMemberFormValues,
        contacts: [],
    };
}

function toFormValues(beneficiary: BeneficiaryRecord): BeneficiaryFormValues {
    return {
        name: beneficiary.name,
        cpf: beneficiary.cpf,
        street: beneficiary.street,
        neighborhood: beneficiary.neighborhood,
        city: beneficiary.city,
        state: beneficiary.state,
        email: beneficiary.email,
        contacts: beneficiary.contacts.length > 0 ? beneficiary.contacts : [""],
        dateOfBirth: beneficiary.dateOfBirth,
        gender: beneficiary.gender,
        maritalStatus: beneficiary.maritalStatus,
        employment: beneficiary.employment,
        profession: beneficiary.profession,
        notes: beneficiary.notes,
        status: beneficiary.status,
        aidType: beneficiary.aidType,
        members: beneficiary.members.map((member) => ({
            id: member.id,
            name: member.name,
            kinship: member.kinship,
            cpf: member.cpf,
            street: member.street,
            neighborhood: member.neighborhood,
            city: member.city,
            state: member.state,
            email: member.email,
            contacts: member.contacts,
            dateOfBirth: member.dateOfBirth,
            gender: member.gender,
            maritalStatus: member.maritalStatus,
            employment: member.employment,
            profession: member.profession,
            notes: member.notes,
            status: member.status,
            aidType: member.aidType,
        })),
        assistantIds: beneficiary.assistants.map((assistant) => assistant.id),
    };
}
