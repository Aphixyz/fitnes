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
            <Link
              href="/admin"
              className="hover:bg-orange-400 hover:text-white text-black px-4 py-2 rounded-md transition-colors duration-300"
            >
              หน้าหลัก
            </Link>
            <Link
              href="/admin/admin_trainer"
              className="hover:bg-orange-400 hover:text-white text-black px-4 py-2 rounded-md transition-colors duration-300"
            >
              รายชื่อผู้ฝึกสอน
            </Link>
            <Link
              href="/admin/admin_member"
              className="hover:bg-orange-400 hover:text-white text-black px-4 py-2 rounded-md transition-colors duration-300"
            >
              รายชื่อลูกค้า
            </Link>
            <Link
              href="/admin/admin_managetrainer"
              className="hover:bg-orange-400 hover:text-white text-black px-4 py-2 rounded-md transition-colors duration-300"
            >
              การจัดการผู้ฝึกสอน
            </Link>
          </div>
        </div>
      </nav>

      {/* Children Content */}
      <main>{children}</main>
    </section>
  );
}
