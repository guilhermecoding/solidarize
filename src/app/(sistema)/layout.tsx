import { Suspense } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
    MobileBottomNavLoader,
    MobileBottomNavSkeleton,
} from "@/components/mobile-bottom-nav-loader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Metadata } from "next";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function SystemLayout({ children }: LayoutProps<"/">) {
    return (
        <TooltipProvider delay={150}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    {children}
                </SidebarInset>
                <Suspense fallback={<MobileBottomNavSkeleton />}>
                    <MobileBottomNavLoader />
                </Suspense>
            </SidebarProvider>
        </TooltipProvider>
    );
}
