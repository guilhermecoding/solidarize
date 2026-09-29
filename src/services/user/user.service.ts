import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

import { serverFailure, serverSuccess, type ServerFailure, type ServerResponse } from "@/@types/server-response";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatContact, normalizeContact } from "@/lib/validate-contact";
import { formatCpf, normalizeCpf } from "@/lib/validate-cpf";
import {
    formatDateOfBirth,
    isBirthDateInputValid,
    parseBrazilianDate,
} from "@/lib/validate-date-of-birth";
import type {
    Member,
    MemberActor,
    MemberCredentials,
    MemberInput,
    UpdateMemberInput,
    UserAccess,
    UserPermission,
    UserRole,
} from "@/services/user/user.type";

export const USER_CACHE_TAG = "users";

const PASSWORD_LENGTH = 12;
const PASSWORD_LOWER = "abcdefghijkmnopqrstuvwxyz";
const PASSWORD_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const PASSWORD_DIGITS = "23456789";
const PASSWORD_SYMBOLS = "!@#$%&*";
const PASSWORD_ALL = `${PASSWORD_LOWER}${PASSWORD_UPPER}${PASSWORD_DIGITS}${PASSWORD_SYMBOLS}`;

type MemberRecord = {
    id: string;
    name: string;
    email: string;
    cpf: string;
    contact: string;
    dateOfBirth: Date;
    address: string | null;
    role: string | null;
    banned: boolean | null;
    banExpires: Date | null;
    permission: string;
};

const memberSelect = {
    id: true,
    name: true,
    email: true,
    cpf: true,
    contact: true,
    dateOfBirth: true,
    address: true,
    role: true,
    banned: true,
    banExpires: true,
    permission: true,
} as const;

export async function listMembers(): Promise<Member[]> {
    "use cache";
    cacheTag(USER_CACHE_TAG);
    cacheLife("minutes");

    const users = await prisma.user.findMany({
        select: memberSelect,
        orderBy: { name: "asc" },
    });

    return users.map(toMember);
}

export async function createMember(
    input: MemberInput,
): Promise<ServerResponse<MemberCredentials>> {
    const prepared = prepareMemberInput(input);

    if (!prepared.ok) {
        return prepared;
    }

    const emailOwner = await findEmailOwner(prepared.email);

    if (emailOwner) {
        return serverFailure("Este e-mail já está em uso.");
    }

    const cpfOwner = await findCpfOwner(prepared.cpf);

    if (cpfOwner) {
        return serverFailure("Este CPF já está em uso.");
    }

    const password = generatePassword();
    const requestHeaders = await headers();

    try {
        const created = await auth.api.createUser({
            body: {
                email: prepared.email,
                password,
                name: prepared.name,
                role: prepared.role,
                data: {
                    cpf: prepared.cpf,
                    contact: prepared.contact,
                    dateOfBirth: prepared.dateOfBirth,
                    address: prepared.address,
                    permission: prepared.permission,
                },
            },
            headers: requestHeaders,
        });

        if (prepared.access === "inactive") {
            try {
                await auth.api.banUser({
                    body: {
                        userId: created.user.id,
                        banReason: "Acesso inativo",
                    },
                    headers: requestHeaders,
                });
            } catch (error) {
                if (error instanceof APIError) {
                    return serverSuccess(
                        { email: prepared.email, password },
                        "Membro adicionado, mas o acesso não pôde ser desativado.",
                    );
                }

                throw error;
            }
        }
    } catch (error) {
        if (error instanceof APIError) {
            return authFailure(error, "Não foi possível adicionar o membro.");
        }

        throw error;
    }

    return serverSuccess(
        { email: prepared.email, password },
        "Membro adicionado com sucesso.",
    );
}

