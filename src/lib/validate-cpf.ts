export function normalizeCpf(value: string): string {
    return value.replace(/\D/g, "");
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
