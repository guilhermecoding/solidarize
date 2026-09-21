"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import Mail01Icon from "@hugeicons/core-free-icons/Mail01Icon";
import SquareLock01Icon from "@hugeicons/core-free-icons/SquareLock01Icon";
import ViewIcon from "@hugeicons/core-free-icons/ViewIcon";
import ViewOffSlashIcon from "@hugeicons/core-free-icons/ViewOffSlashIcon";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field, FieldGroup
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoginCircle02Icon } from "@hugeicons/core-free-icons";
import { loginAction } from "@/app/entrar/action";

function firstValidationMessage(validationErrors: unknown): string | undefined {
  if (!validationErrors || typeof validationErrors !== "object") {
    return undefined;
  }

  const record = validationErrors as Record<string, unknown>;
  const formErrors = record._errors;

  if (Array.isArray(formErrors) && typeof formErrors[0] === "string") {
    return formErrors[0];
  }

  for (const value of Object.values(record)) {
    if (!value || typeof value !== "object" || !("_errors" in value)) {
      continue;
    }

    const fieldErrors = (value as { _errors?: unknown })._errors;
    if (Array.isArray(fieldErrors) && typeof fieldErrors[0] === "string") {
      return fieldErrors[0];
    }
  }

  return undefined;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [viewPassword, setViewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { execute, isPending } = useAction(loginAction, {
    onExecute: () => {
      setError(null);
    },
    onSuccess: ({ data }) => {
      if (!data.ok) {
        setError(data.message);
        return;
      }

      router.replace("/inicio");
      router.refresh();
    },
    onError: ({ error: actionError }) => {
      setError(
        actionError.serverError
          ?? firstValidationMessage(actionError.validationErrors)
          ?? "Não foi possível entrar."
      );
    },
  });

  const handleViewPassword = () => {
    setViewPassword((visible) => !visible);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    execute({
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    });
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-young-serif">Boas-vindas!</h1>
          <p className="text-sm text-muted-foreground">Entre para fazer o bem</p>
        </div>
        <Field>

          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            disabled={isPending}
            startIcon={<HugeiconsIcon icon={Mail01Icon} strokeWidth={1.5} />}
          />
        </Field>
        <Field>

          <Input
            id="password"
            name="password"
            type={viewPassword ? "text" : "password"}
            placeholder="Senha"
            autoComplete="current-password"
            required
            disabled={isPending}
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
        {error ? (
          <p className="text-sm text-destructive text-center" role="alert">
            {error}
          </p>
        ) : null}
        <Field>
          <Button type="submit" loading={isPending} loadingText="Entrando...">
            <HugeiconsIcon icon={LoginCircle02Icon} strokeWidth={2} className="size-5 scale-x-[-1]" />
            Entrar
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
