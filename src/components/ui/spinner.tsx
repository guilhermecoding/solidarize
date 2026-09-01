import type { ComponentProps } from "react";

import { DashRing } from "../loading-ui/dash-ring";

export default function Spinner({ className, ...props }: ComponentProps<"svg">) {
    return (
        <DashRing className={className} {...props} />
    );
}
