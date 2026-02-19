"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  ListChecks,
  TrendingUp,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Mic,
  Database,
  FileText,
  Shield,
  DollarSign,
  FlaskConical,
} from "lucide-react";
import { useSidebarStore } from "@/store/sidebar";
import clsx from "clsx";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "PRD Generator", href: "/prd", icon: FileText },
  { label: "AI Chat", href: "/chat", icon: MessageSquare },
  { label: "Voice Command", href: "/chat?voice=true", icon: Mic },
  { label: "Backlog", href: "/backlog", icon: ListChecks },
  { label: "Context Vault", href: "/context-vault", icon: Database },
  { label: "AI Review", href: "/ai-review", icon: Shield },
  { label: "Business Case", href: "/business-case", icon: DollarSign },
  { label: "A/B Tests", href: "/experiments", icon: FlaskConical },
  { label: "Voice Studio", href: "/voice-studio", icon: Mic },
  { label: "Market Analysis", href: "/market-analysis", icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface transition-all duration-200",
        isOpen ? "w-60" : "w-16"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {isOpen && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
              P
            </span>
            <span className="text-base font-bold text-foreground">Prodacto</span>
          </Link>
        )}
        <button
          onClick={toggle}
          className={clsx(
            "flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-hover hover:text-foreground",
            !isOpen && "mx-auto"
          )}
        >
          {isOpen ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-surface-hover hover:text-foreground",
                !isOpen && "justify-center px-0"
              )}
            >
              <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-2 py-3">
        <Link
          href="/settings"
          className={clsx(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground",
            !isOpen && "justify-center px-0"
          )}
        >
          <Settings className="h-4.5 w-4.5 flex-shrink-0" />
          {isOpen && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
