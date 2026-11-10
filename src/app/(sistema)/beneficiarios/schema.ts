import { z } from "zod";

import { isValidContact, normalizeContact } from "@/lib/validate-contact";
import { isValidCpf, normalizeCpf } from "@/lib/validate-cpf";
import { isBirthDateInputValid } from "@/lib/validate-date-of-birth";
import {
    aidTypes,
    beneficiaryGenders,
    beneficiaryStatuses,
    brazilianStates,
    employments,
    isKinshipAllowed,
    maritalStatuses,
    type BeneficiaryInput,
} from "@/services/beneficiary/beneficiary.type";

const contactSchema = z
    .string()
    .trim()
    .refine(isValidContact, "Informe um contato no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.");

const optionalCpfSchema = z
    .string()
    .trim()
    .refine((value) => value === "" || isValidCpf(value), "Informe um CPF válido.");

const optionalEmailSchema = z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, "Informe um e-mail válido.");

const optionalBirthDateSchema = z
    .string()
    .trim()
    .refine(
        (value) => value === "" || isBirthDateInputValid(value),
        "Informe uma data válida no formato DD/MM/AAAA.",
    );

const notesSchema = z
    .string()
    .trim()
    .max(2000, "As observações devem ter no máximo 2000 caracteres.");

function optionalPlace(message: string) {
    return z.string().trim().refine((value) => value === "" || value.length >= 2, message);
}

function optionalChoice(values: readonly string[], message: string) {
    return z.string().trim().refine((value) => value === "" || values.includes(value), message);
}

function requiredChoice(values: readonly string[], message: string) {
    return z.string().trim().refine((value) => values.includes(value), message);
}

function contactListSchema(required: boolean) {
    const list = z.array(contactSchema).superRefine((contacts, ctx) => {
        const seen = new Set<string>();

        contacts.forEach((contact, index) => {
            const digits = normalizeContact(contact);

            if (seen.has(digits)) {
                ctx.addIssue({
                    code: "custom",
                    message: "Contato repetido.",
                    path: [index],
                });
                return;
            }

            seen.add(digits);
        });
    });

    return required ? list.min(1, "Informe ao menos um contato.") : list;
}

export const familyMemberFormSchema = z.object({
    id: z.string().trim(),
    name: z.string().trim().min(2, "Informe o nome."),
    kinship: z.string().trim(),
    cpf: optionalCpfSchema,
    street: optionalPlace("Informe a rua."),
    neighborhood: optionalPlace("Informe o bairro."),
    city: optionalPlace("Informe a cidade."),
    state: optionalChoice(brazilianStates, "Selecione a UF."),
    email: optionalEmailSchema,
    contacts: contactListSchema(false),
    dateOfBirth: optionalBirthDateSchema,
    gender: optionalChoice(beneficiaryGenders, "Selecione o gênero."),
    maritalStatus: optionalChoice(maritalStatuses, "Selecione o estado civil."),
    employment: optionalChoice(employments, "Selecione a situação de trabalho."),
    profession: z.string().trim(),
    notes: notesSchema,
    status: optionalChoice(beneficiaryStatuses, "Selecione a situação."),
    aidType: optionalChoice(aidTypes, "Selecione o tipo de auxílio."),
});

export const beneficiaryFormSchema = z.object({
    name: z.string().trim().min(2, "Informe o nome."),
    cpf: optionalCpfSchema,
    street: z.string().trim().min(2, "Informe a rua."),
    neighborhood: z.string().trim().min(2, "Informe o bairro."),
    city: z.string().trim().min(2, "Informe a cidade."),
    state: requiredChoice(brazilianStates, "Selecione a UF."),
    email: optionalEmailSchema,
    contacts: contactListSchema(true),
    dateOfBirth: z
        .string()
        .trim()
        .refine(isBirthDateInputValid, "Informe uma data válida no formato DD/MM/AAAA."),
    gender: requiredChoice(beneficiaryGenders, "Selecione o gênero."),
    maritalStatus: requiredChoice(maritalStatuses, "Selecione o estado civil."),
    employment: requiredChoice(employments, "Selecione a situação de trabalho."),
    profession: z.string().trim(),
    notes: notesSchema,
    status: requiredChoice(beneficiaryStatuses, "Selecione a situação."),
    aidType: requiredChoice(aidTypes, "Selecione o tipo de auxílio."),
    members: z.array(familyMemberFormSchema),
}).superRefine((value, ctx) => {
    if (value.employment === "employed" && value.profession.length < 2) {
        ctx.addIssue({
            code: "custom",
            message: "Informe a profissão.",
            path: ["profession"],
        });
    }

    const cpfPaths = new Map<string, Array<Array<string | number>>>();
    const titularCpf = normalizeCpf(value.cpf);

    if (titularCpf) {
        cpfPaths.set(titularCpf, [["cpf"]]);
    }

    value.members.forEach((member, index) => {
        if (member.employment === "employed" && member.profession.length < 2) {
            ctx.addIssue({
                code: "custom",
                message: "Informe a profissão.",
                path: ["members", index, "profession"],
            });
        }

        if (!isKinshipAllowed(member.kinship, member.gender)) {
            ctx.addIssue({
                code: "custom",
                message: "Selecione o vínculo.",
                path: ["members", index, "kinship"],
            });
        }

        const cpf = normalizeCpf(member.cpf);

        if (!cpf) {
            return;
        }

        const paths = cpfPaths.get(cpf);

        if (paths) {
            ctx.addIssue({
                code: "custom",
                message: "Este CPF está repetido no cadastro.",
                path: ["members", index, "cpf"],
            });

            for (const path of paths) {
                ctx.addIssue({
                    code: "custom",
                    message: "Este CPF está repetido no cadastro.",
                    path,
                });
            }

            paths.push(["members", index, "cpf"]);
            return;
        }

        cpfPaths.set(cpf, [["members", index, "cpf"]]);
    });
});

export const updateBeneficiarySchema = beneficiaryFormSchema.extend({
    id: z.string().min(1, "Beneficiário inválido."),
});

export const searchBeneficiariesSchema = z.object({
    query: z.string().trim().min(1).max(120),
});

export const deleteBeneficiarySchema = z.object({
    id: z.string().min(1, "Beneficiário inválido."),
});

export type BeneficiaryFormValues = z.infer<typeof beneficiaryFormSchema>;
export type FamilyMemberFormValues = z.infer<typeof familyMemberFormSchema>;
export type UpdateBeneficiaryValues = z.infer<typeof updateBeneficiarySchema>;

export const emptyFamilyMemberFormValues: FamilyMemberFormValues = {
    id: "",
    name: "",
    kinship: "",
    cpf: "",
    street: "",
    neighborhood: "",
    city: "",
    state: "",
    email: "",
    contacts: [],
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    employment: "",
    profession: "",
    notes: "",
    status: "",
    aidType: "",
};

export const emptyBeneficiaryFormValues: BeneficiaryFormValues = {
    name: "",
    cpf: "",
    street: "",
    neighborhood: "",
    city: "",
    state: "",
    email: "",
    contacts: [""],
    dateOfBirth: "",
    gender: "unspecified",
    maritalStatus: "",
    employment: "",
    profession: "",
    notes: "",
    status: "",
    aidType: "",
    members: [],
};

export function toBeneficiaryInput(value: BeneficiaryFormValues): BeneficiaryInput {
    return value;
}
