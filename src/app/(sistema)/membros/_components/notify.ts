"use client";

import { toast } from "@/components/ui/toast";

export function notify(type: "success" | "error" | "info", title: string) {
    toast.add({ title, type });
}
