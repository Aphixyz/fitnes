import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getMemberPackageInfo } from "@/actions/member/package/getMemberPackageInfo";
import PackageDetailsCard from "@/app/member/[id]/profile/package/_components/PackageDetailsCard";
import UsageProgress from "@/app/member/[id]/profile/package/_components/UsageProgress";
import TrainerInfoCard from "@/app/member/[id]/profile/package/_components/TrainerInfoCard";

/**
 * Package Information Page
 * แสดงข้อมูล Package ปัจจุบันของ Member
 */
export default async function PackagePage({ params }) {
  const { id } = await params;
  const memberId = id;

  // ดึงข้อมูล Package จาก Server Action
  const packageResult = await getMemberPackageInfo(memberId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 h-20 bg-white border-b border-gray-200 pt-2 items-center justify-center">
        <div className="flex items-center justify-between p-4 h-16">
          <Link
            href={`/member/${memberId}/profile`}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            Package ของฉัน
          </h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <div className="max-w-4xl mx-auto">

          {/* Error State */}
          {!packageResult.success && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium">ไม่สามารถดึงข้อมูลได้</p>
              <p className="text-red-700 text-sm mt-1">{packageResult.message}</p>
            </div>
          )}

          {/* Package Information */}
          {packageResult.success && packageResult.data && (
            <div className="space-y-4">
              {/* Header */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Package ปัจจุบัน
                </h2>
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">ไม่มี Package ที่ใช้งานอยู่</p>
              <p className="text-yellow-700 text-sm mt-1">
                คุณยังไม่มี Package ที่ใช้งานอยู่ กรุณาติดต่อเทรนเนอร์เพื่อสมัคร Package
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
