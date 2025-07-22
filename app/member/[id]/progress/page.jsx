import {
  format,
  differenceInDays,
  addWeeks,
  addMonths,
  addYears,
} from "date-fns";

// ===== Server Actions =====
import { getProgressMemberData } from "@/actions/member/progression/getProgressMemberData.js";
import { getExerciseSummary } from "@/actions/member/progression/total/getExerciseSummary";
import { isActiveSubscription } from "@/actions/member/isActiveSubscription.js";

import WorkoutChart from "./_components/WorkoutChart";
import PastWorkoutLogs from "./_components/PastWorkoutLogs";

function generateTicks(startDate, endDate) {
  const ticks = [];
  const days = differenceInDays(new Date(endDate), new Date(startDate));
  let unit, step;

  if (days <= 30) {
    unit = "week";
    step = 1;
  } else if (days <= 60) {
    unit = "week";
    step = 2;
  } else if (days <= 90) {
    unit = "month";
    step = 1;
  } else if (days <= 365) {
    unit = "month";
    step = 3;
  } else {
    unit = "year";
    step = 1;
  }

  let cursor = new Date(startDate);
  const endCursor = new Date(endDate);
  while (cursor <= endCursor) {
    ticks.push(format(cursor, "yyyy-MM-dd"));
    if (unit === "week") {
      cursor = addWeeks(cursor, step);
    } else if (unit === "month") {
      cursor = addMonths(cursor, step);
    } else {
      // year
      cursor = addYears(cursor, step);
    }
  }

  // Ensure start and end are included (format as strings)
  ticks.push(format(new Date(startDate), "yyyy-MM-dd"));
  ticks.push(format(new Date(endDate), "yyyy-MM-dd"));

  // Dedupe and sort as strings
  return Array.from(new Set(ticks)).sort();
}

// ===== Main Page Component =====
export default async function ProgressPage({ params }) {
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

  // ดึงช่วงเวลาจาก subscription ที่ active
  const {
    registration_startdate: domainStart,
    registration_enddate: domainEnd,
  } = subscriptionCheck.data.registration;

  // เรียก getProgressMemberData เพียงครั้งเดียว (ใช้ช่วงจาก subscription)
  const subscriptions = await getProgressMemberData(memberId);

  // Generate ticks dynamically based on subscription length
  const ticks = generateTicks(domainStart, domainEnd);

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* ===== ปุ่มไปหน้าวัดผลสุขภาพ (MeasuresPage) ===== */}
      <div className="flex justify-end mb-4">
        {/* ใช้ next/link เพื่อ redirect ไป MeasuresPage */}
        <a
          href={`/member/${memberId}/progress/measures`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          {/* ไอคอน (optional) */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
          วัดผลสุขภาพ
        </a>
      </div>
      {/* ===== Workout Log Summary Card ===== */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {subscriptions?.data?.workoutLogCount?.totalWorkouts || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              ครั้งที่ออกกำลังกาย
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 max-w-6xl mx-auto space-y-6">
        {/* ===== Workout Chart Section ===== */}
        <WorkoutChart
          member_id={memberId}
          startDate={domainStart}
          endDate={domainEnd}
          ticks={ticks}
          subscriptions={subscriptions}
          getExerciseSummary={getExerciseSummary}
        />

        {/* ===== Past Workout Logs Section ===== */}
        <PastWorkoutLogs
          workoutSummary={subscriptions?.data?.workoutSummary}
          memberId={memberId}
        />
      </div>
    </div>
  );
}
