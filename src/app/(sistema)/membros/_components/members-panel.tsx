"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Add01Icon, ArrowLeft01Icon, ArrowRight01Icon, Edit03Icon, Search01Icon, SearchAlertIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { searchMembersAction } from "@/app/(sistema)/membros/action";
import { MemberCredentialsDialog } from "@/app/(sistema)/membros/_components/member-credentials-dialog";
import { MemberDrawer } from "@/app/(sistema)/membros/_components/member-drawer";
import { notify } from "@/lib/notify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useMemberAccess } from "@/hooks/use-member-access";
import {
    userAccessLabels,
    userPermissionLabels,
    userRoleLabels,
    type Member,
    type MemberCredentials,
} from "@/services/user/user.type";

const SEARCH_DEBOUNCE_MS = 300; // Tempo de debounce para a busca de membros
const PAGE_SIZE = 10; // Tamanho da página para a tabela de membros

type MembersPanelProps = {
    members: Member[];
    canWrite: boolean;
    currentUserId: string;
};

export function MembersPanel({ members, canWrite: initialCanWrite, currentUserId }: MembersPanelProps) {
    const router = useRouter();
    const access = useMemberAccess();
    const canWrite = access.isPending ? initialCanWrite : access.canWrite;
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [pageQuery, setPageQuery] = useState("");
    const [results, setResults] = useState(members);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<Member | null>(null);
    const [credentials, setCredentials] = useState<CredentialsDialogState | null>(null);
    const [credentialsOpen, setCredentialsOpen] = useState(false);
    const requestId = useRef(0);
    const trimmedQuery = query.trim().replace(/\s+/g, " ");

    if (pageQuery !== trimmedQuery) {
        setPageQuery(trimmedQuery);
        setPage(1);
    }

    const displayedMembers = trimmedQuery ? results : members;
    const pageCount = Math.max(1, Math.ceil(displayedMembers.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const pageMembers = displayedMembers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    useEffect(() => {
        if (!trimmedQuery) {
            requestId.current += 1;
            return;
        }

        const id = ++requestId.current;
        const timeout = window.setTimeout(() => {
            void searchMembersAction({ query: trimmedQuery })
                .then((result) => {
                    if (id !== requestId.current) {
                        return;
                    }

                    if (result?.data) {
                        setResults(result.data);
                        return;
                    }

                    if (result?.serverError) {
                        notify("error", result.serverError);
                    }
                })
                .catch(() => {
                    if (id !== requestId.current) {
                        return;
                    }

                    notify("error", "Não foi possível buscar os membros.");
                });
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [members, trimmedQuery]);

    function openCreate() {
        setEditing(null);
        setDrawerOpen(true);
    }

    function openEdit(member: Member) {
        setEditing(member);
        setDrawerOpen(true);
    }

    function handleCreated(nextCredentials: MemberCredentials, message: string) {
        setCredentials({ ...nextCredentials, message });
        setCredentialsOpen(true);
        setDrawerOpen(false);
    }

    function handleDrawerOpenChange(open: boolean) {
        setDrawerOpen(open);
    }

    function handleUpdated(message: string) {
        setDrawerOpen(false);
        notify("success", message);
        router.refresh();
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-end gap-3">
                    {
                        displayedMembers.length > 0 ? (
                            <span className="text-xl font-medium flex items-center gap-1 mt-4">
                                Total
                                <span className="text-sm bg-muted-foreground/30 border border-foreground font-medium px-2 rounded-md">
                                    {displayedMembers.length}
                                </span>
                            </span>
                        ) : null
                    }
                    <div className="ml-auto w-full min-w-0 sm:max-w-sm">
                        <Input
                            value={query}
                            onValueChange={setQuery}
                            placeholder="Buscar por nome ou CPF"
                            aria-label="Buscar membros"
                            maxLength={120}
                            startIcon={<HugeiconsIcon icon={Search01Icon} strokeWidth={2} />}
                        />
                    </div>
                    {canWrite ? (
                        <Button type="button" className="shrink-0 w-full sm:w-auto" onClick={openCreate}>
                            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                            Adicionar
                        </Button>
                    ) : null}
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
                                {canWrite ? <TableHead>Editar</TableHead> : null}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pageMembers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={canWrite ? 6 : 5} className="text-muted-foreground">
                                        <div className="flex flex-col items-center gap-4 py-12">
                                            <HugeiconsIcon icon={SearchAlertIcon} strokeWidth={2} className="size-10 md:size-12" />
                                            <span className="text-sm font-medium md:text-lg">Nenhum membro encontrado</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pageMembers.map((member) => (
                                    <TableRow key={member.id} className="odd:bg-background even:bg-muted/50">
                                        <TableCell className="whitespace-normal font-medium">
                                            <span className="inline-flex flex-wrap items-center gap-2">
                                                {member.name}
                                                {member.id === currentUserId ? (
                                                    <Badge variant="outline">Você</Badge>
                                                ) : null}
                                            </span>
                                        </TableCell>
                                        <TableCell>{member.cpf}</TableCell>
                                        <TableCell>
                                            <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                                                {userRoleLabels[member.role]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={member.access === "active" ? "success" : "muted"}>
                                                {userAccessLabels[member.access]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={member.permission === "full" ? "default" : "outline"}>
                                                {userPermissionLabels[member.permission]}
                                            </Badge>
                                        </TableCell>
                                        {canWrite ? (
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-foreground"
                                                    onClick={() => openEdit(member)}
                                                >
                                                    <HugeiconsIcon icon={Edit03Icon} strokeWidth={2} className="size-5" />
                                                </Button>
                                            </TableCell>
                                        ) : null}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {displayedMembers.length > 0 ? (
                    <div className="flex items-center justify-end gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="border-foreground/20"
                            aria-label="Página anterior"
                            disabled={currentPage === 1}
                            onClick={() => setPage(currentPage - 1)}
                        >
                            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label="Próxima página"
                            className="border-foreground/20"
                            disabled={currentPage === pageCount}
                            onClick={() => setPage(currentPage + 1)}
                        >
                            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                        </Button>
                    </div>
                ) : null}
            </div>
            <MemberDrawer
                open={drawerOpen}
                member={editing}
                onOpenChange={handleDrawerOpenChange}
                onCreated={handleCreated}
                onUpdated={handleUpdated}
            />
            <MemberCredentialsDialog
                open={credentialsOpen}
                message={credentials?.message ?? ""}
                email={credentials?.email ?? ""}
                password={credentials?.password ?? ""}
                onOpenChange={(open) => {
                    setCredentialsOpen(open);

                    if (!open) {
                        router.refresh();
                    }
                }}
            />
        </>
    );
}

type CredentialsDialogState = MemberCredentials & {
    message: string;
};
