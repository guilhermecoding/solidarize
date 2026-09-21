import { createSafeActionClient } from "next-safe-action";

export class ActionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ActionError";
    }
}

export const actionClient = createSafeActionClient({
    handleServerError(error) {
        console.error(error);

        if (error instanceof ActionError) {
            return error.message;
        }

        return "Algo deu errado. Tente novamente.";
    },
});
