"use client"; // ต้องใช้เพื่อให้ onClick ทำงานได้

import { useRouter } from "next/navigation";
import { formatDate, calculateAge, getInitials } from "@/utils/utils";

export default function TrainerTable({ trainers }) {
  const router = useRouter(); // ใช้สำหรับเปลี่ยนหน้า

  return (
    
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 border">รหัส</th>
            <th className="px-4 py-2 border">รูปภาพ</th>
            <th className="px-4 py-2 border">ชื่อ-สกุล</th>
            <th className="px-4 py-2 border">อีเมลล์</th>
            <th className="px-4 py-2 border">ประสบการณ์</th>
            <th className="px-4 py-2 border">สถานะ</th>
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
                } // กดแล้วไปหน้ารายละเอียด
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
                <td className="px-4 py-2 border">{trainer.trainer_exp}</td>
                <td className="px-4 py-2 border">{trainer.trainer_status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4">
                ไม่มีข้อมูลเทรนเนอร์
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
