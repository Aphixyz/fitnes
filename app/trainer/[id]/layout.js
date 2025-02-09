"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export default function TrainerLayout({ children }) {
  const pathname = usePathname();
  const { id } = useParams();

  const linkClass = (path) =>
    `relative px-6 py-3 transition-all duration-300 ${
      pathname === path
        ? "text-orange-500 font-semibold border-b-2 border-orange-500"
        : "text-gray-700 hover:text-orange-500 hover:bg-orange-100"
    }`;

  return (
    <section>
      <nav className="bg-white shadow">
        <div className="flex items-center justify-between py-4 px-6">
          {/* Logo */}
          <div className="text-2xl font-bold text-black">
            <Link href={`/trainer/${id}`}>Trainer Dashboard</Link>
          </div>

          {/* Navigation Links */}
          <div className="space-x-6">
            <Link href={`/trainer/${id}`} className={linkClass(`/trainer/${id}/dashboard`)}>
              หน้าหลัก
            </Link>
            <Link href={`/trainer/${id}/members`} className={linkClass(`/trainer/${id}/members`)}>
              ลูกค้าของฉัน
            </Link>
            <Link href={`/trainer/${id}/member-manage`} className={linkClass(`/trainer/${id}/member-manage`)}>
              จัดการลูกค้า
            </Link>
            <Link href={`/trainer/${id}/profile`} className={linkClass(`/trainer/${id}/profile`)}>
              โปรไฟล์ของฉัน
            </Link>
          </div>
        </div>
      </nav>

      {/* Children Content */}
      <main>{children}</main>
    </section>
  );
}