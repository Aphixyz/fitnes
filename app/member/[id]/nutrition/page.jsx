import React from "react";
import { fetchNutritionPlans } from "@/actions/member/my-nutrition-plans/fetchNutritionPlans";
import NutritionPageClient from "./_components/NutritionPageClient";
import NoActivePlanMessage from "./_components/NoActivePlanMessage";

/**
 * หน้าโภชนาการสำหรับสมาชิก - SSR Page
 * ดึงข้อมูล active macro plan และส่งไปยัง client components
 */
export default async function NutritionPage({ params }) {
  const memberId = parseInt((await params).id);

  // ตรวจสอบ memberId ที่ถูกต้อง
  if (!memberId || isNaN(memberId)) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">โภชนาการ</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">ไม่พบข้อมูลสมาชิก</p>
          </div>
        </div>
      </div>
    );
  }

  try {
    // ดึงข้อมูล active macro plan
    const macroPlan = await fetchNutritionPlans(memberId);

    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">โภชนาการ</h1>
            <p className="text-gray-600">
              ติดตามและบันทึกการบริโภคอาหารประจำวัน
            </p>
          </div>

          {macroPlan ? (
            <NutritionPageClient memberId={memberId} macroPlan={macroPlan} />
          ) : (
            /* กรณีไม่มี active macro plan */
            <NoActivePlanMessage />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading nutrition page:", error);

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">โภชนาการ</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">
              เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง
            </p>
          </div>
        </div>
      </div>
    );
  }
}
