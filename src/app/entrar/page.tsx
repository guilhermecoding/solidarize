import { LoginForm } from "@/app/entrar/_components/login-form";
import IconLogo from "@/components/logo/icon-logo";
import TextLogo from "@/components/logo/text-logo";
import type { Metadata } from "next";
import Image from "next/image";
import CopyReference from "./_components/copy-reference";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/login-image.png"
          alt="Image"
          width={1000}
          height={1000}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
          loading="eager"
        />
      </div>

      <div className="flex flex-col items-center justify-center p-6 md:p-10">
        <div className="flex flex-col gap-10 w-full">
          <div className="flex justify-center gap-2">
            <div className="flex items-center gap-2">
              <IconLogo className="size-12" />
              <TextLogo className="text-3xl" />
            </div>
          </div>
          <div className="flex flex-1 items-start justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
          <div>
            <CopyReference />
          </div>
        </div>
      </div>

    </div>
  );
}
