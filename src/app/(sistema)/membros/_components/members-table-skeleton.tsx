import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function MembersTableSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end gap-3">
                <Skeleton className="ml-auto h-12 w-full min-w-0 max-w-sm rounded-2xl" />
                <Skeleton className="h-12 w-36 shrink-0 rounded-2xl" />
            </div>
            <div className="overflow-hidden rounded-xl border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Papel</TableHead>
                            <TableHead>Acesso</TableHead>
                            <TableHead>Permissão</TableHead>
                            <TableHead>Editar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 4 }, (_, index) => (
                            <TableRow key={index} className="odd:bg-background even:bg-muted/50">
                                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end gap-1">
                <Skeleton className="size-8 rounded-2xl" />
                <Skeleton className="size-8 rounded-2xl" />
            </div>
        </div>
    );
}
