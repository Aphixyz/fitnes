"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchPhotoByHealthId } from "@/actions/member/metric/fetchPhotoByHealthId";
import { formatShortThaiDate } from "@/utils/utils";

/**
 * PhotoPage - แสดงรูปภาพ progress แบบ mobile-first
 * @param {Object} props
 * @param {Promise<Object>} props.params - dynamic route params (Promise in Next.js 15+)
 * @param {string} props.params.healthId - member_health_id
 * @param {string} props.params.id - member id
 */
export default function PhotoPage({ params }) {
  const router = useRouter();
  // unwrap params Promise ด้วย React.use()
  const { healthId, id: memberId } = React.use(params);
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState("front"); // default เลือก front

  // ดึงข้อมูลรูปภาพตาม healthId โดยตรง
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ใช้ fetchPhotoByHealthId โดยตรง
        const data = await fetchPhotoByHealthId(parseInt(healthId));

        if (data && data.has_photos) {
          setHealthData(data);
        } else {
          console.error("ไม่พบรูปภาพในข้อมูลนี้");
          router.push(`/member/${memberId}/progress/measures`);
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        router.push(`/member/${memberId}/progress/measures`);
      } finally {
        setIsLoading(false);
      }
    };

    if (healthId && memberId) {
      fetchData();
    }
  }, [healthId, memberId, router]);

  // helper: ตรวจสอบว่ามีรูปภาพหรือไม่
  const hasPhotos = healthData?.has_photos;

  // helper: เลือกรูปภาพที่แสดง
  const getSelectedPhotoPath = () => {
    if (!healthData?.photos) return null;
    return healthData.photos[selectedPhoto] || null;
  };

  // helper: รายการรูปภาพที่มี
  const availablePhotos = healthData?.photos
    ? Object.entries(healthData.photos)
        .filter(([_, path]) => path) // กรองเฉพาะที่มีรูป
        .map(([type, path]) => ({ type, path }))
    : [];

  // handle back button
  const handleBack = () => {
    router.push(`/member/${memberId}/progress/measures`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  if (!healthData || !hasPhotos) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">ไม่พบรูปภาพในวันที่นี้</p>
            <button
              onClick={handleBack}
              className="mt-2 text-blue-500 hover:underline"
            >
              กลับไปหน้าวัดผล
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800"
            aria-label="กลับ"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-blue-500 font-medium">รูปภาพเดี่ยว</span>
          </div>
          <div className="w-6"></div> {/* spacer เพื่อให้ header centered */}
        </div>
      </div>

      {/* Main Photo Display */}
      <div className="px-4 py-6">
        <div className="relative">
          {/* รูปภาพหลัก - ปรับให้ใหญ่ขึ้น */}
          <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 shadow-lg">
            {getSelectedPhotoPath() ? (
              <img
                src={getSelectedPhotoPath()}
                alt={`Progress photo ${selectedPhoto} view`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-2 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>ไม่มีรูปภาพ</p>
                </div>
              </div>
            )}
          </div>

          {/* ข้อมูลวันที่และจำนวนรูปภาพ - ย้ายไปด้านล่าง */}
          <div className="mt-6 text-center">
            <div className="text-xl font-semibold text-gray-900 mb-1">
              {healthData.measurement_date_formatted ||
                formatShortThaiDate(healthData.measurement_date, true)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section - รูปภาพ thumbnail แนวนอน */}
      <div className="border-t border-gray-200 px-4 py-4">
        <div className="flex space-x-3 mb-4">
          {availablePhotos.map(({ type, path }) => (
            <div
              key={type}
              className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                selectedPhoto === type
                  ? "border-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedPhoto(type)}
              tabIndex={0}
              role="button"
              aria-label={`เลือกรูป ${type} view`}
            >
              <img
                src={path}
                alt={`${type} view thumbnail`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
