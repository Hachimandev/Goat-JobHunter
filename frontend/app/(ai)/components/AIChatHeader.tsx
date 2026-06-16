import { UserPopup } from "@/app/(main)/components";
import Image from "next/image";
import Link from "next/link";

export function AIChatHeader() {
  return (
    <header className="h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-6">
      <div className="flex items-center justify-between gap-2 -ml-2">
        <Link href="/chat" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="GOAT Logo"
            className=""
            width={80}
            height={80}
          />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <UserPopup />
      </div>
    </header>
  );
}