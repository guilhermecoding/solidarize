export type ServerSuccess<T = undefined> = {
    ok: true;
    data: T;
    message?: string;
};

export type ServerFailure = {
    ok: false;
    message: string;
};

export type ServerResponse<T = undefined> = ServerSuccess<T> | ServerFailure;

export function serverSuccess(): ServerSuccess<undefined>;
export function serverSuccess<T>(data: T, message?: string): ServerSuccess<T>;
export function serverSuccess<T = undefined>(
    data?: T,
    message?: string,
): ServerSuccess<T> {
    return {
        ok: true,
        data: data as T,
        ...(message ? { message } : {}),
    };
}

export function serverFailure(message: string): ServerFailure {
    return {
        ok: false,
        message,
    };
}
