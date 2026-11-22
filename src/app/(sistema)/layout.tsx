import { Suspense } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
    MobileBottomNavLoader,
    MobileBottomNavSkeleton,
} from "@/components/mobile-bottom-nav-loader";
import { SidebarInset } from "@/components/ui/sidebar";

export default function SystemLayout({ children }: LayoutProps<"/">) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
            <Suspense fallback={<MobileBottomNavSkeleton />}>
                <MobileBottomNavLoader />
            </Suspense>
        </SidebarProvider>
    );
}
