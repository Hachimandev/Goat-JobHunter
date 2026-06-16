import { Footer, Header } from "@/app/(main)/components";
import type { Metadata } from "next";
import { AIChatPopup } from "@/components/common/AIChatPopup";

export const metadata: Metadata = {
  title: "GOAT - Job Hunter",
  description: "Tìm công việc tuyệt vời tại GOAT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AIChatPopup />
    </div>
  );
}
