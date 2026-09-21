"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { signIn } from "@/lib/auth-client";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [viewPassword, setViewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewPassword = () => {
    setViewPassword((visible) => !visible);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const { error: signInError } = await signIn.email({
      email,
      password,
      callbackURL: "/inicio",
    });

    if (signInError) {
      setError(signInError.message ?? "Não foi possível entrar.");
      setLoading(false);
      return;
    }

    router.replace("/inicio");
    router.refresh();
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
            disabled={loading}
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
            disabled={loading}
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
          <Button type="submit" loading={loading} loadingText="Entrando...">
            <HugeiconsIcon icon={LoginCircle02Icon} strokeWidth={2} className="size-5 scale-x-[-1]" />
            Entrar
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
