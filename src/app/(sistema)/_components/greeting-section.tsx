import { connection } from "next/server";

import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";
import { getCurrentUser } from "@/lib/current-user";
import { getBrazilDateParts } from "@/lib/date-br";

function getGreeting(hour: number): string {
    if (hour >= 5 && hour < 12) {
        return "Bom dia";
    }

    if (hour >= 12 && hour < 18) {
        return "Boa tarde";
    }

    return "Boa noite";
}

export async function GreetingSection() {
    await connection();
    const user = await getCurrentUser();
    const { hour } = getBrazilDateParts(new Date());
    const firstName = user.name.trim().split(/\s+/)[0] || user.name;

    return (
        <Section className="mt-2">
            <TitlePage
                title={`${getGreeting(hour)}, ${firstName}!`}
            />
        </Section>
    );
}
