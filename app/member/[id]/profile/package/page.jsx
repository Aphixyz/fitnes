import React from "react";
import { getMemberPackageInfo } from "@/actions/member/package/getMemberPackageInfo";
import PackageDetailsCard from "@/app/member/[id]/profile/package/_components/PackageDetailsCard";
import UsageProgress from "@/app/member/[id]/profile/package/_components/UsageProgress";
import StatusBadge from "@/app/member/[id]/profile/package/_components/StatusBadge";
import TrainerInfoCard from "@/app/member/[id]/profile/package/_components/TrainerInfoCard";

/**
 * Package Information Page
 * แสดงข้อมูล Package ปัจจุบันของ Member
 */
export default async function PackagePage({ params }) {
  const memberId = params.id;

  // ดึงข้อมูล Package จาก Server Action
  const packageResult = await getMemberPackageInfo(memberId);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Error State */}
        {!packageResult.success && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  ไม่สามารถดึงข้อมูลได้
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {packageResult.message}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Package Information */}
        {packageResult.success && packageResult.data && (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Package ปัจจุบัน
              </h2>
              <StatusBadge isActive={packageResult.data.usage.isActive} />
            </div>

            {/* Package Details Card */}
            <PackageDetailsCard package={packageResult.data.package} />

            {/* Usage Progress */}
            <UsageProgress usage={packageResult.data.usage} />

            {/* Trainer Information */}
            <TrainerInfoCard trainer={packageResult.data.trainer} />
          </div>
        )}

        {/* No Package State */}
        {packageResult.success && !packageResult.data && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  ไม่มี Package ที่ใช้งานอยู่
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  คุณยังไม่มี Package ที่ใช้งานอยู่
                  กรุณาติดต่อเทรนเนอร์เพื่อสมัคร Package
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
