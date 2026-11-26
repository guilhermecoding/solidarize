export function normalizeContact(value: string): string {
    return value.replace(/\D/g, "").slice(0, 11);
}

export function isValidContact(value: string): boolean {
    const digits = value.replace(/\D/g, "");

    return digits.length === 10 || digits.length === 11;
}

export function formatContact(value: string): string {
    const digits = normalizeContact(value);

    if (digits.length === 0) {
        return "";
    }

    if (digits.length < 3) {
        return `(${digits}`;
    }

    const area = digits.slice(0, 2);
    const rest = digits.slice(2);

    if (digits.length <= 6) {
        return `(${area}) ${rest}`;
    }

    if (digits.length <= 10) {
        return `(${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    }

    return `(${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}
