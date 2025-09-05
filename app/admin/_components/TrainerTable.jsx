"use client";

import { useRouter } from "next/navigation";
import { deleteTrainer } from "@/actions/admin/deleteTrainer";
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
import StatusBadge from "./common/Status";
import Edit from "@/components/button/Edit";
import Delete from "@/components/button/Delete";
import Pagination from "./common/Paginate";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteTrainerButton from "./common/DeleteTrainerButton";

// ฟังก์ชัน debounce แบบกำหนดเอง
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
        showActions ? "grid-cols-[70%_15%_15%]" : "grid-cols-[70%_30%]"
      }`}
    >
      <div
        className="flex justify-center items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors"
        onClick={() => handleSortChange("trainer_id")}
      >
        ผู้ฝึกสอน{" "}
        {sortField === "trainer_id" && (sortOrder === "asc" ? "↑" : "↓")}
      </div>
      <div className="flex justify-center items-center">สถานะ</div>
      {showActions && (
        <div className="flex justify-center items-center">จัดการ</div>
      )}
    </div>
  );
};

export default function TrainerTable({
  trainers,
  showActions = false,
  sortField,
  sortOrder,
  handleSortChange,
  perPage = 10,
}) {
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [localTrainers, setLocalTrainers] = useState([]);
  const router = useRouter();
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      setLocalTrainers(trainers || []);
      setIsLoading(false);
    };
    fetchData();
  }, [trainers]);

  // const handleDelete = (id) => {
  //   if (
  //     window.confirm(
  //       "⚠️ คุณต้องการลบผู้ฝึกสอนนี้จริงหรือไม่?\n\nการลบนี้จะไม่สามารถย้อนกลับได้!"
  //     )
  //   ) {
  //     setIsLoading(true);
  //     startTransition(async () => {
  //       const success = await deleteTrainer(id);
  //       if (success) {
  //         alert("ลบสำเร็จ ✅");
  //         window.location.href = "/admin/trainers/manage";
  //       } else {
  //         alert("เกิดข้อผิดพลาดในการลบ ❌");
  //       }
  //       setIsLoading(false);
  //     });
  //   }
  // };

  // const sortTrainers = (trainers) => {
  //   return [...trainers].sort((a, b) => {
  //     if (sortField === "trainer_firstname") {
  //       const nameA = `${a.trainer_firstname} ${a.trainer_lastname}`;
  //       const nameB = `${b.trainer_firstname} ${b.trainer_lastname}`;
  //       return sortOrder === "asc"
  //         ? nameA.localeCompare(nameB, "th")
  //         : nameB.localeCompare(nameA, "th");
  //     } else if (sortField === "trainer_id") {
  //       return sortOrder === "asc"
  //         ? a.trainer_id - b.trainer_id
  //         : b.trainer_id - a.trainer_id;
  //     }
  //     return 0;
  //   });
  // };

  // const handleSortChange = (field) => {
  //   scrollPositionRef.current = window.scrollY;
  //   if (sortField === field) {
  //     setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  //   } else {
  //     setSortField(field);
  //     setSortOrder("asc");
  //   }
  //   setCurrentPage(1);
  // };

  // const sortedTrainers = useMemo(
  //   () => sortTrainers(localTrainers),
  //   [localTrainers, sortField, sortOrder]
  // );
  // const pagination = useMemo(
  //   () => paginate(sortedTrainers, currentPage, perPage),
  //   [sortedTrainers, currentPage, perPage]
  // );

  useEffect(() => {
    window.scrollTo(0, scrollPositionRef.current);
  }, [sortField, sortOrder, currentPage]);

  // ฟังก์ชันสำหรับจัดรูปแบบวันที่
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleDateString("th-TH", {
      month: "short",
    })} ${date.getFullYear() + 543}`;
  };

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
                    ? "grid-cols-[60%_20%_20%]"
                    : "grid-cols-[70%_30%]"
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
                {showActions && (
                  <div className="flex justify-center">
                    <Skeleton className="h-6 w-16" />
                  </div>
                )}
              </div>
            ))
        ) : trainers.length > 0 ? (
          trainers.map((trainer) => (
            <div
              key={trainer.trainer_id}
              className={`grid gap-4 px-6 py-4 hover:bg-gray-50 transi60on20ol20s cursor-pointer ${
                showActions ? "grid-cols-[70%_15%_15%]" : "grid-cols-[70%_30%]"
              }`}
              onClick={() =>
                router.push(`/admin/trainers/${trainer.trainer_id}`)
              }
            >
              {/* คอลัมน์ผู้ใช้ (รหัส รูป + ชื่อ + อีเมล) */}
              <div className="flex items-center space-x-3 gap-20 px-8">
                {trainer.trainer_id}
                {trainer.trainer_profile_image ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={trainer.trainer_profile_image}
                      alt={`${trainer.trainer_firstname} ${trainer.trainer_lastname}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {getInitials(
                        trainer.trainer_firstname,
                        trainer.trainer_lastname
                      )}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {trainer.trainer_firstname} {trainer.trainer_lastname}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {trainer.trainer_email}
                  </div>
                </div>
              </div>

              {/* คอลัมน์สถานะ */}
              <div className="flex justify-center items-center">
                {trainer.trainer_status === "active" ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                    ใช้งาน
                  </span>
                ) : trainer.trainer_status === "pending" ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></div>
                    รอดำเนินการ
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
                      router.push(`/admin/trainers/edit/${trainer.trainer_id}`);
                    }}
                    className="p-1 text-yellow-400 hover:text-yellow-600 transition-colors"
                  >
                    <Edit />
                  </button>
                  <DeleteTrainerButton
                    trainerId={trainer.trainer_id}
                    onDeleted={(id) =>
                      setLocalTrainers((prev) =>
                        prev.filter((t) => t.trainer_id !== id)
                      )
                    }
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            ไม่มีข้อมูลผู้ฝึกสอน
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
