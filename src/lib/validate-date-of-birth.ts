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

export function isDateOfBirthValid(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateOfBirth = new Date(date);
    dateOfBirth.setHours(0, 0, 0, 0);

    return dateOfBirth.getTime() <= today.getTime();
}
