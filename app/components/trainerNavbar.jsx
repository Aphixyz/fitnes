"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TrainerNavbar() {
  const pathname = usePathname();
  const [trainerId, setTrainerId] = useState(null);

  useEffect(() => {
    // ดึง trainer_id จาก localStorage หรือ auth API
    const storedTrainerId = localStorage.getItem("trainer_id"); 
    if (storedTrainerId) {
      setTrainerId(storedTrainerId);
    }
  }, []);

  return (
    <nav className="bg-white shadow-md">
      <div className="flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="text-2xl font-bold text-black">
          <Link href={trainerId ? `/trainer/${trainerId}/dashboard` : "#"}>
            🏋️ Fitness Tracker
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="space-x-6">
          <Link
            href={trainerId ? `/trainer/${trainerId}/dashboard` : "#"}
            className={`px-4 py-2 rounded-md transition duration-300 ${
              pathname === `/trainer/${trainerId}/dashboard`
                ? "bg-orange-500 text-white"
                : "text-black hover:bg-orange-400 hover:text-white"
            }`}
          >
            หน้าหลัก
          </Link>

          <Link
            href={trainerId ? `/trainer/${trainerId}/members` : "#"}
            className={`px-4 py-2 rounded-md transition duration-300 ${
              pathname === `/trainer/${trainerId}/members`
                ? "bg-orange-500 text-white"
                : "text-black hover:bg-orange-400 hover:text-white"
            }`}
          >
            ลูกค้าของฉัน
          </Link>

          <Link
            href={trainerId ? `/trainer/${trainerId}/profile` : "#"}
            className={`px-4 py-2 rounded-md transition duration-300 ${
              pathname === `/trainer/${trainerId}/profile`
                ? "bg-orange-500 text-white"
                : "text-black hover:bg-orange-400 hover:text-white"
            }`}
          >
            โปรไฟล์ของฉัน
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("trainer_id");
              window.location.href = "/login";
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>
  );
}