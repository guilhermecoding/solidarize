import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import prisma from "@/lib/prisma";
import { ac, adminRole, memberRole } from "@/lib/auth-permissions";

const trustedOrigins = [
    "http://localhost:3000",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
        ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
        : []),
];

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            cpf: {
                type: "string",
                required: true,
                unique: true,
            },
            contact: {
                type: "string",
                required: true,
            },
            dateOfBirth: {
                type: "date",
                required: true,
            },
            address: {
                type: "string",
                required: false,
            },
        },
    },
    trustedOrigins,
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 dias
        updateAge: 60 * 60 * 6, // 6 horas
    },
    plugins: [
        admin({
            defaultRole: "member",
            adminRoles: ["admin"],
            ac,
            roles: {
                admin: adminRole,
                member: memberRole,
            },
        }),
        nextCookies(),
    ],
});
