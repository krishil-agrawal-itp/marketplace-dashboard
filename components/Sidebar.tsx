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
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "marketplaces", label: "Marketplaces", icon: Cloud },
  { id: "products", label: "Products", icon: Package },
  { id: "progress", label: "Progress", icon: ClipboardList },
  { id: "matrix", label: "Matrix", icon: Grid3X3 },
  { id: "risks", label: "Risks", icon: ShieldAlert },
  { id: "report", label: "Status report", icon: FileText },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export function scrollToSection(id: SectionId | string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

export function Sidebar() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onProductDetail = pathname.startsWith("/products/");
  const [active, setActive] = useState<string>(
    onProductDetail ? "products" : "overview",
  );
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!onHome) {
      setActive(onProductDetail ? "products" : "overview");
      return;
    }

    const ids = sections.map((s) => s.id);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    const hash = window.location.hash.replace("#", "");
    if (hash && ids.includes(hash as SectionId)) {
      setTimeout(() => scrollToSection(hash), 80);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, [onHome, onProductDetail]);

  function goToSection(id: SectionId) {
    if (onHome) {
      scrollToSection(id);
      return;
    }
    window.location.href = `/#${id}`;
  }

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
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = active === section.id;
          return (
            <button
              key={section.id}
              type="button"
              title={section.label}
              onClick={() => goToSection(section.id)}
              className={cn(
                "type-body flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors duration-150",
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-text-primary hover:bg-surface-hover",
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0",
                  isActive ? "text-white" : "text-icon-secondary",
                )}
              />
              {!collapsed ? <span className="truncate">{section.label}</span> : null}
            </button>
          );
        })}

        <div className="my-4 border-t border-divider" />

        <button
          type="button"
          onClick={() => goToSection("risks")}
          className="type-body flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium text-error hover:bg-error-soft/30"
        >
          <AlertTriangle className="size-5 shrink-0" />
          {!collapsed ? <span>Critical risks</span> : null}
        </button>
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
