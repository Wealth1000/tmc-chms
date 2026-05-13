import { AdminHeader } from "@/components/admin/AdminHeader";
import { HelpFab } from "@/components/cell-dashboard/HelpFab";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none bg-[#0B0E14] text-black">
      <HelpFab />
      <AdminHeader />
      <div className="relative z-0 min-h-0 flex-1 overflow-hidden bg-white">
        <div className="h-full min-h-0 w-full min-w-0 overflow-y-auto overscroll-none">{children}</div>
      </div>
    </div>
  );
}
