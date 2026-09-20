"use client";

import { APP_VERSION } from "@/lib/app-version";

export default function CopyReference() {
    return (
        <div className="text-sm text-muted-foreground text-center">
            <p>&copy; {new Date().getFullYear()} Solidarize - {APP_VERSION}</p>
            <p>Todos os direitos reservados</p>
        </div>
    );
}
