"use client";

import { useRouter } from "next/navigation";
import { getInitials } from "@/utils/utils";
import { useTransition, useState, useRef, useEffect, useCallback } from "react";
import StatusBadge from "../common/Status";

// ฟังก์ชัน debounce แบบกำหนดเอง
function customDebounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// คอมโพเนนต์ TableHeader
const TableHeader = ({ sortField, sortOrder, handleSortChange, showActions }) => {
  const debouncedSortChange = useCallback(
    customDebounce((field, event) => {
      event.preventDefault();
      handleSortChange(field);
    }, 300),
    [handleSortChange]
  );

  return (
    <thead className="bg-blue-600 text-white sticky top-0 z-10">
      <tr>
        <th
          className="px-4 py-2 border border-gray-300 cursor-pointer hover:bg-blue-700 transition-colors w-[12%]"
          onClick={(e) => debouncedSortChange("member_id", e)}
        >
          รหัสสมาชิก{" "}
          {sortField === "member_id" && (sortOrder === "asc" ? "↑" : "↓")}
        </th>
        <th className="px-4 py-2 border border-gray-300 w-[12%]">รูปภาพ</th>
        <th
          className="px-4 py-2 border border-gray-300 cursor-pointer hover:bg-blue-700 transition-colors w-[20%]"
          onClick={(e) => debouncedSortChange("member_firstname", e)}
        >
          ชื่อ-นามสกุล{" "}
          {sortField === "member_firstname" && (sortOrder === "asc" ? "↑" : "↓")}
        </th>
        <th className="px-4 py-2 border border-gray-300 w-[20%]">อีเมลล์</th>
        <th className="px-4 py-2 border border-gray-300 w-[20%]">เทรนเนอร์</th>
        <th className="px-4 py-2 border border-gray-300 w-[10%]">สถานะ</th>
        {showActions && (
          <th className="px-4 py-2 border border-gray-300 w-[16%]">การจัดการ</th>
        )}
      </tr>
    </thead>
  );
};

// คอมโพเนนต์ TableSkeleton
const TableSkeleton = ({ showActions }) => (
  <tbody>
    {Array(5)
      .fill()
      .map((_, i) => (
        <tr Hopkins className="border-t border-gray-300">
          <td className="px-4 py-2 border border-gray-300 w-[12%]">
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
          </td>
          <td className="px-4 py-2 border border-gray-300 w-[12%]">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
          </td>
          <td className="px-4 py-2 border border-gray-300 w-[20%]">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </td>
          <td className="px-4 py-2 border border-gray-300 w-[20%]">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </td>
          <td className="px-4 py-2 border border-gray-300 w-[20%]">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </td>
          <td className="px-4 py-2 border border-gray-300 w-[10%]">
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-1/2"></div>
          </td>
          {showActions && (
            <td className="px-4 py-2 border border-gray-300 w-[16%]">
              <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
            </td>
          )}
        </tr>
      ))}
  </tbody>
);

export default function MemberTable({
  members = [],
  showActions = false,
  sortField,
  sortOrder,
  handleSortChange,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      setIsLoading(false);
    };
    fetchData();
  }, [members]);

  return (
    <div className="overflow-x-auto">
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="w-8 h-8 border-4 border-t-4 border-gray-500 rounded-full animate-spin"></div>
        </div>
      )}

      <table className="min-w-full bg-white border border-gray-300 shadow-md table-fixed">
        <TableHeader
          sortField={sortField}
          sortOrder={sortOrder}
          handleSortChange={handleSortChange}
          showActions={showActions}
        />
        {isLoading ? (
          <TableSkeleton showActions={showActions} />
        ) : (
          <tbody>
            {members.length > 0 ? (
              members.map((member) => (
                <tr
                  key={member.member_id}
                  className="hover:bg-gray-100 cursor-pointer border-t border-gray-300"
                  onClick={() =>
                    startTransition(() =>
                      router.push(`/admin/members/${member.member_id}`)
                    )
                  }
                >
                  <td className="px-4 py-2 border border-gray-300 text-center w-[12%]">
                    {member.member_id}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-center w-[12%]">
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
                  <td className="px-4 py-2 border border-gray-300 w-[20%]">
                    {member.member_firstname} {member.member_lastname}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 w-[20%]">
                    {member.member_email}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 w-[20%]">
                    {member.trainer_firstname} {member.trainer_lastname}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-center w-[10%]">
                    <StatusBadge status={member.member_status} />
                  </td>
                  {showActions && (
                    <td className="px-4 py-2 border border-gray-300 text-center space-x-2 w-[16%]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startTransition(() =>
                            router.push(`/admin/members/edit/${member.member_id}`)
                          );
                        }}
                        className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md transition-colors"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("ยังไม่ได้เชื่อมการลบ");
                        }}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                      >
                        ลบ
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showActions ? 7 : 6}
                  className="text-center py-4 border border-gray-300"
                >
                  ไม่มีข้อมูลสมาชิก
                </td>
              </tr>
            )}
          </tbody>
        )}
      </table>
    </div>
  );
}