import type { ReactNode } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    aidTypeLabels,
    beneficiaryGenderLabels,
    beneficiaryStatusLabels,
    employmentLabels,
    maritalStatusLabels,
    type BeneficiaryRecord,
} from "@/services/beneficiary/beneficiary.type";

const EMPTY = "Não informado";

export function BeneficiaryRecordView({ beneficiary }: { beneficiary: BeneficiaryRecord }) {
    const rows = titularRows(beneficiary);

    return (
        <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-3">
                <h2 className="text-lg font-medium">Informações do Titular</h2>
                <div className="overflow-hidden rounded-xl border bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Campo</TableHead>
                                <TableHead>Informação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.label} className="odd:bg-background even:bg-muted/50">
                                    <TableCell className="font-medium whitespace-normal">{row.label}</TableCell>
                                    <TableCell className="whitespace-normal">{row.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>
            <section className="flex flex-col gap-3">
                <h2 className="text-lg font-medium">Membros da Família</h2>
                {beneficiary.members.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum membro familiar do titular registrado</p>
                ) : (
                    <div className="overflow-hidden rounded-xl border bg-background">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Nome</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {beneficiary.members.map((member) => (
                                    <TableRow key={member.id} className="odd:bg-background even:bg-muted/50">
                                        <TableCell className="whitespace-normal">
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.kinshipLabel}</p>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </section>
        </div>
    );
}

function titularRows(beneficiary: BeneficiaryRecord): Array<{ label: string; value: ReactNode }> {
    return [
        { label: "Nome Completo", value: beneficiary.name },
        { label: "CPF", value: text(beneficiary.cpf) },
        { label: "E-mail", value: text(beneficiary.email) },
        { label: "Contatos", value: <ContactList contacts={beneficiary.contacts} /> },
        { label: "Data de Nascimento", value: beneficiary.dateOfBirth },
        { label: "Idade", value: beneficiary.ageLabel },
        { label: "Gênero", value: beneficiaryGenderLabels[beneficiary.gender] },
        { label: "Estado Civil", value: maritalStatusLabels[beneficiary.maritalStatus] },
        { label: "Rua", value: beneficiary.street },
        { label: "Bairro", value: beneficiary.neighborhood },
        { label: "Cidade", value: beneficiary.city },
        { label: "UF", value: beneficiary.state },
        { label: "Trabalho", value: employmentLabels[beneficiary.employment] },
        { label: "Profissão", value: beneficiary.employment === "employed" ? text(beneficiary.profession) : EMPTY },
        { label: "Situação", value: beneficiaryStatusLabels[beneficiary.status] },
        { label: "Tipo de Auxílio", value: aidTypeLabels[beneficiary.aidType] },
        { label: "Observações", value: text(beneficiary.notes) },
    ];
}

function ContactList({ contacts }: { contacts: string[] }) {
    if (contacts.length === 0) {
        return EMPTY;
    }

    return (
        <div className="flex flex-col">
            {contacts.map((contact, index) => (
                <span key={`${contact}-${index}`}>{contact}</span>
            ))}
        </div>
    );
}

function text(value: string) {
    return value.trim() === "" ? EMPTY : value;
}
