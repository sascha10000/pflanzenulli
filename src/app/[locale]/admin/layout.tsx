import { auth } from "@/modules/auth/config";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user as Record<string, unknown>).role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-gray-50 p-4">
        <h2 className="mb-4 text-lg font-bold">Admin</h2>
        <nav className="space-y-1">
          <AdminNavLink href="/admin">Dashboard</AdminNavLink>
          <AdminNavLink href="/admin/users">Users</AdminNavLink>
          <AdminNavLink href="/admin/listings">Listings</AdminNavLink>
          <AdminNavLink href="/admin/reports">Reports</AdminNavLink>
          <AdminNavLink href="/admin/species">Species</AdminNavLink>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

function AdminNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded px-3 py-2 text-sm hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}
