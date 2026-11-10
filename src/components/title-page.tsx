
/**
 * Componente para exibir o título da página
 * 
 * @param title - Título da página
 * @param description - Descrição da página
 */
export default function TitlePage({
    title,
    description
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-young-serif">
                {title}
            </h1>
            {description && <p className="text-sm text-muted-foreground">
                {description}
            </p>}
        </div>
    );
}
