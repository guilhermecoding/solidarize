import "dotenv/config";

import { auth } from "@/lib/auth";
import { isValidCpf, normalizeCpf } from "@/lib/validate-cpf";
import { isDateOfBirthValid, parseDateOnly } from "@/lib/validate-date-of-birth";
import prisma from "@/lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const REQUIRED_ENV_KEYS = [
    "PRIMARY_USER_NAME",
    "PRIMARY_USER_EMAIL",
    "PRIMARY_USER_PASSWORD",
    "PRIMARY_USER_CPF",
    "PRIMARY_USER_CONTACT",
    "PRIMARY_USER_DATE_OF_BIRTH",
] as const;

type RequiredEnv = Record<(typeof REQUIRED_ENV_KEYS)[number], string>;

function readRequiredEnv(): RequiredEnv {
    const missing: string[] = [];
    const values = {} as RequiredEnv;

    for (const key of REQUIRED_ENV_KEYS) {
        const value = process.env[key]?.trim();

        if (!value) {
            missing.push(key);
            continue;
        }

        values[key] = value;
    }

    if (missing.length > 0) {
        throw new Error(
            `Variáveis obrigatórias ausentes ou vazias: ${missing.join(", ")}. Defina-as no arquivo .env.`
        );
    }

    return values;
}

function isValidEmail(email: string): boolean {
    return EMAIL_PATTERN.test(email);
}

async function main() {
    const env = readRequiredEnv();
    const errors: string[] = [];

    if (!isValidEmail(env.PRIMARY_USER_EMAIL)) {
        errors.push("PRIMARY_USER_EMAIL deve estar no formato local@domínio.");
    }

    if (!isValidCpf(env.PRIMARY_USER_CPF)) {
        errors.push("PRIMARY_USER_CPF deve ser um CPF válido.");
    }

    const parsedDateOfBirth = parseDateOnly(env.PRIMARY_USER_DATE_OF_BIRTH);

    if (!parsedDateOfBirth || !isDateOfBirthValid(parsedDateOfBirth)) {
        errors.push(
            "PRIMARY_USER_DATE_OF_BIRTH deve ser uma data válida no formato YYYY-MM-DD e não pode ser posterior à data atual."
        );
    }

    if (env.PRIMARY_USER_PASSWORD.length < MIN_PASSWORD_LENGTH) {
        errors.push("PRIMARY_USER_PASSWORD deve ter pelo menos 8 caracteres.");
    }

    if (errors.length > 0 || !parsedDateOfBirth) {
        throw new Error(errors.join("\n"));
    }

    const dateOfBirth = parsedDateOfBirth;

    const existingUsers = await prisma.user.count();

    if (existingUsers > 0) {
        console.log("Seed já executado. Nenhum usuário foi criado.");
        return;
    }

    const address = process.env.PRIMARY_USER_ADDRESS?.trim();

    await auth.api.createUser({
        body: {
            email: env.PRIMARY_USER_EMAIL,
            password: env.PRIMARY_USER_PASSWORD,
            name: env.PRIMARY_USER_NAME,
            role: "admin",
            data: {
                cpf: normalizeCpf(env.PRIMARY_USER_CPF),
                contact: env.PRIMARY_USER_CONTACT,
                dateOfBirth,
                ...(address ? { address } : {}),
            },
        },
    });

    console.log(`Usuário primário criado: ${env.PRIMARY_USER_EMAIL}`);
}

main()
    .catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
