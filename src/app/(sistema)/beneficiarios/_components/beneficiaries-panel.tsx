"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Add01Icon, ArrowLeft01Icon, ArrowRight01Icon, Edit03Icon, Search01Icon, SearchAlertIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { searchBeneficiariesAction } from "@/app/(sistema)/beneficiarios/action";
import { BeneficiaryDrawer } from "@/app/(sistema)/beneficiarios/_components/beneficiary-drawer";
import { ResultDialog } from "@/components/shared/result-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemberAccess } from "@/hooks/use-member-access";
import { notify } from "@/lib/notify";
import type { BeneficiaryAssistantRecord, BeneficiaryRecord } from "@/services/beneficiary/beneficiary.type";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

type BeneficiariesPanelProps = {
    beneficiaries: BeneficiaryRecord[];
    assistants: BeneficiaryAssistantRecord[];
    canWrite: boolean;
};

export function BeneficiariesPanel({
    beneficiaries,
    assistants,
    canWrite: initialCanWrite,
}: BeneficiariesPanelProps) {
    const router = useRouter();
    const access = useMemberAccess();
    const canWrite = access.isPending ? initialCanWrite : access.canWrite;
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [pageQuery, setPageQuery] = useState("");
    const [results, setResults] = useState(beneficiaries);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<BeneficiaryRecord | null>(null);
    const [savedResult, setSavedResult] = useState<{ title: string; subtitle: string } | null>(null);
    const requestId = useRef(0);
    const trimmedQuery = query.trim().replace(/\s+/g, " ");

    if (pageQuery !== trimmedQuery) {
        setPageQuery(trimmedQuery);
        setPage(1);
    }

    const displayedBeneficiaries = trimmedQuery ? results : beneficiaries;
    const pageCount = Math.max(1, Math.ceil(displayedBeneficiaries.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const pageBeneficiaries = displayedBeneficiaries.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    useEffect(() => {
        if (!trimmedQuery) {
            requestId.current += 1;
            return;
        }

        const id = ++requestId.current;
        const timeout = window.setTimeout(() => {
            void searchBeneficiariesAction({ query: trimmedQuery })
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

                    notify("error", "Não foi possível buscar os beneficiários.");
                });
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [beneficiaries, trimmedQuery]);

    function openCreate() {
        setEditing(null);
        setDrawerOpen(true);
    }

    function openEdit(beneficiary: BeneficiaryRecord) {
        setEditing(beneficiary);
        setDrawerOpen(true);
    }

    function handleSaved(message: string) {
        setSavedResult({
            title: editing ? "Beneficiário atualizado!" : "Beneficiário adicionado",
            subtitle: message,
        });
        setDrawerOpen(false);
        router.refresh();
    }

    function handleDeleted() {
        setDrawerOpen(false);
        router.refresh();
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col-reverse items-start justify-end gap-3 sm:flex-row sm:items-center">
                    {displayedBeneficiaries.length > 0 ? (
                        <span className="mt-4 flex items-center gap-1 text-xl font-medium">
                            Total
                            <span className="rounded-md border border-foreground bg-muted-foreground/30 px-2 text-sm font-medium">
                                {displayedBeneficiaries.length}
                            </span>
                        </span>
                    ) : null}
                    <div className="ml-auto w-full min-w-0 sm:max-w-sm">
                        <Input
                            value={query}
                            onValueChange={setQuery}
                            placeholder="Buscar por nome ou CPF"
                            aria-label="Buscar beneficiários"
                            maxLength={120}
                            startIcon={<HugeiconsIcon icon={Search01Icon} strokeWidth={2} />}
                        />
                    </div>
                    {canWrite ? (
                        <Button type="button" className="w-full shrink-0 sm:w-auto" onClick={openCreate}>
                            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                            Adicionar
                        </Button>
                    ) : null}
                </div>
                {pageBeneficiaries.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 rounded-xl border bg-background py-12 text-muted-foreground">
                        <HugeiconsIcon icon={SearchAlertIcon} strokeWidth={2} className="size-10 md:size-12" />
                        <span className="text-sm font-medium md:text-lg">Nenhum beneficiário encontrado</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {pageBeneficiaries.map((beneficiary) => (
                            <article
                                key={beneficiary.id}
                                className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3"
                            >
                                <Link href={`/beneficiarios/${beneficiary.id}`} className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{beneficiary.name}</p>
                                    <p className="text-sm text-muted-foreground">{beneficiary.ageLabel}</p>
                                </Link>
                                {canWrite ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-foreground"
                                        aria-label={`Editar ${beneficiary.name}`}
                                        onClick={() => openEdit(beneficiary)}
                                    >
                                        <HugeiconsIcon icon={Edit03Icon} strokeWidth={2} className="size-5" />
                                    </Button>
                                ) : null}
                            </article>
                        ))}
                    </div>
                )}
                {displayedBeneficiaries.length > 0 ? (
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
                            className="border-foreground/20"
                            aria-label="Próxima página"
                            disabled={currentPage === pageCount}
                            onClick={() => setPage(currentPage + 1)}
                        >
                            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                        </Button>
                    </div>
                ) : null}
            </div>
            <BeneficiaryDrawer
                open={drawerOpen}
                beneficiary={editing}
                assistants={assistants}
                onOpenChange={setDrawerOpen}
                onSaved={handleSaved}
                onDeleted={handleDeleted}
            />
            <ResultDialog
                status="success"
                open={savedResult !== null}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setSavedResult(null);
                    }
                }}
                title={savedResult?.title ?? ""}
                subtitle={savedResult?.subtitle ?? ""}
            />
        </>
    );
}
