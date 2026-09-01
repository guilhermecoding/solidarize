import Image from "next/image";
import { cn } from "@/lib/utils";

interface IconLogoProps {
    className?: string;
}

export default function IconLogo({ className }: IconLogoProps) {
    return (
        <Image
            src="/icon-logo.svg"
            alt="Icone da logo"
            width={100}
            height={100}
            className={cn("size-6 object-contain pointer-events-none select-none", className)}
            loading="eager"
        />
    );
}
