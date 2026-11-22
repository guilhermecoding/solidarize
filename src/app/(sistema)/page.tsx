import { Suspense } from "react";
import type { Metadata } from "next";

import { GreetingSection } from "@/app/(sistema)/_components/greeting-section";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
    title: "Início",
};

function HomeSkeleton() {
    return (
        <Section className="flex flex-col gap-4">
            <Skeleton className="h-7 w-32 rounded-lg" />
        </Section>
    );
}

export default function HomePage() {
    return (
        <Page>
            <Suspense fallback={<HomeSkeleton />}>
                <GreetingSection />
            </Suspense>
        </Page>
    );
}
