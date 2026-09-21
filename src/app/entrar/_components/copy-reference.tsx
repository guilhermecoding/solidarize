"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { APP_VERSION } from "@/lib/app-version";
import { Suspense } from "react";

function CopyReferenceContent() {
    return (
        <div className="text-sm text-muted-foreground text-center">
            <p>&copy; {new Date().getFullYear()} Solidarize - {APP_VERSION}</p>
            <p>Todos os direitos reservados</p>
        </div>
    );
}

export default function CopyReference() {
    return (
        <Suspense fallback={<Skeleton className="w-full h-4" />}>
            <CopyReferenceContent />
        </Suspense>
    );
}
