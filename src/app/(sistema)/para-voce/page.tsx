import { Suspense } from "react";
import type { Metadata } from "next";

import {
    MobileMenuSection,
    MobileMenuSkeleton,
} from "@/app/(sistema)/_components/nav-menu-cards";
import Page from "@/components/shared/page";

export const metadata: Metadata = {
    title: "Para você",
};

/**
 * Página dedicada aos atalhos do menu Para você.
 */
export default function ForYouPage() {
    return (
        <Page showBack>
            <Suspense fallback={<MobileMenuSkeleton itemCount={2} />}>
                <MobileMenuSection sectionLabel="PARA VOCÊ" title="Para você" />
            </Suspense>
        </Page>
    );
}
