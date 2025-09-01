"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Camera, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * ProgressPhotoCard Component - แสดงภาพความก้าวหน้าล่าสุด
 * @param {Object} photoData - ข้อมูลภาพความก้าวหน้าจาก member_health table
 * @param {number} memberId - รหัสสมาชิก
 */
export default function ProgressPhotoCard({ photoData, memberId }) {
  if (!photoData?.success || !photoData?.data) {
    return (
      <Card className="w-full min-h-[200px]">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-gray-500 text-sm">ยังไม่มีภาพความก้าวหน้า</p>
            <Button size="sm" className="mt-4" asChild>
              <Link href={`/member/${memberId}/health/photo`}>
                เพิ่มภาพความก้าวหน้า
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressData = photoData.data;

  const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                   'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    
    return `${month} ${day}`;
  };

  // ตรวจสอบว่ามี front photo หรือไม่
  const hasFrontPhoto = progressData.photo_front;
  const photoPath = hasFrontPhoto ? progressData.photo_front : null;
  const weight = progressData.member_health_weight;
  const measurementDate = progressData.member_health_measurementdate;

  // Debug log (จะลบออกหลังจากแก้ไขแล้ว)
  console.log('Progress Photo Debug:', {
    hasFrontPhoto,
    photoPath,
    photo_front: progressData.photo_front,
    memberId,
    weight,
    measurementDate
  });

  return (
    <Card className="w-full hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 overflow-hidden">
      <CardContent className="p-0 relative">
        
        {/* Photo Section */}
        <div className="relative h-48 md:h-56 bg-gray-100">
          
          {/* Main Photo (Front) */}
          {hasFrontPhoto ? (
            <div className="relative h-full w-full">
              <Image
                src={photoPath}
                alt="Progress photo"
                fill
                className="object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              
              {/* Photo Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          ) : (
            // Placeholder when no photo
            <div className="h-full w-full flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-400">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">ไม่มีภาพ</p>
              </div>
            </div>
          )}

          {/* Overlay Info - Bottom Left */}
          <div className="absolute bottom-3 left-3 text-white">
            {/* Date */}
            <div className="text-xs font-medium mb-1 drop-shadow-md">
              {formatThaiDate(measurementDate)}
            </div>
            
            {/* Weight */}
            <div className="text-base font-bold drop-shadow-md">
              {weight ? `${Math.round(weight)} kg` : '-'}
            </div>
          </div>

          {/* Navigation Arrow - Top Right */}
          <div className="absolute top-3 right-3">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}