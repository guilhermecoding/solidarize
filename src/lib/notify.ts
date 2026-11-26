"use client";

import { toast } from "@/components/ui/toast";

/**
 * Exibe uma notificação (toast).
 * @param type - O tipo da notificação.
 * @param title - O título da notificação.
 */
export function notify(type: "success" | "error" | "info", title: string) {
    toast.add({ title, type });
}
