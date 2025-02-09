"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MemberNavbar() {
  const { id } = useParams();
  const [memberName, setMemberName] = useState("");

  useEffect(() => {
    async function fetchMember() {
      try {
        const res = await fetch(`/api/member/${id}`);
        if (!res.ok) throw new Error("Member not found");
        const data = await res.json();
        setMemberName(data.member?.member_firstname || "สมาชิก");
      } catch (error) {
        console.error("Error fetching member:", error);
      }
    }
    fetchMember();
  }, [id]);

  return (
    <nav className="bg-white shadow-md">
      <div className="flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="text-2xl font-bold text-black">
          <Link href={`/member/${id}/`}>🏋️ Fitness Dashboard</Link>
        </div>

        {/* Navigation Links */}
        <div className="space-x-6">
          <Link
            href={`/member/${id}/`}
            className="px-4 py-2 text-black hover:bg-orange-400 hover:text-white rounded-md"
          >
            หน้าหลัก
          </Link>
          <Link
            href={`/member/${id}/health`}
            className="px-4 py-2 text-black hover:bg-orange-400 hover:text-white rounded-md"
          >
            สุขภาพของฉัน
          </Link>
          <Link
            href={`/member/${id}/goal`}
            className="px-4 py-2 text-black hover:bg-orange-400 hover:text-white rounded-md"
          >
            เป้าหมาย
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("member_id");
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