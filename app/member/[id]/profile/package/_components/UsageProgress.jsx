import React from "react";

/**
 * Usage Progress Component
 * แสดงความคืบหน้าการใช้งาน Package
 */
export default function UsageProgress({ usage }) {
  // จัดรูปแบบวันที่
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // คำนวณสีของ progress bar
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-red-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  // คำนวณสีของ background
  const getProgressBgColor = (percentage) => {
    if (percentage >= 80) return "bg-red-100";
    if (percentage >= 60) return "bg-yellow-100";
    return "bg-green-100";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          การใช้งาน Package
        </h3>
        <p className="text-sm text-gray-600">
          ติดตามการใช้งานและวันที่เหลือของ Package
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">ความคืบหน้า</span>
          <span className="text-sm font-semibold text-gray-900">
            {usage.usagePercentage}%
          </span>
        </div>

        <div
          className={`w-full h-3 rounded-full ${getProgressBgColor(
            usage.usagePercentage
          )}`}
        >
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
              usage.usagePercentage
            )}`}
            style={{ width: `${Math.min(usage.usagePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Days Used */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">ใช้งานแล้ว</p>
              <p className="text-lg font-semibold text-blue-900">
                {usage.daysUsed} วัน
              </p>
            </div>
          </div>
        </div>

        {/* Days Remaining */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">วันที่เหลือ</p>
              <p className="text-lg font-semibold text-green-900">
                {usage.daysRemaining} วัน
              </p>
            </div>
          </div>
        </div>

        {/* Total Days */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">รวมทั้งหมด</p>
              <p className="text-lg font-semibold text-purple-900">
                {usage.totalDays} วัน
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div
          className={`rounded-lg p-4 ${
            usage.isActive ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className={`h-5 w-5 ${
                  usage.isActive ? "text-green-500" : "text-red-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  usage.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                สถานะ
              </p>
              <p
                className={`text-lg font-semibold ${
                  usage.isActive ? "text-green-900" : "text-red-900"
                }`}
              >
                {usage.isActive ? "ใช้งานได้" : "หมดอายุ"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">
              วันที่เริ่มใช้งาน
            </p>
            <p className="text-sm text-gray-900">
              {formatDate(usage.startDate)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">วันที่สิ้นสุด</p>
            <p className="text-sm text-gray-900">{formatDate(usage.endDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
