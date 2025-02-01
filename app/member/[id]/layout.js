import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <section>
      <nav className="bg-white shadow">
        <div className="flex items-center justify-between py-4 px-6">
          {/* Logo Section */}
          <div className="text-2xl font-bold text-black pl-0">
            <Link href="/admin">Member Dashboard</Link>
          </div>

        </div>
      </nav>

      {/* Children Content */}
      <main>{children}</main>
    </section>
  );
  
}
