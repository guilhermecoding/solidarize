"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Add01Icon, Edit03Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { MemberCredentialsDialog } from "@/app/(sistema)/membros/_components/member-credentials-dialog";
import { MemberDrawer } from "@/app/(sistema)/membros/_components/member-drawer";
import { notify } from "@/app/(sistema)/membros/_components/notify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type MembersPanelProps = {
    members: Member[];
    canWrite: boolean;
};

export function MembersPanel({ members, canWrite: initialCanWrite }: MembersPanelProps) {
    const router = useRouter();
    const access = useMemberAccess();
    const canWrite = access.isPending ? initialCanWrite : access.canWrite;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<Member | null>(null);
    const [credentials, setCredentials] = useState<CredentialsDialogState | null>(null);
    const [credentialsOpen, setCredentialsOpen] = useState(false);

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
                {canWrite ? (
                    <div className="flex justify-end">
                        <Button type="button" onClick={openCreate}>
                            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                            Adicionar
                        </Button>
                    </div>
                ) : null}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Papel</TableHead>
                            <TableHead>Acesso</TableHead>
                            <TableHead>Permissão</TableHead>
                            {canWrite ? <TableHead>Editar</TableHead> : null}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={canWrite ? 6 : 5} className="text-muted-foreground">
                                    Nenhum membro encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="whitespace-normal font-medium">{member.name}</TableCell>
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
