"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSidebarStore } from "@/store/sidebar";
import { LogOut, User, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";

export default function Header() {
  const router = useRouter();
  const supabase = createClient();
  const { isOpen } = useSidebarStore();
  const [showMenu, setShowMenu] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then((res: { data: { user: { email?: string } | null } }) => {
      setUserEmail(res.data.user?.email ?? null);
    });
  }, [supabase.auth]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      className={clsx(
        "fixed top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md transition-all duration-200",
        isOpen ? "left-60" : "left-16",
        "right-0"
      )}
    >
      <div className="flex items-center gap-3">
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-hover hover:text-foreground lg:hidden">
          <Menu className="h-4 w-4" />
        </button>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
        >
          <User className="h-4 w-4" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-surface py-1 shadow-lg">
            {userEmail && (
              <div className="border-b border-border px-3 py-2">
                <p className="truncate text-sm font-medium text-foreground">{userEmail}</p>
                <p className="text-xs text-text-tertiary">Free Plan</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-surface-hover"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
