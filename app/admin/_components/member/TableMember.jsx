"use client";

import { useRouter } from "next/navigation";
import { getInitials } from "@/utils/utils";
import {
  useTransition,
  useState,
  useEffect,
  useMemo,
  memo,
  useRef,
  useCallback,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "../common/Status";

//F กำหนดเวลา
function customDebounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// คอมโพเนนต์ Header
const TableHeader = ({
  sortField,
  sortOrder,
  handleSortChange,
  showActions,
}) => {
  const debouncedSortChange = useCallback(
    customDebounce((field, event) => {
      event.preventDefault();
      handleSortChange(field);
    }, 300),
    [handleSortChange]
  );

  return (
    <div
      className={`grid gap-4 px-6 py-4 text-center bg-slate-100 60rd20-b20order-gray-200 text-sm font-bold text-black uppercase tracking-wider ${
        showActions ? "grid-cols-[50%_20%_20%_10%]" : "grid-cols-[50%_25%_25%]"
      }`}
    >
      <div
        className="flex justify-center items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors"
        onClick={() => handleSortChange("member_id")}
      >
        ลูกค้า {sortField === "member_id" && (sortOrder === "asc" ? "↑" : "↓")}
      </div>
      <div className="flex justify-center items-center">ผู้ฝึกสอน</div>
      <div className="flex justify-center items-center">สถานะ</div>
      {showActions && (
        <div className="flex justify-center items-center">จัดการ</div>
      )}
    </div>
  );
};

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-t-4 border-gray-500 rounded-full animate-spin"></div>
        </div>
      )}

      <TableHeader
        sortField={sortField}
        sortOrder={sortOrder}
        handleSortChange={handleSortChange}
        showActions={showActions}
      />

      <div className="divide-y divide-gray-100">
        {isLoading ? (
          Array(perPage)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                className={`grid gap-10 px-6 py-4 ${
                  showActions
                    ? "grid-cols-[50%_20%_20%_10%]"
                    : "grid-cols-[50%_25%_25%]"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <div className="flex justify-center">
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                {showActions && (
                  <div className="flex justify-center">
                    <Skeleton className="h-6 w-16" />
                  </div>
                )}
              </div>
            ))
        ) : members.length > 0 ? (
          members.map((member) => (
            <div
              key={member.member_id}
              className={`grid gap-4 px-6 py-4 hover:bg-gray-50 transi60on20ol20s cursor-pointer ${
                showActions
                  ? "grid-cols-[50%_20%_20%_10%]"
                  : "grid-cols-[50%_25%_25%]"
              }`}
              onClick={() => router.push(`/admin/members/${member.member_id}`)}
            >
              {/* คอลัมน์ผู้ใช้ (รหัส รูป + ชื่อ + อีเมล) */}
              <div className="flex items-center space-x-3 gap-20 px-8">
                {member.member_id}
                {member.member_profile_image ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={member.member_profile_image}
                      alt={`${member.member_firstname} ${member.member_lastname}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {getInitials(
                        member.member_firstname,
                        member.member_lastname
                      )}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {member.member_firstname} {member.member_lastname}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {member.member_email}
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center">
                {member.trainer_firstname} {member.trainer_lastname}
              </div>

              {/* คอลัมน์สถานะ */}
              <div className="flex justify-center items-center">
                {member.registration_status === "active" ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                    ใช้งาน
                  </span>
                ) : member.registration_status === "pending" ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></div>
                    ยังไม่จ่าย
                  </span>
                ) : member.registration_status === "paid" ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5"></div>
                    จ่ายแล้ว
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></div>
                    หมดอายุ
                  </span>
                )}
              </div>

              {/* ปุ่มจัดการ*/}
              {showActions && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/members/edit/${member.member_id}`);
                    }}
                    className="p-1 text-yellow-400 hover:text-yellow-600 transition-colors"
                  >
                    <Edit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(member.member_id);
                    }}
                    className="p-1 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Delete />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            ไม่มีข้อมูลลูกค้า
          </div>
        )}
      </div>

      {/* <Pagination
        currentPage={pagination.currentPage}
        totalPages={Math.max(1, pagination.totalPages)}
        onPageChange={setCurrentPage}
        disableNavigation={pagination.totalItems <= perPage}
      /> */}
    </div>
  );
}
