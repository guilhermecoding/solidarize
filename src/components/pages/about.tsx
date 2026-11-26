import Page from "../shared/page";
import Section from "../shared/section";
import TitlePage from "../title-page";
import { APP_VERSION } from "@/lib/app-version";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ExternalLinkIcon, Github01Icon, Linkedin01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import IconLogo from "../logo/icon-logo";
import TextLogo from "../logo/text-logo";

export default function AboutComponent() {
    return (
        <Page>
            <Section>
                <TitlePage title="Sobre" />
            </Section>

            <Section className="mt-6">
                <div className="flex flex-col justify-center items-center">
                    <div className="flex flex-col items-center gap-2">
                        <IconLogo className="size-16 sm:size-20" />
                        <TextLogo className="text-4xl sm:text-5xl" />
                    </div>
                    <span className="mt-2 text-sm text-muted-foreground">
                        release version {APP_VERSION}
                    </span>
                </div>
            </Section>

            <Separator className="my-6" />

            <Section>
                <h2 className="text-2xl text-muted-foreground font-bold">Informações:</h2>

                <div className="flex flex-col gap-4 mt-6">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Aplicação:</span>
                        <span className="text-base font-bold">SOLIDARIZE</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Versão:</span>
                        <span className="text-base font-bold">{APP_VERSION}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Data de lançamento:</span>
                        <span className="text-base font-bold">26/11/2026</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Criador/Desenvolvedor:</span>
                        <span className="text-base font-bold">
                            João Guilherme Araújo Viana
                        </span>
                        <Link href="https://www.linkedin.com/in/jo%C3%A3o-guilherme-ara%C3%BAjo-viana/"
                            className="text-base text-blue-500 hover:underline font-bold flex items-center gap-1 w-max"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <HugeiconsIcon icon={Linkedin01Icon} className="size-4" strokeWidth={2.5} /> LinkedIn <HugeiconsIcon icon={ExternalLinkIcon} className="size-4" strokeWidth={2.5} />
                        </Link>
                        <Link href="https://github.com/guilhermecoding"
                            className="text-base text-gray-500 hover:underline font-bold flex items-center gap-1 w-max"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <HugeiconsIcon icon={Github01Icon} className="size-4" strokeWidth={2.5} /> GitHub <HugeiconsIcon icon={ExternalLinkIcon} className="size-4" strokeWidth={2.5} />
                        </Link>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Contato:</span>
                        <Link href="mailto:joaoguilhermearaujo1617@gmail.com"
                            className="text-base text-red-500 hover:underline font-bold flex items-center gap-1 w-max"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <HugeiconsIcon icon={Mail01Icon} className="size-4" strokeWidth={2.5} />
                            joaoguilhermearaujo1617@gmail.com <HugeiconsIcon icon={ExternalLinkIcon} className="size-4" strokeWidth={2.5} />
                        </Link>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Agradecimentos:</span>
                        <span className="text-base font-medium italic">
                            &quot;Primeiramente, agradeço a <strong>Deus</strong> por me dar a oportunidade de criar este projeto.
                            <br />
                            Agradeço a minha mãe, por me apoiar em todos os momentos, aos meus amigos que apoiaram no desenvolvimento deste projeto
                            e a todos aqueles que acreditam no meu trabalho e usam este projeto.
                            &quot;
                        </span>
                    </div>
                </div>
            </Section>
        </Page>
    );
}