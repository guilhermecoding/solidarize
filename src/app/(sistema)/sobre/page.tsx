import AboutComponent from "@/components/pages/about";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sobre",
};

export default function AboutPage() {
    return (
        <AboutComponent />
    );
}
