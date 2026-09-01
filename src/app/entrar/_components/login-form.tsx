"use client";

import { useState } from "react";
import Mail01Icon from "@hugeicons/core-free-icons/Mail01Icon";
import SquareLock01Icon from "@hugeicons/core-free-icons/SquareLock01Icon";
import ViewIcon from "@hugeicons/core-free-icons/ViewIcon";
import ViewOffSlashIcon from "@hugeicons/core-free-icons/ViewOffSlashIcon";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field, FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [viewPassword, setViewPassword] = useState(false);

  const handleViewPassword = () => {
    setViewPassword((visible) => !visible);
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-young-serif">Boas-vindas</h1>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            required
            startIcon={<HugeiconsIcon icon={Mail01Icon} strokeWidth={1.5} />}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input
            id="password"
            type={viewPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            startIcon={<HugeiconsIcon icon={SquareLock01Icon} strokeWidth={1.5} />}
            endIcon={
              <button
                type="button"
                onClick={handleViewPassword}
                aria-label={viewPassword ? "Ocultar senha" : "Mostrar senha"}
                className="cursor-pointer"
              >
                <HugeiconsIcon
                  icon={!viewPassword ? ViewIcon : ViewOffSlashIcon}
                  strokeWidth={1.5}
                />
              </button>
            }
          />
        </Field>
        <Field>
          <Button type="submit" loadingText="Entrando...">
            Entrar
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
