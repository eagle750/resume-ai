"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/shared/AuthButton";

export function Navbar() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          ResumeAI
        </Link>
        <nav className="flex items-center gap-4">
          {!isDashboard && (
            <>
              <Link
                href="/pricing"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                href="/tools"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Tools
              </Link>
              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Blog
              </Link>
            </>
          )}
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
