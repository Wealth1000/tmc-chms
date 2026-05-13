"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderProfileMenu } from "@/components/cell-dashboard/HeaderProfileMenu";
import { IconBarChart, IconLayoutGrid } from "@/components/cell-dashboard/icons";

export function AdminHeader() {
  const pathname = usePathname();
  const isReports = pathname.startsWith("/admin/reports");
  const isDashboard =
    (pathname === "/admin" ||
      pathname.startsWith("/admin/members") ||
      pathname.startsWith("/admin/cells")) &&
    !isReports;

  return (
    <header className="relative z-30 shrink-0 overflow-visible border-b border-white/10 bg-[#0B0E14] px-4 py-3 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 no-underline touch-manipulation"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold tracking-tight text-white">
            CG
          </span>
          <span className="text-base font-semibold text-white">Cell Groups</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
            <Link
              href="/admin"
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium no-underline transition touch-manipulation ${
                isDashboard ? "bg-white text-black" : "text-white/75 hover:bg-white/10"
              }`}
            >
              <IconLayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href="/admin/reports"
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium no-underline transition touch-manipulation ${
                isReports ? "bg-white text-black" : "text-white/75 hover:bg-white/10"
              }`}
            >
              <IconBarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </Link>
          </nav>
          <HeaderProfileMenu />
        </div>
      </div>
    </header>
  );
}
