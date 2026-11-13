import { PageBackButton } from "@/components/shared/page-back-button";
import { cn } from "@/lib/utils";

type PageProps = React.ComponentPropsWithoutRef<"main"> & {
    /**
     * Mostra o botão de voltar quando o histórico tem uma entrada anterior.
     * @default false
     */
    showBack?: boolean;
};

/**
 * Componente de página.
 * @param children - Os filhos do componente.
 * @param showBack - Se o botão de voltar pode aparecer. O padrão é não.
 */
export default function Page({
    children,
    className,
    showBack = false,
    ...props
}: PageProps) {
    return (
        <main className={cn("w-full min-w-0 flex-1 pt-6 pb-12 @container/main", className)} {...props}>
            {showBack ? <PageBackButton /> : null}
            {children}
        </main>
    );
}