import { Suspense } from "react";
import type { Metadata } from "next";

import { GreetingSection } from "@/app/(sistema)/_components/greeting-section";
import {
    HomeMenusSection,
    HomeMenusSkeleton,
} from "@/app/(sistema)/_components/home-menus-section";
import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import { Skeleton } from "@/components/ui/skeleton";
import IconLogo from "@/components/logo/icon-logo";
import TextLogo from "@/components/logo/text-logo";

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
            <Section className="flex md:hidden justify-center items-center gap-2 mb-4">
                <IconLogo className="size-6" />
                <TextLogo className="text-lg" />
            </Section>
            <Suspense fallback={<HomeSkeleton />}>
                <GreetingSection />
            </Suspense>
            <Suspense fallback={<HomeMenusSkeleton />}>
                <HomeMenusSection />
            </Suspense>
        </Page>
    );
}
