"use client";

import { Suspense } from "react";
import Sidebar from "@/components/app/Sidebar";
import Header from "@/components/app/Header";
import { useSidebarStore } from "@/store/sidebar";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebarStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main
        className={clsx(
          "pt-14 transition-all duration-200",
          isOpen ? "ml-60" : "ml-16"
        )}
      >
        <div className="p-6">
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
