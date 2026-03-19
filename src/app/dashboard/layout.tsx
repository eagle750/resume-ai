import Link from "next/link";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/dashboard", label: "Tailor" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r bg-muted/30 p-4 flex flex-col">
        <Link href="/dashboard" className="font-semibold mb-6">
          ResumeAI
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-md text-sm hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-6 md:p-8">{children}</div>
    </div>
  );
}
