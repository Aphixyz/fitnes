"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";

/**
 * DashboardOverview Component - แสดงข้อมูลสรุปด้านบนของ dashboard
 * @param {Object} memberData - ข้อมูลสมาชิก
 * @param {Object} healthData - ข้อมูลสุขภาพ
 * @param {Object} statsData - สถิติต่างๆ
 * @param {Object} trainerData - ข้อมูลเทรนเนอร์
 */
export default function DashboardOverview({
  memberData,
  healthData,
  statsData,
  trainerData,
}) {
  // คำนวณ BMI status color
  const getBMIStatusColor = (status) => {
    switch (status) {
      case "น้ำหนักน้อย":
        return "bg-blue-100 text-blue-700";
      case "ปกติ":
        return "bg-green-100 text-green-700";
      case "น้ำหนักเกิน":
        return "bg-yellow-100 text-yellow-700";
      case "อ้วน":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // คำนวณ progress ของแผน
  const planProgress = statsData?.planProgress;
  const progressPercentage = planProgress
    ? Math.round(
        ((planProgress.totalDays - planProgress.daysRemaining) /
          planProgress.totalDays) *
          100
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              สวัสดี, {memberData?.name} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              ยินดีต้อนรับสู่ Dashboard โภชนาการของคุณ
            </p>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {statsData?.tdee || 0}
              </div>
              <div className="text-xs text-gray-500">TDEE</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {statsData?.bmr || 0}
              </div>
              <div className="text-xs text-gray-500">BMR</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BMI Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              ดัชนีมวลกาย (BMI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {statsData?.bmi?.value || 0}
                </div>
                <Badge
                  className={cn(
                    "text-xs",
                    getBMIStatusColor(statsData?.bmi?.status)
                  )}
                >
                  {statsData?.bmi?.status || "ไม่ทราบ"}
                </Badge>
              </div>
              <div className="text-3xl">⚖️</div>
            </div>
          </CardContent>
        </Card>

        {/* Weight Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              น้ำหนักปัจจุบัน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {healthData?.weight || 0}
                </div>
                <div className="text-xs text-gray-500">กิโลกรัม</div>
              </div>
              <div className="text-3xl">🏋️</div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Progress Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              ความคืบหน้าแผน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {progressPercentage}%
                </div>
                <div className="text-xs text-gray-500">
                  เหลือ {planProgress?.daysRemaining || 0} วัน
                </div>
              </div>
              <div className="text-3xl">📈</div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trainer Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              เทรนเนอร์ของคุณ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-900">
                  {trainerData
                    ? `${trainerData.trainer_firstname} ${trainerData.trainer_lastname}`
                    : "ไม่มีเทรนเนอร์"}
                </div>
                <div className="text-xs text-gray-500">
                  {trainerData?.trainer_specialization || "ไม่ระบุ"}
                </div>
              </div>
              <div className="text-3xl">👨‍💼</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>สรุปข้อมูลสุขภาพ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {healthData?.height || 0} ซม.
              </div>
              <div className="text-sm text-gray-500">ส่วนสูง</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {healthData?.bodyFat || 0}%
              </div>
              <div className="text-sm text-gray-500">ไขมัน</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {getActivityLevelText(healthData?.activityLevel)}
              </div>
              <div className="text-sm text-gray-500">ระดับกิจกรรม</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {formatDate(healthData?.lastMeasurement)}
              </div>
              <div className="text-sm text-gray-500">อัพเดทล่าสุด</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getActivityLevelText(level) {
  const levels = {
    0: "น้อยมาก",
    1: "เล็กน้อย",
    2: "ปานกลาง",
    3: "สูง",
  };
  return levels[level] || "ไม่ระบุ";
}

function formatDate(dateString) {
  if (!dateString) return "ไม่ระบุ";

  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
