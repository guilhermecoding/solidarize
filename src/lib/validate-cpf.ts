export function normalizeCpf(value: string): string {
    return value.replace(/\D/g, "");
}

export function formatCpf(value: string): string {
    const digits = normalizeCpf(value).slice(0, 11);

    if (digits.length <= 3) {
        return digits;
    }

    if (digits.length <= 6) {
        return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }

    if (digits.length <= 9) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function checkDigit(digits: string, factor: number): number {
    let sum = 0;

    for (const digit of digits) {
        sum += Number(digit) * factor;
        factor -= 1;
    }

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(value: string): boolean {
    const cpf = normalizeCpf(value);

    if (cpf.length !== 11) {
        return false;
    }

    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    const firstDigit = checkDigit(cpf.slice(0, 9), 10);
    if (firstDigit !== Number(cpf[9])) {
        return false;
    }

    const secondDigit = checkDigit(cpf.slice(0, 10), 11);
    return secondDigit === Number(cpf[10]);
}
