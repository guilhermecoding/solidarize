import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

import { serverFailure, serverSuccess, type ServerFailure, type ServerResponse } from "@/@types/server-response";
import { Prisma } from "@/generated/prisma/client";
import { beneficiaryFormSchema } from "@/app/(sistema)/beneficiarios/schema";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatContact, normalizeContact } from "@/lib/validate-contact";
import { formatCpf, normalizeCpf } from "@/lib/validate-cpf";
import { formatDateOfBirth, parseBrazilianDate } from "@/lib/validate-date-of-birth";
import {
    formatAge,
    isAidType,
    isBeneficiaryGender,
    isBeneficiaryStatus,
    isBrazilianState,
    isEmployment,
    isKinship,
    isMaritalStatus,
    kinshipLabel,
    cpfTakenMessage,
    CPF_TAKEN_MESSAGE,
    type AidType,
    type BeneficiaryGender,
    type BeneficiaryInput,
    type BeneficiaryRecord,
    type BeneficiaryStatus,
    type Employment,
    type FamilyMemberRecord,
    type Kinship,
    type MaritalStatus,
    type UpdateBeneficiaryInput,
} from "@/services/beneficiary/beneficiary.type";

export const BENEFICIARY_CACHE_TAG = "beneficiaries";

const LIKE_ESCAPE = "\\";

const beneficiaryInclude = {
    contacts: {
        orderBy: { position: "asc" },
    },
    members: {
        orderBy: { name: "asc" },
        include: {
            contacts: {
                orderBy: { position: "asc" },
            },
        },
    },
} satisfies Prisma.BeneficiaryInclude;

type BeneficiaryRow = Prisma.BeneficiaryGetPayload<{ include: typeof beneficiaryInclude }>;
type FamilyMemberRow = BeneficiaryRow["members"][number];

type PreparedContact = {
    phone: string;
    position: number;
};

type PreparedMember = {
    id: string | null;
    name: string;
    kinship: Kinship;
    cpf: string | null;
    street: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    email: string | null;
    dateOfBirth: Date | null;
    gender: BeneficiaryGender | null;
    maritalStatus: MaritalStatus | null;
    employment: Employment | null;
    profession: string | null;
    notes: string | null;
    status: BeneficiaryStatus | null;
    aidType: AidType | null;
    contacts: PreparedContact[];
};

type PreparedBeneficiary = {
    ok: true;
    name: string;
    cpf: string | null;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    email: string | null;
    dateOfBirth: Date;
    gender: BeneficiaryGender;
    maritalStatus: MaritalStatus;
    employment: Employment;
    profession: string | null;
    notes: string | null;
    status: BeneficiaryStatus;
    aidType: AidType;
    contacts: PreparedContact[];
    members: PreparedMember[];
};

type CpfReader = {
    beneficiary: {
        findFirst: typeof prisma.beneficiary.findFirst;
    };
    familyMember: {
        findFirst: typeof prisma.familyMember.findFirst;
    };
};

export async function listBeneficiaries(): Promise<BeneficiaryRecord[]> {
    "use cache";
    cacheTag(BENEFICIARY_CACHE_TAG);
    cacheLife("minutes");

    const beneficiaries = await prisma.beneficiary.findMany({
        include: beneficiaryInclude,
        orderBy: { name: "asc" },
    });

    return beneficiaries.map(toBeneficiary);
}

