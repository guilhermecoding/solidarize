import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

type InputProps = InputPrimitive.Props & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};

function Input({
  className,
  type,
  startIcon,
  endIcon,
  ...props
}: InputProps) {
  const hasStartIcon = startIcon != null;
  const hasEndIcon = endIcon != null;

  return (
    <div
      data-slot="input-control"
      className="relative w-full min-w-0 has-disabled:opacity-50"
    >
      {hasStartIcon ? (
        <span
          data-slot="input-icon-start"
          className="pointer-events-none absolute inset-y-0 inset-s-0 z-10 flex items-center ps-4 text-muted-foreground [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0 [&>a]:pointer-events-auto [&>button]:pointer-events-auto"
        >
          {startIcon}
        </span>
      ) : null}
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(
          "h-12 w-full min-w-0 rounded-2xl border border-input bg-input/30 px-5 py-2 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-base dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          hasStartIcon && "ps-12",
          hasEndIcon && "pe-12",
          className
        )}
        {...props}
      />
      {hasEndIcon ? (
        <span
          data-slot="input-icon-end"
          className="pointer-events-none absolute inset-y-0 inset-e-0 z-10 flex items-center pe-4 text-muted-foreground [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0 [&>a]:pointer-events-auto [&>button]:pointer-events-auto"
        >
          {endIcon}
        </span>
      ) : null}
    </div>
  );
}

export { Input };
export type { InputProps };
