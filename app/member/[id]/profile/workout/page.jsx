import React from "react";
import { getProgressMemberData } from "@/actions/member/progression/getProgressMemberData";
import { isActiveSubscription } from "@/actions/member/isActiveSubscription";
import PastWorkoutLogs from "../_components/PastWorkoutLogs";

// ===== Server Component =====
export default async function WorkoutPage({ params }) {
  const { id } = await params;
  const memberId = parseInt(id);

  // ตรวจสอบ subscription ที่ active และดึงช่วงเวลา
  const subscriptionCheck = await isActiveSubscription(memberId);

  if (!subscriptionCheck.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์การใช้งาน
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionCheck.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              คุณไม่มีสิทธิ์เข้าถึงข้อมูล progress ในขณะนี้
            </p>
          </div>
        </div>
      </div>
    );
  }

  // เรียก getProgressMemberData เพียงครั้งเดียว (ใช้ช่วงจาก subscription)
  const subscriptions = await getProgressMemberData(memberId);

  try {
    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (!subscriptions || subscriptions.error) {
      throw new Error(subscriptions?.error || "ไม่สามารถดึงข้อมูลได้");
    }

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">

          {/* PastWorkoutLogs Client Component */}
          <PastWorkoutLogs
            workoutSummary={subscriptions.data?.workoutSummary}
            memberId={memberId}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in WorkoutPage:", error);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              ประวัติการออกกำลังกาย
            </h1>
            <div className="text-center py-8 text-gray-500">
              <p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
              <p className="text-sm mt-2">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
