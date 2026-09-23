"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Overview" },
  { href: "/matrix", label: "Matrix" },
  { href: "/products", label: "Products" },
  { href: "/reports", label: "Status report" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="app-chrome sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-between gap-4 px-6">
        <div className="flex select-none items-center gap-3">
          <div
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface shadow-[0px_1px_3px_0px_#00000015,inset_0px_1px_1px_0px_#ffffff40,inset_0px_-1px_3px_0px_#00000025]"
            aria-hidden
          >
            <Cloud className="size-4 text-icon-primary" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-text-primary">
              Marketplace Ops
            </p>
            <p className="type-caption hidden sm:block">Deployment status</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "type-body rounded-lg px-3 py-2 font-medium transition-colors duration-150",
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-text-primary hover:bg-surface-hover",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
