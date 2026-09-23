"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Cloud,
  ClipboardList,
  FileText,
  Grid3X3,
  LayoutDashboard,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/marketplaces", label: "Marketplaces", icon: Cloud },
  { href: "/products", label: "Products", icon: Package },
  { href: "/progress", label: "Progress", icon: ClipboardList },
  { href: "/matrix", label: "Matrix", icon: Grid3X3 },
  { href: "/risks", label: "Risks", icon: ShieldAlert },
  { href: "/reports", label: "Status report", icon: FileText },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "app-chrome flex h-full shrink-0 select-none flex-col border-r border-border bg-sidebar transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex h-[60px] items-center gap-3 border-b border-border px-3">
        <Link
          href="/"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface shadow-[0px_1px_3px_0px_#00000015,inset_0px_1px_1px_0px_#ffffff40,inset_0px_-1px_3px_0px_#00000025]"
          aria-label="Home"
        >
          <Cloud className="size-4 text-icon-primary" strokeWidth={2.25} />
        </Link>
        {!collapsed ? (
          <Link href="/" className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-text-primary">
              Marketplace Ops
            </p>
            <p className="type-caption truncate">Deployment dashboard</p>
          </Link>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "type-body flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors duration-150",
                active
                  ? "bg-zinc-900 text-white"
                  : "text-text-primary hover:bg-surface-hover",
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0",
                  active ? "text-white" : "text-icon-secondary",
                )}
              />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}

        <div className="my-4 border-t border-divider" />

        <Link
          href="/risks"
          className="type-body flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-error hover:bg-error-soft/30"
        >
          <AlertTriangle className="size-5 shrink-0" />
          {!collapsed ? <span>Critical risks</span> : null}
        </Link>
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="btn-secondary w-full justify-center"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <>
              <PanelLeftClose className="size-4" />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
