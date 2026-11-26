import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware, getAuthoritativeSessionFromCtx } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import prisma from "@/lib/prisma";
import { ac, adminRole, memberRole } from "@/lib/auth-permissions";
import { hasWriteAccess, isUserBanned } from "@/lib/member-access";
import { recordAuditLog } from "@/services/audit/audit-writer";

const BLOCKED_SELF_SERVICE_PATHS = new Set([
    "/update-user",
    "/change-email",
    "/change-password",
    "/delete-user",
]);

const trustedOrigins = [
    ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
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
        disableSignUp: true,
    },
    user: {
        additionalFields: {
            cpf: {
                type: "string",
                required: true,
                unique: true,
                input: false,
            },
            contact: {
                type: "string",
                required: true,
                input: false,
            },
            dateOfBirth: {
                type: "date",
                required: true,
                input: false,
            },
            gender: {
                type: "string",
                required: true,
                defaultValue: "unspecified",
                input: false,
            },
            address: {
                type: "string",
                required: false,
                input: false,
            },
            permission: {
                type: "string",
                required: true,
                defaultValue: "read",
                input: false,
            },
        },
    },
    trustedOrigins,
    rateLimit: {
        enabled: true,
        storage: "database",
        window: 60,
        max: 60,
        customRules: {
            "/sign-in/email": { window: 60, max: 5 },
            "/verify-password": { window: 60, max: 5 },
        },
    },
    advanced: {
        ipAddress: {
            ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "cf-connecting-ip"],
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 dias
        updateAge: 60 * 60 * 24, // renova a cada 24h de atividade
        freshAge: 60 * 60, // 1 hora para ações sensíveis
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.request && BLOCKED_SELF_SERVICE_PATHS.has(ctx.path)) {
                throw new APIError("FORBIDDEN", {
                    message: "Operação não permitida.",
                });
            }

            if (ctx.path.startsWith("/admin/") && (ctx.request || ctx.headers)) {
                const session = await getAuthoritativeSessionFromCtx(ctx);
                const user = session?.user as
                    | {
                        id: string;
                        name?: string | null;
                        role?: string | null;
                        permission?: string | null;
                        banned?: boolean | null;
                        banExpires?: Date | string | null;
                    }
                    | undefined;

                if (!user || isUserBanned(user) || !hasWriteAccess(user)) {
                    await recordAuditLog({
                        action: "auth.admin_api_blocked",
                        entityType: "auth",
                        entityId: user?.id ?? null,
                        entityLabel: ctx.path,
                        description: `Tentativa bloqueada de acesso administrativo em ${ctx.path}`,
                        actorId: user?.id ?? null,
                        actorName: user?.name ?? "Não autenticado",
                        metadata: {
                            path: ctx.path,
                            role: user?.role ?? null,
                            permission: user?.permission ?? null,
                        },
                        headers: ctx.headers ?? ctx.request?.headers,
                    });

                    throw new APIError("FORBIDDEN", {
                        message: "Você não tem permissão para esta ação administrativa.",
                    });
                }
            }
        }),
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
