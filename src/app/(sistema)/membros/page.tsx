import { Suspense } from "react";
import { Metadata } from "next";


import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";
import { MembersTableSkeleton } from "./_components/members-table-skeleton";
import { MembersSection } from "./_components/members-section";

export const metadata: Metadata = {
    title: "Membros",
    description: "Gerencie os membros associados à organização.",
};

export default function MemberPage() {
    return (
        <Page>
            <Section className="flex flex-col gap-6">
                <TitlePage
                    title="Membros"
                    description="Gerencie os membros associados à organização."
                />
                <Suspense fallback={<MembersTableSkeleton />}>
                    <MembersSection />
                </Suspense>
            </Section>
        </Page>
    );
}
