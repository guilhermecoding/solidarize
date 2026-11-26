import { cn } from "@/lib/utils";

interface TextLogoProps {
    className?: string;
}

export default function TextLogo({ className }: TextLogoProps) {
    return (
        <span className={cn("text-2xl font-bold font-young-serif", className)}>Solidarize</span>
    );
}
