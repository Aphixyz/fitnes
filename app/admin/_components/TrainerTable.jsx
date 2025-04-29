"use client";

import { useRouter } from "next/navigation";
import { deleteTrainer } from "@/actions/admin/deleteTrainer";
import { useTransition, useState, useEffect, useMemo, memo, useRef, useCallback } from "react";
import { getInitials } from "@/utils/utils";
import StatusBadge from "./common/Status";
import Edit from "@/components/button/Edit";
import Delete from "@/components/button/Delete";
import Pagination from "./common/Paginate";
import { paginate } from "@/utils/utils";

// ฟังก์ชัน debounce แบบกำหนดเอง (ไม่ต้องติดตั้ง lodash)
function customDebounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// คอมโพเนนต์ TableHeader
const TableHeader = memo(({ sortField, sortOrder, handleSortChange, showActions }) => {
  const debouncedSortChange = useCallback(
    customDebounce((field, event) => {
      event.preventDefault(); // ป้องกัน default browser behavior
      handleSortChange(field);
    }, 300),
    [handleSortChange]
  );

  return (
    <thead className="bg-blue-600 text-white sticky top-0 z-10">
      <tr>
        <th
          className="px-4 py-2 border border-gray-300 cursor-pointer hover:bg-blue-700 transition-colors w-[15%]"
          onClick={(e) => debouncedSortChange("trainer_id", e)}
        >
          รหัส {sortField === "trainer_id" && (sortOrder === "asc" ? "↑" : "↓")}
        </th>
        <th className="px-4 py-2 border border-gray-300 w-[15%]">รูปภาพ</th>
        <th
          className="px-4 py-2 border border-gray-300 cursor-pointer hover:bg-blue-700 transition-colors w-[25%]"
          onClick={(e) => debouncedSortChange("trainer_firstname", e)}
        >
          ชื่อ-สกุล{" "}
          {sortField === "trainer_firstname" && (sortOrder === "asc" ? "↑" : "↓")}
        </th>
        <th className="px-4 py-2 border border-gray-300 w-[15%]">ประสบการณ์(ปี)</th>
        <th className="px-4 py-2 border border-gray-300 w-[15%]">สถานะ</th>
        {showActions && (
          <th className="px-4 py-2 border border-gray-300 w-[15%]">การจัดการ</th>
        )}
      </tr>
    </thead>
  );
});

// คอมโพเนนต์ TableSkeleton
const TableSkeleton = ({ perPage, showActions }) => (
  <tbody>
    {Array(perPage).fill().map((_, i) => (
      <tr key={i} className="border-t border-gray-300">
        <td className="px-4 py-2 border border-gray-300 w-[15%]">
          <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
        </td>
        <td className="px-4 py-2 border border-gray-300 w-[15%]">
          <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
        </td>
        <td className="px-4 py-2 border border-gray-300 w-[25%]">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </td>
        <td className="px-4 py-2 border border-gray-300 w-[15%]">
          <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-1/2"></div>
        </td>
        <td className="px-4 py-2 border border-gray-300 w-[15%]">
          <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-1/2"></div>
        </td>
        {showActions && (
          <td className="px-4 py-2 border border-gray-300 w-[15%]">
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
          </td>
        )}
      </tr>
    ))}
  </tbody>
);

export default function TrainerTable({
  trainers,
  showActions = false,
  perPage = 10,
}) {
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState("trainer_id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [localTrainers, setLocalTrainers] = useState([]);
  const router = useRouter();
  const tableRef = useRef(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      setLocalTrainers(trainers || []);
      setIsLoading(false);
    };
    fetchData();
  }, [trainers]);

  const handleDelete = (id) => {
    if (confirm("ยืนยันการลบ?")) {
      setIsLoading(true);
      
      startTransition(async () => {
        const success = await deleteTrainer(id);
        
        if (success) {
          // อัพเดท localTrainers ทันทีเพื่อให้ UI แสดงข้อมูลที่เป็นปัจจุบัน
          setLocalTrainers(prevTrainers => 
            prevTrainers.filter(trainer => trainer.trainer_id !== id)
          );
          alert("ลบสำเร็จ ✅");
          
          // ปรับปรุงหน้าแสดงผลด้วย router.refresh()
          router.refresh();
        } else {
          alert("เกิดข้อผิดพลาดในการลบ ❌");
        }
        
        setIsLoading(false);
      });
    }
  };

  const sortTrainers = (trainers) => {
    return [...trainers].sort((a, b) => {
      if (sortField === "trainer_firstname") {
        const nameA = `${a.trainer_firstname} ${a.trainer_lastname}`;
        const nameB = `${b.trainer_firstname} ${b.trainer_lastname}`;
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB, "th")
          : nameB.localeCompare(nameA, "th");
      } else if (sortField === "trainer_id") {
        return sortOrder === "asc"
          ? a.trainer_id - b.trainer_id
          : b.trainer_id - a.trainer_id;
      }
      return 0;
    });
  };

  const handleSortChange = (field) => {
    scrollPositionRef.current = window.scrollY; // บันทึกตำแหน่ง scroll
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // ใช้ localTrainers แทน trainers เพื่อให้ UI อัพเดทเมื่อมีการลบ
  const sortedTrainers = useMemo(() => sortTrainers(localTrainers), [localTrainers, sortField, sortOrder]);
  const pagination = useMemo(() => paginate(sortedTrainers, currentPage, perPage), [sortedTrainers, currentPage, perPage]);

  useEffect(() => {
    window.scrollTo(0, scrollPositionRef.current); // คืนค่าตำแหน่ง scroll
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
          <option value="trainer_id">รหัสผู้ฝึกสอน</option>
          <option value="trainer_firstname">ชื่อ-สกุล</option>
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
          <TableSkeleton perPage={perPage} showActions={showActions} />
        ) : (
          <tbody>
            {pagination.data.length > 0 ? (
              pagination.data.map((trainer) => (
                <tr
                  key={trainer.trainer_id}
                  className="hover:bg-gray-100 cursor-pointer border-t border-gray-300"
                  onClick={() =>
                    router.push(`/admin/trainers/${trainer.trainer_id}`)
                  }
                >
                  <td className="px-4 py-2 border border-gray-300 text-center w-[15%]">
                    {trainer.trainer_id}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-center w-[15%]">
                    {trainer.trainer_profile_image ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden mx-auto">
                        <img
                          src={trainer.trainer_profile_image}
                          alt={`${trainer.trainer_firstname} ${trainer.trainer_lastname}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-indigo-700 text-xl font-bold">
                          {getInitials(
                            trainer.trainer_firstname,
                            trainer.trainer_lastname
                          )}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 w-[25%]">
                    {trainer.trainer_firstname} {trainer.trainer_lastname}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-center w-[15%]">
                    {trainer.trainer_exp}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-center w-[15%]">
                    <StatusBadge status={trainer.trainer_status} />
                  </td>
                  {showActions && (
                    <td className="px-4 py-2 border border-gray-300 text-center space-x-2 w-[15%]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/admin/trainers/edit/${trainer.trainer_id}`
                          );
                        }}
                        className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md transition-colors"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(trainer.trainer_id);
                        }}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                      >
                        <Delete />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showActions ? 6 : 5}
                  className="text-center py-4 border border-gray-300"
                >
                  ไม่มีข้อมูลเทรนเนอร์
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