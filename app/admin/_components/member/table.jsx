"use client";

import { useRouter } from "next/navigation";
import { getInitials } from "@/utils/utils"; // ฟังก์ชันตัดชื่อย่อ เช่น A.P.
import { useTransition } from "react";

export default function MemberTable({ members = [], showActions = false }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // console.log("Members received:", members);
  // console.log("Show actions:", showActions);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 border">รหัสสมาชิก</th>
            <th className="px-4 py-2 border">รูปภาพ</th>
            <th className="px-4 py-2 border">ชื่อ-นามสกุล</th>
            <th className="px-4 py-2 border">อีเมลล์</th>
            <th className="px-4 py-2 border">เทรนเนอร์</th>
            <th className="px-4 py-2 border">สถานะ</th>
            {showActions && <th className="px-4 py-2 border">การจัดการ</th>}
          </tr>
        </thead>
        <tbody>
          {members.length > 0 ? (
            members.map((member) => (
              <tr
                key={member.member_id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() =>
                  router.push(`/admin/members/${member.member_id}`)
                }
              >
                <td className="px-4 py-2 border text-center">
                  {member.member_id}
                </td>
                <td className="px-4 py-2 border text-center">
                  {member.member_profile_image ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden mx-auto">
                      <img
                        src={member.member_profile_image}
                        alt={`${member.member_firstname} ${member.member_lastname}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-indigo-700 text-xl font-bold">
                        {getInitials(
                          member.member_firstname,
                          member.member_lastname
                        )}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {member.member_firstname} {member.member_lastname}
                </td>
                <td className="px-4 py-2 border">{member.member_email}</td>
                <td className="px-4 py-2 border">
                  {member.trainer_firstname} {member.trainer_lastname}
                </td>
                <td className="px-4 py-2 border text-center">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${
                      member.member_status === "active"
                        ? "text-green-600 border-green-600"
                        : member.member_status === "inactive"
                        ? "text-red-600 border-red-600"
                        : "text-yellow-600 border-yellow-600"
                    }`}
                  >
                    {member.member_status === "active"
                      ? "Active"
                      : member.member_status === "inactive"
                      ? "Inactive"
                      : "Pending"}
                  </span>
                </td>

                {showActions && (
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/members/edit/${member.member_id}`);
                      }}
                      className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("ยังไม่ได้เชื่อมการลบ");
                      }}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                    >
                      ลบ
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={showActions ? 7 : 6} className="text-center py-4">
                ไม่มีข้อมูลสมาชิก
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
