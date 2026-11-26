"use client";

import { useState } from "react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QuantityStepperProps = {
    id: string;
    name: string;
    value: number;
    min?: number;
    max?: number;
    disabled?: boolean;
    invalid?: boolean;
    onChange: (value: number) => void;
    onBlur?: () => void;
};

/**
 * Campo numérico com botões de incremento/decremento e edição direta.
 */
export function QuantityStepper({
    id,
    name,
    value,
    min = 1,
    max,
    disabled = false,
    invalid = false,
    onChange,
    onBlur,
}: QuantityStepperProps) {
    const [draft, setDraft] = useState<string | null>(null);
    const displayedValue = draft ?? String(value);

    function clamp(next: number): number {
        const lower = Math.max(min, next);
        return max !== undefined ? Math.min(max, lower) : lower;
    }

    function step(delta: number) {
        setDraft(null);
        onChange(clamp(value + delta));
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 border-input"
                aria-label="Diminuir quantidade"
                disabled={disabled || value <= min}
                onClick={() => step(-1)}
            >
                <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} className="size-4" />
            </Button>
            <Input
                id={id}
                name={name}
                inputMode="numeric"
                className="text-center font-semibold tabular-nums"
                value={displayedValue}
                disabled={disabled}
                aria-invalid={invalid || undefined}
                onFocus={() => setDraft(String(value))}
                onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "");
                    setDraft(digits);

                    if (digits === "") {
                        return;
                    }

                    const parsed = Number.parseInt(digits, 10);

                    if (Number.isFinite(parsed) && parsed >= min) {
                        onChange(clamp(parsed));
                    }
                }}
                onBlur={() => {
                    const parsed = Number.parseInt(draft ?? "", 10);
                    const next = Number.isFinite(parsed) ? clamp(parsed) : min;
                    setDraft(null);
                    onChange(next);
                    onBlur?.();
                }}
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 border-input"
                aria-label="Aumentar quantidade"
                disabled={disabled || (max !== undefined && value >= max)}
                onClick={() => step(1)}
            >
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
            </Button>
        </div>
    );
}
