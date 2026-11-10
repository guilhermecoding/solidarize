const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateOnly(value: string): Date | null {
    const match = DATE_ONLY_PATTERN.exec(value.trim());

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

const BRAZILIAN_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function formatDateOfBirthInput(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    if (digits.length <= 2) {
        return digits;
    }

    if (digits.length <= 4) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function parseBrazilianDate(value: string): Date | null {
    const match = BRAZILIAN_DATE_PATTERN.exec(value.trim());

    if (!match) {
        return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    if (year < 1900 || month < 1 || month > 12 || day < 1) {
        return null;
    }

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return date;
}

export function formatDateOfBirth(date: Date): string {
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = String(date.getUTCFullYear());

    return `${day}/${month}/${year}`;
}

export function isBrazilianDateOfBirthValid(date: Date): boolean {
    const today = new Date();
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const birthUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

    return birthUtc <= todayUtc;
}

export function isBirthDateInputValid(value: string): boolean {
    const date = parseBrazilianDate(value);

    return date !== null && isBrazilianDateOfBirthValid(date);
}

export function isDateOfBirthValid(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateOfBirth = new Date(date);
    dateOfBirth.setHours(0, 0, 0, 0);

    return dateOfBirth.getTime() <= today.getTime();
}
