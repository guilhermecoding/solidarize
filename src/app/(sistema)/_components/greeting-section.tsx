import { connection } from "next/server";

import Section from "@/components/shared/section";
import TitlePage from "@/components/title-page";
import { getCurrentUser } from "@/lib/current-user";
import { getBrazilDateParts } from "@/lib/date-br";

const solidarityPhrases = [
    "O bem te espera.",
    "Solidariedade transforma o dia.",
    "Um gesto de cuidado muda tudo.",
    "Juntos, o bem chega mais longe.",
    "Cada ajuda conta.",
    "Cuidar do outro é cuidar do mundo.",
    "A solidariedade começa perto.",
    "O bem cresce quando é compartilhado.",
    "Ninguém se salva sozinho.",
    "Pequenos gestos, grandes cuidados.",
] as const;

function getSolidarityPhrase(): string {
    const index = Math.floor(Math.random() * solidarityPhrases.length);

    return solidarityPhrases[index] ?? solidarityPhrases[0];
}

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
                description={getSolidarityPhrase()}
            />
        </Section>
    );
}
