"use client"; // ต้องใช้เพื่อให้ onClick ทำงานได้

import { useRouter } from "next/navigation";
import { deleteTrainer } from "@/actions/admin/deleteTrainer";
import { useTransition } from "react";
import { getInitials } from "@/utils/utils";

export default function TrainerTable({ trainers, showActions = false }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (id) => {
    if (confirm("ยืนยันการลบ?")) {
      startTransition(async () => {
        const success = await deleteTrainer(id);
        if (success) {
          alert("ลบสำเร็จ ✅");
          router.refresh(); // โหลดข้อมูลใหม่
        } else {
          alert("เกิดข้อผิดพลาดในการลบ ❌");
        }
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 border">รหัส</th>
            <th className="px-4 py-2 border">รูปภาพ</th>
            <th className="px-4 py-2 border">ชื่อ-สกุล</th>
            <th className="px-4 py-2 border">อีเมลล์</th>
            <th className="px-4 py-2 border">ประสบการณ์(ปี)</th>
            <th className="px-4 py-2 border">สถานะ</th>
            {showActions && <th className="px-4 py-2 border">การจัดการ</th>}
          </tr>
        </thead>
        <tbody>
          {trainers && trainers.length > 0 ? (
            trainers.map((trainer) => (
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
                <td className="px-4 py-2 border">{trainer.trainer_email}</td>
                <td className="px-4 py-2 border text-center">{trainer.trainer_exp}</td>
                <td
                  className={`px-4 py-2 border text-center font-semibold ${
                    trainer.trainer_status === "active"
                      ? "bg-green-100 text-green-800"
                      : trainer.trainer_status === "inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {trainer.trainer_status === "active" ? "Active" : "Inactive"}
                </td>

                {showActions && (
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the row click
                        router.push(
                          `/admin/trainers/edit/${trainer.trainer_id}`
                        );
                      }}
                      className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the row click
                        handleDelete(trainer.trainer_id);
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
                ไม่มีข้อมูลเทรนเนอร์
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