export async function searchBeneficiaries(query: string): Promise<BeneficiaryRecord[]> {
    "use cache";
    cacheTag(BENEFICIARY_CACHE_TAG);
    cacheLife("minutes");

    const nameWords = query.match(/\p{L}+/gu) ?? [];
    const digits = query.replace(/\D/g, "");

    if (nameWords.length === 0 && digits.length === 0) {
        return [];
    }

    const beneficiaryName = nameWords.length > 0
        ? Prisma.sql`(${Prisma.join(nameWords.map((word) => nameLike("b.name", word)), " AND ")})`
        : Prisma.sql`FALSE`;
    const memberName = nameWords.length > 0
        ? Prisma.sql`EXISTS (
            SELECT 1
            FROM "public"."family_member" m
            WHERE m."beneficiaryId" = b.id
            AND (${Prisma.join(nameWords.map((word) => nameLike("m.name", word)), " AND ")})
        )`
        : Prisma.sql`FALSE`;
    const beneficiaryCpf = digits.length > 0
        ? Prisma.sql`b.cpf LIKE ${`%${escapeLike(digits)}%`} ESCAPE ${LIKE_ESCAPE}`
        : Prisma.sql`FALSE`;
    const memberCpf = digits.length > 0
        ? Prisma.sql`EXISTS (
            SELECT 1
            FROM "public"."family_member" m
            WHERE m."beneficiaryId" = b.id
            AND m.cpf LIKE ${`%${escapeLike(digits)}%`} ESCAPE ${LIKE_ESCAPE}
        )`
        : Prisma.sql`FALSE`;

    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT b.id
        FROM "public"."beneficiary" b
        WHERE (${beneficiaryName} OR ${memberName} OR ${beneficiaryCpf} OR ${memberCpf})
        ORDER BY b.name ASC
    `;

    if (rows.length === 0) {
        return [];
    }

    const beneficiaries = await prisma.beneficiary.findMany({
        where: { id: { in: rows.map((row) => row.id) } },
        include: beneficiaryInclude,
        orderBy: { name: "asc" },
    });

    return beneficiaries.map(toBeneficiary);
}

export async function getBeneficiary(id: string): Promise<BeneficiaryRecord | null> {
    "use cache";
    cacheTag(BENEFICIARY_CACHE_TAG);
    cacheLife("minutes");

    const beneficiary = await prisma.beneficiary.findUnique({
        where: { id },
        include: beneficiaryInclude,
    });

    return beneficiary ? toBeneficiary(beneficiary) : null;
}

export async function createBeneficiary(
    input: BeneficiaryInput,
): Promise<ServerResponse<{ id: string }>> {
    const prepared = prepareBeneficiary(input);

    if (!prepared.ok) {
        return prepared;
    }

    try {
        const created = await prisma.$transaction(async (tx) => {
            const taken = await findTakenCpf(tx, prepared, {});

            if (taken) {
                return { type: "cpf" as const, cpf: taken };
            }

            const beneficiary = await tx.beneficiary.create({
                data: {
                    ...beneficiaryData(prepared),
                    contacts: { create: prepared.contacts },
                    members: {
                        create: prepared.members.map(memberCreateData),
                    },
                },
                select: { id: true },
            });

            return { type: "ok" as const, id: beneficiary.id };
        });

        if (created.type === "cpf") {
            return serverFailure(cpfTakenMessage(created.cpf));
        }

        return serverSuccess({ id: created.id }, "Beneficiário adicionado com sucesso.");
    } catch (error) {
        const taken = uniqueCpfFailure(error);

        if (taken) {
            return taken;
        }

        throw error;
    }
}

export async function updateBeneficiary(
    input: UpdateBeneficiaryInput,
): Promise<ServerResponse> {
    const prepared = prepareBeneficiary(input);

    if (!prepared.ok) {
        return prepared;
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const current = await tx.beneficiary.findUnique({
                where: { id: input.id },
                select: { id: true },
            });

            if (!current) {
                return { type: "missing" } as const;
            }

            const existingMembers = await tx.familyMember.findMany({
                where: { beneficiaryId: input.id },
                select: { id: true },
            });
            const existingIds = new Set(existingMembers.map((member) => member.id));
            const unknownMember = prepared.members.find((member) => member.id && !existingIds.has(member.id));

            if (unknownMember) {
                return { type: "invalid-member" } as const;
            }

            const taken = await findTakenCpf(tx, prepared, {
                beneficiaryId: input.id,
                familyMemberIds: new Set(
                    prepared.members.flatMap((member) => member.id ? [member.id] : []),
                ),
            });

            if (taken) {
                return { type: "cpf", cpf: taken } as const;
            }

            await tx.beneficiary.update({
                where: { id: input.id },
                data: beneficiaryData(prepared),
            });
            await tx.beneficiaryContact.deleteMany({
                where: { beneficiaryId: input.id },
            });

            if (prepared.contacts.length > 0) {
                await tx.beneficiaryContact.createMany({
                    data: prepared.contacts.map((contact) => ({
                        ...contact,
                        beneficiaryId: input.id,
                    })),
                });
            }

            const keptIds = prepared.members.flatMap((member) => member.id ? [member.id] : []);

            await tx.familyMember.deleteMany({
                where: {
                    beneficiaryId: input.id,
                    id: { notIn: keptIds },
                },
            });

            for (const member of prepared.members) {
                const memberId = member.id;

                if (memberId) {
                    await tx.familyMember.update({
                        where: { id: memberId },
                        data: memberData(member),
                    });
                    await tx.familyMemberContact.deleteMany({
                        where: { familyMemberId: memberId },
                    });

                    if (member.contacts.length > 0) {
                        await tx.familyMemberContact.createMany({
                            data: member.contacts.map((contact) => ({
                                ...contact,
                                familyMemberId: memberId,
                            })),
                        });
                    }

                    continue;
                }

                await tx.familyMember.create({
                    data: {
                        beneficiaryId: input.id,
                        ...memberCreateData(member),
                    },
                });
            }

            return { type: "ok" } as const;
        });

        if (result.type === "missing") {
            return serverFailure("Beneficiário não encontrado.");
        }

        if (result.type === "invalid-member") {
            return serverFailure("Membro da família inválido.");
        }

        if (result.type === "cpf") {
            return serverFailure(cpfTakenMessage(result.cpf));
        }

        return serverSuccess(undefined, "Beneficiário atualizado com sucesso!");
    } catch (error) {
        const taken = uniqueCpfFailure(error);

        if (taken) {
            return taken;
        }

        throw error;
    }
}

export async function deleteBeneficiary(id: string, password: string): Promise<ServerResponse> {
    const requestHeaders = await headers();

    try {
        await auth.api.verifyPassword({
            body: { password },
            headers: requestHeaders,
        });
    } catch (error) {
        if (error instanceof APIError) {
            if (readErrorCode(error) === "INVALID_PASSWORD") {
                return serverFailure("Senha incorreta.");
            }

            return serverFailure("Não foi possível confirmar a senha.");
        }

        throw error;
    }

    const current = await prisma.beneficiary.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!current) {
        return serverFailure("Beneficiário não encontrado.");
    }

    await prisma.beneficiary.delete({
        where: { id },
    });

    return serverSuccess(undefined, "Beneficiário excluído com sucesso.");
}

function prepareBeneficiary(input: BeneficiaryInput): PreparedBeneficiary | ServerFailure {
    const parsed = beneficiaryFormSchema.safeParse(input);

    if (!parsed.success) {
        return serverFailure(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    const value = parsed.data;
    const dateOfBirth = parseBrazilianDate(value.dateOfBirth);
    const gender = isBeneficiaryGender(value.gender) ? value.gender : null;
    const maritalStatus = isMaritalStatus(value.maritalStatus) ? value.maritalStatus : null;
    const employment = isEmployment(value.employment) ? value.employment : null;
    const status = isBeneficiaryStatus(value.status) ? value.status : null;
    const aidType = isAidType(value.aidType) ? value.aidType : null;

    if (!dateOfBirth || !gender || !maritalStatus || !employment || !status || !aidType || !isBrazilianState(value.state)) {
        return serverFailure("Dados inválidos.");
    }

    const prepared: PreparedBeneficiary = {
        ok: true,
        name: value.name.trim(),
        cpf: emptyToNull(normalizeCpf(value.cpf)),
        street: value.street.trim(),
        neighborhood: value.neighborhood.trim(),
        city: value.city.trim(),
        state: value.state,
        email: emptyEmail(value.email),
        dateOfBirth,
        gender,
        maritalStatus,
        employment,
        profession: employment === "employed" ? value.profession.trim() : null,
        notes: emptyToNull(value.notes),
        status,
        aidType,
        contacts: toContacts(value.contacts),
        members: [],
    };

    for (const member of value.members) {
        if (!isKinship(member.kinship)) {
            return serverFailure("Selecione o vínculo.");
        }

        const dateOfBirth = member.dateOfBirth.trim() === "" ? null : parseBrazilianDate(member.dateOfBirth);

        if (member.dateOfBirth.trim() !== "" && !dateOfBirth) {
            return serverFailure("Informe uma data válida no formato DD/MM/AAAA.");
        }

        const memberEmployment = isEmployment(member.employment) ? member.employment : null;

        prepared.members.push({
            id: member.id.trim() === "" ? null : member.id.trim(),
            name: member.name.trim(),
            kinship: member.kinship,
            cpf: emptyToNull(normalizeCpf(member.cpf)),
            street: emptyToNull(member.street),
            neighborhood: emptyToNull(member.neighborhood),
            city: emptyToNull(member.city),
            state: isBrazilianState(member.state) ? member.state : null,
            email: emptyEmail(member.email),
            dateOfBirth,
            gender: isBeneficiaryGender(member.gender) ? member.gender : null,
            maritalStatus: isMaritalStatus(member.maritalStatus) ? member.maritalStatus : null,
            employment: memberEmployment,
            profession: memberEmployment === "employed" ? emptyToNull(member.profession) : null,
            notes: emptyToNull(member.notes),
            status: isBeneficiaryStatus(member.status) ? member.status : null,
            aidType: isAidType(member.aidType) ? member.aidType : null,
            contacts: toContacts(member.contacts),
        });
    }

    return prepared;
}

function beneficiaryData(prepared: PreparedBeneficiary) {
    return {
        name: prepared.name,
        cpf: prepared.cpf,
        street: prepared.street,
        neighborhood: prepared.neighborhood,
        city: prepared.city,
        state: prepared.state,
        email: prepared.email,
        dateOfBirth: prepared.dateOfBirth,
        gender: prepared.gender,
        maritalStatus: prepared.maritalStatus,
        employment: prepared.employment,
        profession: prepared.profession,
        notes: prepared.notes,
        status: prepared.status,
        aidType: prepared.aidType,
    };
}

function memberData(member: PreparedMember) {
    return {
        name: member.name,
        kinship: member.kinship,
        cpf: member.cpf,
        street: member.street,
        neighborhood: member.neighborhood,
        city: member.city,
        state: member.state,
        email: member.email,
        dateOfBirth: member.dateOfBirth,
        gender: member.gender,
        maritalStatus: member.maritalStatus,
        employment: member.employment,
        profession: member.profession,
        notes: member.notes,
        status: member.status,
        aidType: member.aidType,
    };
}

function memberCreateData(member: PreparedMember) {
    return {
        ...memberData(member),
        contacts: { create: member.contacts },
    };
}

async function findTakenCpf(
    db: CpfReader,
    prepared: PreparedBeneficiary,
    ignore: { beneficiaryId?: string; familyMemberIds?: Set<string> },
): Promise<string | null> {
    if (prepared.cpf) {
        const taken = await cpfExists(db, prepared.cpf, {
            beneficiaryId: ignore.beneficiaryId,
        });

        if (taken) {
            return prepared.cpf;
        }
    }

    for (const member of prepared.members) {
        if (!member.cpf) {
            continue;
        }

        const taken = await cpfExists(db, member.cpf, {
            familyMemberId: member.id && ignore.familyMemberIds?.has(member.id) ? member.id : undefined,
        });

        if (taken) {
            return member.cpf;
        }
    }

    return null;
}

async function cpfExists(
    db: CpfReader,
    cpf: string,
    ignore: { beneficiaryId?: string; familyMemberId?: string },
): Promise<boolean> {
    const beneficiary = await db.beneficiary.findFirst({
        where: {
            cpf,
            ...(ignore.beneficiaryId ? { id: { not: ignore.beneficiaryId } } : {}),
        },
        select: { id: true },
    });

    if (beneficiary) {
        return true;
    }

    const member = await db.familyMember.findFirst({
        where: {
            cpf,
            ...(ignore.familyMemberId ? { id: { not: ignore.familyMemberId } } : {}),
        },
        select: { id: true },
    });

    return member !== null;
}

function toBeneficiary(row: BeneficiaryRow): BeneficiaryRecord {
    const gender = isBeneficiaryGender(row.gender) ? row.gender : "unspecified";
    const maritalStatus = isMaritalStatus(row.maritalStatus) ? row.maritalStatus : "single";
    const employment = isEmployment(row.employment) ? row.employment : "unemployed";
    const status = isBeneficiaryStatus(row.status) ? row.status : "rejected";
    const aidType = isAidType(row.aidType) ? row.aidType : "other";

    return {
        id: row.id,
        name: row.name,
        cpf: row.cpf ? formatCpf(row.cpf) : "",
        street: row.street,
        neighborhood: row.neighborhood,
        city: row.city,
        state: row.state,
        email: row.email ?? "",
        contacts: row.contacts.map((contact) => formatContact(contact.phone)),
        dateOfBirth: formatDateOfBirth(row.dateOfBirth),
        ageLabel: formatAge(row.dateOfBirth),
        gender,
        maritalStatus,
        employment,
        profession: row.profession ?? "",
        notes: row.notes ?? "",
        status,
        aidType,
        members: row.members.map((member) => toFamilyMember(member)),
    };
}

function toFamilyMember(row: FamilyMemberRow): FamilyMemberRecord {
    const kinship = isKinship(row.kinship) ? row.kinship : "other";
    const gender = row.gender ?? "";

    return {
        id: row.id,
        name: row.name,
        kinship,
        kinshipLabel: kinshipLabel(kinship, gender),
        cpf: row.cpf ? formatCpf(row.cpf) : "",
        street: row.street ?? "",
        neighborhood: row.neighborhood ?? "",
        city: row.city ?? "",
        state: row.state ?? "",
        email: row.email ?? "",
        contacts: row.contacts.map((contact) => formatContact(contact.phone)),
        dateOfBirth: row.dateOfBirth ? formatDateOfBirth(row.dateOfBirth) : "",
        ageLabel: row.dateOfBirth ? formatAge(row.dateOfBirth) : "",
        gender,
        maritalStatus: row.maritalStatus ?? "",
        employment: row.employment ?? "",
        profession: row.profession ?? "",
        notes: row.notes ?? "",
        status: row.status ?? "",
        aidType: row.aidType ?? "",
    };
}

function toContacts(contacts: string[]): PreparedContact[] {
    return contacts.map((contact, position) => ({
        phone: normalizeContact(contact),
        position,
    }));
}

function emptyToNull(value: string): string | null {
    const trimmed = value.trim();

    return trimmed === "" ? null : trimmed;
}

function emptyEmail(value: string): string | null {
    const trimmed = value.trim().toLowerCase();

    return trimmed === "" ? null : trimmed;
}

function nameLike(column: "b.name" | "m.name", word: string) {
    const pattern = Prisma.sql`('%' || "system-auth".immutable_unaccent(lower(${escapeLike(word)})) || '%')`;

    if (column === "b.name") {
        return Prisma.sql`"system-auth".immutable_unaccent(lower(b.name)) LIKE ${pattern} ESCAPE ${LIKE_ESCAPE}`;
    }

    return Prisma.sql`"system-auth".immutable_unaccent(lower(m.name)) LIKE ${pattern} ESCAPE ${LIKE_ESCAPE}`;
}

function escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, "\\$&");
}

function uniqueCpfFailure(error: unknown): ServerFailure | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
        return null;
    }

    const target = Array.isArray(error.meta?.target) ? error.meta.target.join(" ") : String(error.meta?.target ?? "");

    if (target.includes("cpf")) {
        return serverFailure(CPF_TAKEN_MESSAGE);
    }

    return serverFailure("Não foi possível salvar o beneficiário.");
}

function readErrorCode(error: APIError): string | null {
    const body = error.body;

    if (!body || typeof body !== "object" || !("code" in body)) {
        return null;
    }

    return typeof body.code === "string" ? body.code : null;
}
