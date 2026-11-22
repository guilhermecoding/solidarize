import { Suspense } from "react";
import type { Metadata } from "next";

import {
    MobileMenuSection,
    MobileMenuSkeleton,
} from "@/app/(sistema)/_components/nav-menu-cards";
import Page from "@/components/shared/page";

export const metadata: Metadata = {
    title: "Gestão",
};

/**
 * Página dedicada aos atalhos do menu Gestão.
 */
export default function GestaoPage() {
    return (
        <Page showBack>
            <Suspense fallback={<MobileMenuSkeleton itemCount={4} />}>
                <MobileMenuSection sectionLabel="GESTÃO" title="Gestão" />
            </Suspense>
        </Page>
    );
}
