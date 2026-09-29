import { z } from "zod";

import { isValidContact } from "@/lib/validate-contact";
import { isValidCpf } from "@/lib/validate-cpf";
import { isBirthDateInputValid } from "@/lib/validate-date-of-birth";
import {
    userAccesses,
    userPermissions,
    userRoles,
} from "@/services/user/user.type";

export const memberFormSchema = z.object({
    name: z.string().trim().min(2, "Informe o nome."),
    cpf: z.string().trim().refine(isValidCpf, "Informe um CPF válido."),
    email: z.email("Informe um e-mail válido."),
    contact: z.string().trim().refine(isValidContact, "Informe um contato com DDD."),
    address: z.string().trim().min(5, "Informe o endereço."),
    dateOfBirth: z
        .string()
        .trim()
        .refine(isBirthDateInputValid, "Informe uma data válida no formato DD/MM/AAAA."),
    role: z.enum(userRoles, "Selecione o papel."),
    access: z.enum(userAccesses, "Selecione o acesso."),
    permission: z.enum(userPermissions, "Selecione a permissão."),
});

export const updateMemberSchema = memberFormSchema.extend({
    id: z.string().min(1, "Membro inválido."),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;
export type UpdateMemberValues = z.infer<typeof updateMemberSchema>;
