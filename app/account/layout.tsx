import Link from "next/link";

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-0 min-h-[100dvh] flex-1 flex-col bg-neutral-50 text-black">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Link href="/" className="text-sm font-medium text-neutral-600 no-underline hover:text-black">
            ← Home
          </Link>
          <span className="text-sm font-semibold text-neutral-900">Account</span>
        </div>
      </header>
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
