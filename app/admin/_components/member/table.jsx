"use client";

import { useRouter } from "next/navigation";
import { getInitials } from "@/utils/utils";
import { useTransition, useState } from "react";
import StatusBadge from "../common/Status";

export default function MemberTable({ members = [], showActions = false }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sortField, setSortField] = useState("member_id"); // Default sort by ID
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order

  // Function to sort members
  const sortMembers = (members) => {
    return [...members].sort((a, b) => {
      if (sortField === "member_firstname") {
        // Sort by first name + last name
        const nameA = `${a.member_firstname} ${a.member_lastname}`;
        const nameB = `${b.member_firstname} ${b.member_lastname}`;
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB, "th") // Thai locale for sorting
          : nameB.localeCompare(nameA, "th");
      } else if (sortField === "member_id") {
        // Sort by member ID
        return sortOrder === "asc"
          ? a.member_id - b.member_id
          : b.member_id - a.member_id;
      }
      return 0;
    });
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Sort the members
  const sortedMembers = sortMembers(members);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 shadow-md">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th
              className="px-4 py-2 border cursor-pointer"
              onClick={() => handleSortChange("member_id")}
            >
              รหัสสมาชิก{" "}
              {sortField === "member_id" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="px-4 py-2 border">รูปภาพ</th>
            <th
              className="px-4 py-2 border cursor-pointer"
              onClick={() => handleSortChange("member_firstname")}
            >
              ชื่อ-นามสกุล{" "}
              {sortField === "member_firstname" &&
                (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="px-4 py-2 border">อีเมลล์</th>
            <th className="px-4 py-2 border">เทรนเนอร์</th>
            <th className="px-4 py-2 border">สถานะ</th>
            {showActions && <th className="px-4 py-2 border">การจัดการ</th>}
          </tr>
        </thead>
        <tbody>
          {sortedMembers.length > 0 ? (
            sortedMembers.map((member) => (
              <tr
                key={member.member_id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() =>
                  startTransition(() =>
                    router.push(`/admin/members/${member.member_id}`)
                  )
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
                  <StatusBadge status={member.member_status} />
                </td>
                {showActions && (
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startTransition(() =>
                          router.push(`/admin/members/edit/${member.member_id}`)
                        );
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