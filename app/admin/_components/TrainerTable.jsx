"use client";

import { useRouter } from "next/navigation";
import { deleteTrainer } from "@/actions/admin/deleteTrainer";
import { useTransition, useState, useEffect } from "react";
import { getInitials } from "@/utils/utils";
import StatusBadge from "./common/Status";
import Edit from "@/components/button/Edit";
import Delete from "@/components/button/Delete";
import Pagination from "./common/Paginate";
import { paginate } from "@/utils/utils";

export default function TrainerTable({
  trainers,
  showActions = false,
  perPage = 10,
}) {
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState("trainer_id"); // Default sort by ID
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      setIsLoading(false);
    };
    fetchData();
  }, [trainers]);

  const handleDelete = (id) => {
    if (confirm("ยืนยันการลบ?")) {
      setIsLoading(true);
      startTransition(async () => {
        const success = await deleteTrainer(id);
        setIsLoading(false);
        if (success) {
          alert("ลบสำเร็จ ✅");
          router.refresh();
        } else {
          alert("เกิดข้อผิดพลาดในการลบ ❌");
        }
      });
    }
  };

  // ฟังก์ชันสำหรับ sort ข้อมูล
  const sortTrainers = (trainers) => {
    return [...trainers].sort((a, b) => {
      if (sortField === "trainer_firstname") {
        // Sort โดยชื่อ-สกุล (ก-ฮ หรือ a-z)
        const nameA = `${a.trainer_firstname} ${a.trainer_lastname}`;
        const nameB = `${b.trainer_firstname} ${b.trainer_lastname}`;
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB, "th") // ใช้ localeCompare สำหรับภาษาไทย
          : nameB.localeCompare(nameA, "th");
      } else if (sortField === "trainer_id") {
        // Sort โดยรหัส
        return sortOrder === "asc"
          ? a.trainer_id - b.trainer_id
          : b.trainer_id - a.trainer_id;
      }
      return 0;
    });
  };

  // Sort ข้อมูลก่อน paginate
  const sortedTrainers = sortTrainers(trainers || []);
  const pagination = paginate(sortedTrainers, currentPage, perPage);

  // ฟังก์ชันจัดการการเปลี่ยน sort
  const handleSortChange = (field) => {
    if (sortField === field) {
      // ถ้าคลิกฟิลด์เดิม สลับทิศทางการ sort
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // ถ้าเปลี่ยนฟิลด์ เริ่มต้นที่ asc
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อเปลี่ยนการ sort
  };

  return (
    <div className="overflow-x-auto">
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="w-8 h-8 border-4 border-t-4 border-gray-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* UI สำหรับเลือกการ sort */}
      <div className="flex justify-end mb-4 space-x-2">
        <select
          value={sortField}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="trainer_id">รหัส</option>
          <option value="trainer_firstname">ชื่อ-สกุล</option>
        </select>
        <button
          onClick={() => handleSortChange(sortField)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          {sortOrder === "asc" ? "↑ น้อยไปมาก" : "↓ มากไปน้อย"}
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-300 shadow-md">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th
              className="px-4 py-2 border cursor-pointer"
              onClick={() => handleSortChange("trainer_id")}
            >
              รหัส {sortField === "trainer_id" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="px-4 py-2 border">รูปภาพ</th>
            <th
              className="px-4 py-2 border cursor-pointer"
              onClick={() => handleSortChange("trainer_firstname")}
            >
              ชื่อ-สกุล{" "}
              {sortField === "trainer_firstname" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
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
              <td colSpan={showActions ? 6 : 5} className="text-center py-4">
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