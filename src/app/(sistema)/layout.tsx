import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { BreadcrumbList } from "@/components/ui/breadcrumb";
import { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { BreadcrumbLink } from "@/components/ui/breadcrumb";
import { BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function SystemLayout({ children }: LayoutProps<"/">) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Build Your Application
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
