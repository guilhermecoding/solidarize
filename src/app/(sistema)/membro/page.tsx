import { Suspense } from "react";
import type { Metadata } from "next";

import {
    MobileMenuSection,
    MobileMenuSkeleton,
} from "@/app/(sistema)/_components/nav-menu-cards";
import Page from "@/components/shared/page";

export const metadata: Metadata = {
    title: "Membro",
};

/**
 * Página dedicada aos atalhos do menu Membro.
 */
export default function MembroPage() {
    return (
        <Page showBack>
            <Suspense fallback={<MobileMenuSkeleton itemCount={2} />}>
                <MobileMenuSection sectionLabel="MEMBRO" title="Membro" />
            </Suspense>
        </Page>
    );
}
