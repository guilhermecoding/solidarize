import Page from "@/components/shared/page";
import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Membros",
    description: "Gerencie os membros associados à organização.",
};

export default function MemberPage() {
    return (
        <Page>
            <Section>
                <TitlePage
                    title="Membros"
                    description="Gerencie os membros associados à organização."
                />
            </Section>
        </Page>
    );
}
