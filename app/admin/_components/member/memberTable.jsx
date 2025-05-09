"use client";

import { useRouter } from "next/navigation";
import { getMemberWithTrainer } from "@/actions/admin/member/getMemberWithTrainer";
import {
  useTransition,
  useState,
  useEffect,
  useMemo,
  memo,
  useRef,
  useCallback,
} from "react";
import { getInitials, cn, paginate } from "@/utils/utils";
import StatusBadge from "../common/Status";
import Pagination from "../common/Paginate";
import { Skeleton } from "@/components/ui/skeleton";

function customDebounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const TableHeader = memo(
  ({ sortField, sortOrder, handleSortChange, showActions }) => {
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
            className="px-4 py-2 border border-gray-300 cursor-pointer hover:bg-blue-700 transition-colors w-[15%]"
            onClick={(e) => debouncedSortChange("member_id", e)}
          >
            รหัส{" "}
            {sortField === "member_id" && (sortOrder === "asc" ? "↑" : "↓")}
          </th>
          <th className="px-4 py-2 border border-gray-300 w-[15%]">รูปภาพ</th>
          <th
            className="px-4 py-2 border border-gray-300 cursor-pointer hover:bg-blue-700 transition-colors w-[25%]"
            onClick={(e) => debouncedSortChange("member_firstname", e)}
          >
            ชื่อ-สกุล{" "}
            {sortField === "member_firstname" &&
              (sortOrder === "asc" ? "↑" : "↓")}
          </th>
          <th className="px-4 py-2 border border-gray-300 w-[20%]">อีเมลล์</th>
          <th className="px-4 py-2 border border-gray-300 w-[20%]">
            เทรนเนอร์
          </th>
          <th className="px-4 py-2 border border-gray-300 w-[10%]">สถานะ</th>
        </tr>
      </thead>
    );
  }
);

export default function MemberTable({
  members,
  showActions = false,
  perPage = 10,
}) {
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState("member_id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [localMembers, setLocalMembers] = useState([]);
  const router = useRouter();
  const tableRef = useRef(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      setLocalMembers(members || []);
      setIsLoading(false);
    };
    fetchData();
  }, [members]);

  const sortMembers = (members) => {
    return [...members].sort((a, b) => {
      if (sortField === "member_firstname") {
        const nameA = `${a.member_firstname} ${a.member_lastname}`;
        const nameB = `${b.member_firstname} ${b.member_lastname}`;
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB, "th")
          : nameB.localeCompare(nameA, "th");
      } else if (sortField === "member_id") {
        return sortOrder === "asc"
          ? a.member_id - b.member_id
          : b.member_id - a.member_id;
      }
      return 0;
    });
  };

  const handleSortChange = (field) => {
    scrollPositionRef.current = window.scrollY;
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const sortedMembers = useMemo(
    () => sortMembers(localMembers),
    [localMembers, sortField, sortOrder]
  );
  const pagination = useMemo(
    () => paginate(sortedMembers, currentPage, perPage),
    [sortedMembers, currentPage, perPage]
  );

  useEffect(() => {
    window.scrollTo(0, scrollPositionRef.current);
  }, [sortField, sortOrder, currentPage]);

  return (
    <div className="overflow-x-auto">
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="w-8 h-8 border-4 border-t-4 border-gray-500 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="flex justify-end mb-4 space-x-2">
        <select
          value={sortField}
          onChange={(e) => {
            e.preventDefault();
            handleSortChange(e.target.value);
          }}
          onFocus={(e) => e.target.scrollIntoView({ block: "nearest" })}
          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="member_id">รหัสลูกค้า</option>
          <option value="member_firstname">ชื่อ-สกุล</option>
        </select>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleSortChange(sortField);
          }}
          className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          {sortOrder === "asc" ? "↑ น้อยไปมาก" : "↓ มากไปน้อย"}
        </button>
      </div>

      <table
        ref={tableRef}
        className="min-w-full bg-white border border-gray-300 shadow-md table-fixed"
      >
        <TableHeader
          sortField={sortField}
          sortOrder={sortOrder}
          handleSortChange={handleSortChange}
          showActions={showActions}
        />
        {isLoading ? (
          <tbody>
            {Array(perPage)
              .fill()
              .map((_, i) => (
                <tr key={i} className="border-t border-gray-300">
          <td className="px-4 py-2 border border-gray-300 text-center">
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </td>
          <td className="px-4 py-2 border border-gray-300 text-center">
            <Skeleton className="w-12 h-12 rounded-full mx-auto" />
          </td>
          <td className="px-4 py-2 border border-gray-300 text-center">
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </td>
          <td className="px-4 py-2 border border-gray-300 text-center">
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </td>
          <td className="px-4 py-2 border border-gray-300 text-center">
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </td>
          {showActions && (
            <td className="px-4 py-2 border border-gray-300 text-center">
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </td>
          )}
        </tr>
              ))}
          </tbody>
        ) : (
          <tbody>
            {sortedMembers.length > 0 ? (
              sortedMembers.map((member) => (
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
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={Math.max(1, pagination.totalPages)}
        onPageChange={setCurrentPage}
        disableNavigation={pagination.totalItems <= perPage}
      />
    </div>
  );
}
