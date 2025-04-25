"use client";

import { useRouter } from "next/navigation";
import { deleteTrainer } from "@/actions/admin/deleteTrainer";
import { useTransition, useState } from "react";
import { getInitials } from "@/utils/utils";
import StatusBadge from "./common/Status";
import Edit from "@/components/button/Edit";
import Delete from "@/components/button/Delete";
import Pagination from "./common/Paginate";
import { paginate } from "@/utils/utils";
import { useEffect } from "react";

export default function TrainerTable({
  trainers,
  showActions = false,
  perPage = 10,
}) {
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);  // Add loading state
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);  // Start loading when component mounts or data is refreshed
    const fetchData = async () => {
      // You can add any logic here to fetch new data when the page is refreshed
      // For example, calling an API to get fresh data
      setIsLoading(false);  // Stop loading once the data is fetched
    };
    fetchData();
  }, [trainers]);

  const handleDelete = (id) => {
    if (confirm("ยืนยันการลบ?")) {
      setIsLoading(true);  // Set loading state to true before the action
      startTransition(async () => {
        const success = await deleteTrainer(id);
        setIsLoading(false);  // Set loading state back to false after the action
        if (success) {
          alert("ลบสำเร็จ ✅");
          router.refresh(); // โหลดข้อมูลใหม่
        } else {
          alert("เกิดข้อผิดพลาดในการลบ ❌");
        }
      });
    }
  };


  const pagination = paginate(trainers || [], currentPage, perPage);

  return (
    <div className="overflow-x-auto">
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="w-8 h-8 border-4 border-t-4 border-gray-500 rounded-full animate-spin"></div>
        </div>
      )}

      <table className="min-w-full bg-white border border-gray-300 shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 border">รหัส</th>
            <th className="px-4 py-2 border">รูปภาพ</th>
            <th className="px-4 py-2 border">ชื่อ-สกุล</th>
            <th className="px-4 py-2 border">ประสบการณ์(ปี)</th>
            <th className="px-4 py-2 border">สถานะ</th>
            {showActions && <th className="px-4 py-2 border">การจัดการ</th>}
          </tr>
        </thead>
        <tbody>
          {pagination.data.length > 0 ? (
            pagination.data.map((trainer) => (
              <tr
                key={trainer.trainer_id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() =>
                  router.push(`/admin/trainers/${trainer.trainer_id}`)
                }
              >
                <td className="px-4 py-2 border text-center">
                  {trainer.trainer_id}
                </td>
                <td className="px-4 py-2 border text-center">
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

                <td className="px-4 py-2 border">
                  {trainer.trainer_firstname} {trainer.trainer_lastname}
                </td>
                <td className="px-4 py-2 border text-center">
                  {trainer.trainer_exp}
                </td>
                <td className="px-4 py-2 border text-center">
                  <StatusBadge status={trainer.trainer_status} />
                </td>

                {showActions && (
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/admin/trainers/edit/${trainer.trainer_id}`
                        );
                      }}
                      className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                    >
                      <Edit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(trainer.trainer_id);
                      }}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                    >
                      <Delete />
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={showActions ? 7 : 6} className="text-center py-4">
                ไม่มีข้อมูลเทรนเนอร์
              </td>
            </tr>
          )}
        </tbody>
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
