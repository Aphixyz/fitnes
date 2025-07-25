"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { formatShortThaiDate } from "@/utils/utils";

/**
 * ProgressPhotos - แสดง thumbnail รูปภาพวัดผลย้อนหลัง (1 รูป/วัน)
 * @param {Object} props
 * @param {Array} props.data - array ของ healthData (จาก fetchAllHealthData)
 * @param {number} props.memberId - id สมาชิก (optional ถ้าต้องใช้ generate url)
 */
export default function ProgressPhotos({ data, memberId }) {
  const router = useRouter();
  // filter เฉพาะวันที่ที่มีรูปอย่างน้อย 1 รูป
  const photosWithDate = Array.isArray(data)
    ? data.filter(
        (item) =>
          item?.photos?.front || item?.photos?.side || item?.photos?.back
      )
    : [];

  // helper: เลือกรูปแรกที่มี (front > side > back)
  const getFirstPhoto = (photos) => {
    return photos.front || photos.side || photos.back || null;
  };

  // handle click ที่รูป
  const handlePhotoClick = (healthId) => {
    if (!memberId) return;
    router.push(`/member/${memberId}/profile/measures/${healthId}`);
  };

  // handle click ดูทั้งหมด
  const handleSeeAll = () => {
    if (!memberId) return;
    router.push(`/member/${memberId}/profile/measures/photos`);
  };

  return (
    <div className="space-y-0 md:-mx-6 mb-4 ">
      {/* Header section */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 font-medium text-base">
          รูปภาพการพัฒนา
        </span>
        <button
          className="text-blue-500 text-sm font-medium hover:underline"
          onClick={handleSeeAll}
          type="button"
        >
          ดูทั้งหมด
        </button>
      </div>
      {/* รูปแนวนอน scroll */}
      <div className=" bg-white ">
        <div className="flex space-x-4 pb-1">
          {photosWithDate.map((item) => {
            const photoPath = getFirstPhoto(item.photos);
            if (!photoPath) return null;
            return (
              <div
                key={item.member_health_id}
                className="flex-shrink-0 w-24 h-32 relative rounded-lg overflow-hidden shadow cursor-pointer bg-gray-100"
                onClick={() => handlePhotoClick(item.member_health_id)}
                tabIndex={0}
                role="button"
                aria-label={`ดูรูปวันที่ ${formatShortThaiDate(
                  item.measurement_date,
                  true
                )}`}
              >
                <img
                  src={photoPath}
                  alt={`progress photo ${item.measurement_date}`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
                {/* overlay วันที่ */}
                <div className="absolute bottom-0 left-0 w-full bg-black/40 text-white text-xs px-2 py-1 text-left">
                  {formatShortThaiDate(item.measurement_date, true)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
