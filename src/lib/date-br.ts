const BRAZIL_TIMEZONE = "America/Sao_Paulo";
const MS_PER_DAY = 86_400_000;
const BRAZILIAN_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const MONTH_NAMES = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
] as const;

const brazilPartsFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: BRAZIL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

export type BrazilDateParts = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
};

export type ExpiryStatus = "none" | "expired" | "expiring" | "ok";

export type HistoryDayGroup = {
    key: string;
    label: string;
};

export type HistoryMonthGroup = {
    key: string;
    label: string;
};

/**
 * Extrai ano, mês, dia, hora e minuto no fuso America/Sao_Paulo.
 */
export function getBrazilDateParts(date: Date): BrazilDateParts {
    const parts = brazilPartsFormatter.formatToParts(date);
    const values: Record<string, string> = {};

    for (const part of parts) {
        if (part.type !== "literal") {
            values[part.type] = part.value;
        }
    }

    return {
        year: Number(values.year),
        month: Number(values.month),
        day: Number(values.day),
        hour: Number(values.hour) % 24,
        minute: Number(values.minute),
    };
}

/**
 * Retorna a chave diária no formato DD-MM-AAAA (fuso America/Sao_Paulo).
 */
export function getBrazilDateKey(date: Date): string {
    const { day, month, year } = getBrazilDateParts(date);

    return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
}

/**
 * Converte uma chave DD-MM-AAAA em timestamp UTC de meia-noite para aritmética de dias.
 */
export function getBrazilTodayUtc(referenceDateKey: string): number {
    const [dayStr, monthStr, yearStr] = referenceDateKey.split("-");

    return Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
}

/**
 * Faz o parse estrito de uma data brasileira DD/MM/AAAA (aceita datas futuras).
 */
export function parseBrazilianDateInput(value: string): Date | null {
    const match = BRAZILIAN_DATE_PATTERN.exec(value.trim());

    if (!match) {
        return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1) {
        return null;
    }

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year
        || date.getUTCMonth() !== month - 1
        || date.getUTCDate() !== day
    ) {
        return null;
    }

    return date;
}

/**
 * Aplica máscara DD/MM/AAAA enquanto o usuário digita.
 */
export function formatBrazilianDateInput(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    if (digits.length <= 2) {
        return digits;
    }

    if (digits.length <= 4) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Formata uma data sem fuso (ex.: validade salva como UTC meia-noite) em DD/MM/AAAA.
 */
export function formatDateOnlyBr(date: Date): string {
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = String(date.getUTCFullYear());

    return `${day}/${month}/${year}`;
}

/**
 * Formata um timestamp em DD/MM/AAAA no fuso America/Sao_Paulo.
 */
export function formatDateBr(date: Date): string {
    const { day, month, year } = getBrazilDateParts(date);

    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

/**
 * Formata um timestamp em "DD/MM/AAAA às HH:mm" no fuso America/Sao_Paulo.
 */
export function formatDateTimeBr(date: Date): string {
    const { day, month, year, hour, minute } = getBrazilDateParts(date);

    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year} às ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Classifica a situação de validade de um alimento em relação à data de referência.
 */
export function getExpiryStatus(expiresAt: Date | null, referenceDateKey: string): ExpiryStatus {
    if (!expiresAt) {
        return "none";
    }

    const todayUtc = getBrazilTodayUtc(referenceDateKey);
    const expiryUtc = Date.UTC(expiresAt.getUTCFullYear(), expiresAt.getUTCMonth(), expiresAt.getUTCDate());
    const diffDays = Math.round((expiryUtc - todayUtc) / MS_PER_DAY);

    if (diffDays < 0) {
        return "expired";
    }

    if (diffDays <= 7) {
        return "expiring";
    }

    return "ok";
}

/**
 * Calcula chave e rótulo de agrupamento diário para o histórico ("Hoje", "Ontem", "Há 2/3 dias", "DD de mês [de YYYY]").
 */
export function getHistoryDayGroup(date: Date, referenceDateKey: string): HistoryDayGroup {
    const { day, month, year } = getBrazilDateParts(date);
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const todayUtc = getBrazilTodayUtc(referenceDateKey);
    const itemUtc = Date.UTC(year, month - 1, day);
    const diffDays = Math.round((todayUtc - itemUtc) / MS_PER_DAY);

    if (diffDays <= 0) {
        return { key, label: "Hoje" };
    }

    if (diffDays === 1) {
        return { key, label: "Ontem" };
    }

    if (diffDays === 2) {
        return { key, label: "Há 2 dias" };
    }

    if (diffDays === 3) {
        return { key, label: "Há 3 dias" };
    }

    const [, , refYearStr] = referenceDateKey.split("-");
    const dd = String(day).padStart(2, "0");
    const monthName = MONTH_NAMES[month - 1] ?? "";

    if (year === Number(refYearStr)) {
        return { key, label: `${dd} de ${monthName}` };
    }

    return { key, label: `${dd} de ${monthName} de ${year}` };
}

/**
 * Calcula chave e rótulo de agrupamento mensal para o histórico ("Outubro" no ano atual ou "Outubro de 2025" em outro ano).
 */
export function getHistoryMonthGroup(date: Date, referenceDateKey: string): HistoryMonthGroup {
    const { month, year } = getBrazilDateParts(date);
    const key = `${year}-${String(month).padStart(2, "0")}`;
    const [, , refYearStr] = referenceDateKey.split("-");
    const rawMonthName = MONTH_NAMES[month - 1] ?? "";
    const monthName = rawMonthName
        ? rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1)
        : "";

    if (year === Number(refYearStr)) {
        return { key, label: monthName };
    }

    return { key, label: `${monthName} de ${year}` };
}
