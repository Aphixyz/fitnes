"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchAllHealthData } from "@/actions/member/metric/fetchAllHealthData";
import { formatShortThaiDate } from "@/utils/utils";

export default function PhotosListPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id;
  const [photoLogs, setPhotoLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        // ดึงข้อมูล health log ทั้งหมด
        const all = await fetchAllHealthData(Number(memberId), "all");
        // filter เฉพาะที่มีรูป
        const withPhotos = all.filter(
          (item) =>
            item.photos &&
            (item.photos.front || item.photos.side || item.photos.back)
        );
        setPhotoLogs(withPhotos);
      } catch (e) {
        setPhotoLogs([]);
      }
      setIsLoading(false);
    }
    if (memberId) load();
  }, [memberId]);

  // helper: เลือก thumbnail ที่เหมาะสม
  const getThumbnail = (photos) =>
    photos.front || photos.side || photos.back || "/default-avatar.png";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        กำลังโหลด...
      </div>
    );
  }

  if (!photoLogs.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        ไม่พบรูปภาพ progress
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 px-2">
      <div className="flex flex-col gap-4">
        {photoLogs.map((log) => (
          <button
            key={log.member_health_id}
            className="flex items-center bg-white rounded-xl shadow-sm px-3 py-3 w-full active:bg-gray-100"
            onClick={() =>
              router.push(
                `/member/${memberId}/progress/measures/photos/${log.member_health_id}`
              )
            }
          >
            {/* Thumbnail */}
            <img
              src={getThumbnail(log.photos)}
              alt="progress"
              className="w-24 h-32 object-cover rounded-lg flex-shrink-0 border border-gray-200"
            />
            {/* ข้อมูล */}
            <div className="flex-1 ml-4 flex flex-col items-start justify-center">
              <div className="text-lg font-medium text-gray-900">
                {formatShortThaiDate(log.measurement_date, true)}
              </div>
            </div>
            {/* ลูกศร */}
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
