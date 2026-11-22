import Section from "@/components/shared/section";
import { getCurrentUser } from "@/lib/current-user";

export async function HomeSection() {
    await getCurrentUser();

    return (
        <Section>
            <div>Home</div>
        </Section>
    );
}