export async function updateMember(
    actor: MemberActor,
    input: UpdateMemberInput,
): Promise<ServerResponse> {
    const current = await prisma.user.findUnique({
        where: { id: input.id },
        select: memberSelect,
    });

    if (!current) {
        return serverFailure("Membro não encontrado.");
    }

    const prepared = prepareMemberInput(input);

    if (!prepared.ok) {
        return prepared;
    }

    const selfEditError = getSelfEditError(actor, current.id, prepared);

    if (selfEditError) {
        return serverFailure(selfEditError);
    }

    const emailOwner = await findEmailOwner(prepared.email);

    if (emailOwner && emailOwner.id !== current.id) {
        return serverFailure("Este e-mail já está em uso.");
    }

    const cpfOwner = await findCpfOwner(prepared.cpf);

    if (cpfOwner && cpfOwner.id !== current.id) {
        return serverFailure("Este CPF já está em uso.");
    }

    if (current.role === "admin" && prepared.role !== "admin") {
        const otherAdmins = await prisma.user.count({
            where: {
                role: "admin",
                id: { not: current.id },
            },
        });

        if (otherAdmins === 0) {
            return serverFailure("É necessário manter ao menos um administrador.");
        }
    }

    const requestHeaders = await headers();
    const currentMember = toMember(current);

    try {
        await auth.api.adminUpdateUser({
            body: {
                userId: current.id,
                data: {
                    name: prepared.name,
                    email: prepared.email,
                    cpf: prepared.cpf,
                    contact: prepared.contact,
                    dateOfBirth: prepared.dateOfBirth,
                    address: prepared.address,
                    permission: prepared.permission,
                },
            },
            headers: requestHeaders,
        });

        if (currentMember.role !== prepared.role) {
            await auth.api.setRole({
                body: {
                    userId: current.id,
                    role: prepared.role,
                },
                headers: requestHeaders,
            });
        }

        if (currentMember.access !== prepared.access) {
            if (prepared.access === "inactive") {
                await auth.api.banUser({
                    body: {
                        userId: current.id,
                        banReason: "Acesso inativo",
                    },
                    headers: requestHeaders,
                });
            } else {
                await auth.api.unbanUser({
                    body: {
                        userId: current.id,
                    },
                    headers: requestHeaders,
                });
            }
        }
    } catch (error) {
        if (error instanceof APIError) {
            return authFailure(error, "Não foi possível editar o membro.");
        }

        throw error;
    }

    return serverSuccess(undefined, "Membro atualizado com sucesso.");
}

function generatePassword(): string {
    const required = [
        randomChar(PASSWORD_LOWER),
        randomChar(PASSWORD_UPPER),
        randomChar(PASSWORD_DIGITS),
        randomChar(PASSWORD_SYMBOLS),
    ];
    const rest = Array.from(
        { length: PASSWORD_LENGTH - required.length },
        () => randomChar(PASSWORD_ALL),
    );
    const chars = [...required, ...rest];

    for (let index = chars.length - 1; index > 0; index -= 1) {
        const swapIndex = randomIndex(index + 1);
        const current = chars[index];
        chars[index] = chars[swapIndex] ?? current;
        chars[swapIndex] = current;
    }

    return chars.join("");
}

function randomChar(charset: string): string {
    return charset[randomIndex(charset.length)] ?? charset[0] ?? "a";
}

function randomIndex(length: number): number {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return (values[0] ?? 0) % length;
}

type PreparedMember = {
    ok: true;
    name: string;
    email: string;
    cpf: string;
    contact: string;
    address: string;
    dateOfBirth: Date;
    role: UserRole;
    access: UserAccess;
    permission: UserPermission;
};

function prepareMemberInput(input: MemberInput): PreparedMember | ServerFailure {
    const dateOfBirth = parseBrazilianDate(input.dateOfBirth);

    if (!dateOfBirth || !isBirthDateInputValid(input.dateOfBirth)) {
        return serverFailure("Informe uma data de nascimento válida.");
    }

    return {
        ok: true,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        cpf: normalizeCpf(input.cpf),
        contact: normalizeContact(input.contact),
        address: input.address.trim(),
        dateOfBirth,
        role: input.role,
        access: input.access,
        permission: input.permission,
    };
}

function getSelfEditError(
    actor: MemberActor,
    memberId: string,
    input: PreparedMember,
): string | null {
    if (actor.id !== memberId) {
        return null;
    }

    if (input.access === "inactive") {
        return "Você não pode desativar o próprio acesso.";
    }

    if (input.role !== "admin") {
        return "Você não pode alterar o próprio papel.";
    }

    if (input.permission !== "full") {
        return "Você não pode remover a própria permissão total.";
    }

    return null;
}

function findEmailOwner(email: string) {
    return prisma.user.findFirst({
        where: {
            email: {
                equals: email,
                mode: "insensitive",
            },
        },
        select: { id: true },
    });
}

function findCpfOwner(cpf: string) {
    return prisma.user.findUnique({
        where: { cpf },
        select: { id: true },
    });
}

function toMember(user: MemberRecord): Member {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: formatCpf(user.cpf),
        contact: formatContact(user.contact),
        address: user.address ?? "",
        dateOfBirth: formatDateOfBirth(user.dateOfBirth),
        role: user.role === "admin" ? "admin" : "member",
        access: toAccess(user.banned, user.banExpires),
        permission: user.permission === "full" ? "full" : "read",
    };
}

function toAccess(banned: boolean | null, banExpires: Date | null): UserAccess {
    if (!banned) {
        return "active";
    }

    if (banExpires && banExpires.getTime() <= Date.now()) {
        return "active";
    }

    return "inactive";
}

function authFailure(error: APIError, fallback: string): ServerFailure {
    const code = readErrorCode(error);

    if (code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
        return serverFailure("Este e-mail já está em uso.");
    }

    if (error.status === 403) {
        return serverFailure("Você não tem permissão para esta ação.");
    }

    return serverFailure(fallback);
}

function readErrorCode(error: APIError): string | null {
    const body = error.body;

    if (!body || typeof body !== "object" || !("code" in body)) {
        return null;
    }

    return typeof body.code === "string" ? body.code : null;
}
