import React from "react";

/**
 * Trainer Information Card Component
 * แสดงข้อมูลเทรนเนอร์ที่ดูแล Package (เฉพาะข้อมูลทั่วไป)
 */
export default function TrainerInfoCard({ trainer }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div>
        <div className="flex-1">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              เทรนเนอร์ที่ดูแล
            </h3>
          </div>

          {/* Trainer Info */}
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xl">
                  {trainer.name.charAt(0)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-gray-900">
                {trainer.name}
              </h4>
              {trainer.specialization && (
                <p className="text-gray-600 mt-1">{trainer.specialization}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
