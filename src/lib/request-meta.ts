import { headers } from "next/headers";

export type RequestMetadata = {
    ipAddress: string | null;
    userAgent: string | null;
};

const CONTROL_CHARS_PATTERN = /[\u0000-\u001F\u007F]/g;
const MAX_IP_LENGTH = 64;
const MAX_USER_AGENT_LENGTH = 255;

function sanitizeHeaderValue(value: string | null, maxLength: number): string | null {
    if (!value) {
        return null;
    }

    const cleaned = value.replace(CONTROL_CHARS_PATTERN, "").trim();

    if (!cleaned) {
        return null;
    }

    return cleaned.slice(0, maxLength);
}

/**
 * Extrai IP e User-Agent sanitizados a partir de um objeto Headers.
 */
export function extractRequestMetadata(headerStore: Headers): RequestMetadata {
    const forwardedFor = headerStore.get("x-forwarded-for");
    const firstForwardedIp = forwardedFor ? forwardedFor.split(",")[0] ?? null : null;
    const rawIp =
        firstForwardedIp
        ?? headerStore.get("x-real-ip")
        ?? headerStore.get("cf-connecting-ip");

    return {
        ipAddress: sanitizeHeaderValue(rawIp, MAX_IP_LENGTH),
        userAgent: sanitizeHeaderValue(headerStore.get("user-agent"), MAX_USER_AGENT_LENGTH),
    };
}

/**
 * Lê IP e User-Agent do contexto da requisição atual com fallback seguro fora de escopo HTTP.
 */
export async function getRequestMetadata(headerStore?: Headers): Promise<RequestMetadata> {
    if (headerStore) {
        return extractRequestMetadata(headerStore);
    }

    try {
        const currentHeaders = await headers();
        return extractRequestMetadata(currentHeaders);
    } catch {
        return {
            ipAddress: null,
            userAgent: null,
        };
    }
}
