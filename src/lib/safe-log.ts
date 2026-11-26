const CPF_PATTERN = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const MAX_MESSAGE_LENGTH = 240;

function redactSensitiveText(value: string): string {
    return value
        .replace(CPF_PATTERN, "[REDACTED_CPF]")
        .replace(EMAIL_PATTERN, "[REDACTED_EMAIL]")
        .slice(0, MAX_MESSAGE_LENGTH);
}

function readSafeMetaTarget(meta: unknown): string | string[] | undefined {
    if (!meta || typeof meta !== "object" || !("target" in meta)) {
        return undefined;
    }

    const target = (meta as { target?: unknown }).target;

    if (typeof target === "string") {
        return target;
    }

    if (Array.isArray(target)) {
        return target.filter((item): item is string => typeof item === "string");
    }

    return undefined;
}

/**
 * Registra erros no servidor extraindo apenas metadados seguros, sem expor PII ou argumentos de consulta.
 */
export function logSafeServerError(context: string, error: unknown): void {
    if (!(error instanceof Error)) {
        console.error(`[${context}]`, { type: typeof error });
        return;
    }

    const record = error as Error & {
        code?: unknown;
        status?: unknown;
        statusCode?: unknown;
        meta?: unknown;
    };

    const payload: Record<string, unknown> = {
        name: error.name,
        message: redactSensitiveText(error.message),
    };

    if (typeof record.code === "string") {
        payload.code = record.code;
    }

    if (typeof record.status === "number") {
        payload.status = record.status;
    } else if (typeof record.statusCode === "number") {
        payload.statusCode = record.statusCode;
    }

    const target = readSafeMetaTarget(record.meta);

    if (target !== undefined) {
        payload.target = target;
    }

    console.error(`[${context}]`, payload);
}
