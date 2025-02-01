import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <section>
      <nav className="bg-white shadow">
        <div className="flex items-center justify-between py-4 px-6">
          {/* Logo Section */}
          <div className="text-2xl font-bold text-black pl-0">
            <Link href="/admin">Admin Dashboard</Link>
          </div>

          {/* Navigation Links */}
          <div className="space-x-6">
            {/* <Link
              href="/admin/admin_addtrainer"
              className="hover:bg-orange-400 text-black px-4 py-2 rounded-md"
            >
              เพิ่มเทรนเนอร์
            </Link> */}
            <Link
              href="/admin/admin_trainerlist"
              className="hover:bg-orange-400 text-black px-4 py-2 rounded-md"
            >
              Trainer List
            </Link>
            <Link
              href="/admin/admin_memberlist"
              className="hover:bg-orange-400 text-black px-4 py-2 rounded-md"
            >
              Member List
            </Link>
          </div>
        </div>
      </nav>

      {/* Children Content */}
      <main>{children}</main>
    </section>
  );
  
}
