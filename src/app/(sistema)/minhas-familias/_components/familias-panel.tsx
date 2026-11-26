"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Search01Icon,
    SearchAlertIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AssistedBeneficiarySummary } from "@/services/beneficiary/beneficiary.type";

const PAGE_SIZE = 10;

type FamiliasPanelProps = {
    families: AssistedBeneficiarySummary[];
};

/**
 * Painel paginado de listagem de famílias assistidas pelo usuário logado.
 */
export function FamiliasPanel({ families }: FamiliasPanelProps) {
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [pageQuery, setPageQuery] = useState("");

    const trimmedQuery = query.trim().replace(/\s+/g, " ");

    if (pageQuery !== trimmedQuery) {
        setPageQuery(trimmedQuery);
        setPage(1);
    }

    const normalizedQuery = normalizeSearchText(trimmedQuery);
    const queryDigits = trimmedQuery.replace(/\D/g, "");

    const filteredFamilies = families.filter((family) => {
        if (!normalizedQuery && !queryDigits) {
            return true;
        }

        const nameMatches = normalizedQuery
            ? normalizeSearchText(family.name).includes(normalizedQuery)
            : false;
        const cpfMatches = queryDigits
            ? family.cpf.replace(/\D/g, "").includes(queryDigits)
            : false;

        return nameMatches || cpfMatches;
    });

    const pageCount = Math.max(1, Math.ceil(filteredFamilies.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const pageFamilies = filteredFamilies.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    return (
        <div className="flex flex-col gap-4">
            {families.length > 0 ? (
                <div className="flex flex-col-reverse items-start justify-end gap-3 sm:flex-row sm:items-center">
                    {filteredFamilies.length > 0 ? (
                        <span className="mt-4 flex items-center gap-1 text-xl font-medium">
                            Total
                            <span className="rounded-md border border-foreground bg-muted-foreground/30 px-2 text-sm font-medium">
                                {filteredFamilies.length}
                            </span>
                        </span>
                    ) : null}
                    <div className="ml-auto w-full min-w-0 sm:max-w-sm">
                        <Input
                            value={query}
                            onValueChange={setQuery}
                            placeholder="Buscar por nome ou CPF"
                            aria-label="Buscar minhas famílias"
                            maxLength={120}
                            startIcon={<HugeiconsIcon icon={Search01Icon} strokeWidth={2} />}
                        />
                    </div>
                </div>
            ) : null}

            {pageFamilies.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-xl border bg-background py-12 text-center text-muted-foreground">
                    <HugeiconsIcon icon={SearchAlertIcon} strokeWidth={2} className="size-10 md:size-12" />
                    <span className="text-sm font-medium md:text-lg">
                        {families.length === 0
                            ? "Nenhuma família vinculada a você"
                            : "Nenhuma família encontrada"}
                    </span>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {pageFamilies.map((family) => (
                        <article
                            key={family.id}
                            className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3 transition-colors hover:border-foreground/20"
                        >
                            <Link
                                href={`/minhas-familias/${family.id}`}
                                className="flex min-w-0 flex-1 items-center justify-between gap-3"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{family.name}</p>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {family.ageLabel}
                                        {family.membersCount > 0 ? (
                                            <>
                                                {" "}
                                                <span aria-hidden="true">•</span>{" "}
                                                {family.membersCount === 1
                                                    ? "+1 membro da família"
                                                    : `+${family.membersCount} membros da família`}
                                            </>
                                        ) : null}
                                    </p>
                                </div>
                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    strokeWidth={2}
                                    className="size-4 shrink-0 text-muted-foreground"
                                />
                            </Link>
                        </article>
                    ))}
                </div>
            )}

            {filteredFamilies.length > 0 ? (
                <div className="flex items-center justify-between gap-4 border-t pt-4">
                    <span className="text-sm text-muted-foreground">
                        Página {currentPage} de {pageCount}
                    </span>
                    <div className="flex items-center gap-1">
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
                </div>
            ) : null}
        </div>
    );
}

function normalizeSearchText(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
