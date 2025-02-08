"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname(); // ดึง path ของหน้าปัจจุบัน

  const linkClass = (path) =>
    `relative px-6 py-3 transition-all duration-300 
    ${
      pathname === path
        ? "text-orange-500 font-semibold border-b-2 border-orange-500" // Active: มีเส้นใต้
        : "text-gray-700 hover:text-orange-500 hover:bg-orange-100"
    }`;

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
            <Link href="/admin" className={linkClass("/admin")}>
              หน้าหลัก
            </Link>
            <Link href="/admin/admin_trainer" className={linkClass("/admin/admin_trainer")}>
              รายชื่อผู้ฝึกสอน
            </Link>
            <Link href="/admin/admin_member" className={linkClass("/admin/admin_member")}>
              รายชื่อลูกค้า
            </Link>
            <Link href="/admin/admin_managetrainer" className={linkClass("/admin/admin_managetrainer")}>
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
