import { Separator } from "./ui/separator";

/**
 * A component that displays a separator with a title.
 * 
 * @example
 * <SeparatorSection title="Acesso" />
 * 
 * @param title - The title of the section
 * @returns 
 */
export default function SeparatorSection({ title }: { title: string }) {
    return (
        <div className="flex w-full min-w-0 items-center gap-2">
            <span className="shrink-0 text-sm font-medium text-muted-foreground">{title}</span>
            <Separator className="h-px min-w-0 flex-1 bg-border" />
        </div>
    );
}
