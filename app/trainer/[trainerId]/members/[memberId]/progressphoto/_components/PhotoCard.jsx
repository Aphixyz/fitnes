"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";

/**
 * PhotoCard component สำหรับแสดงรูปภาพ progress photos
 * @param {Object} props
 * @param {string} props.imageUrl - URL ของรูปภาพ
 * @param {string} props.type - ประเภทของรูปภาพ (front, side, back)
 * @param {string} props.date - วันที่ถ่ายรูป
 * @param {string} props.addedBy - ผู้เพิ่มรูปภาพ (optional)
 */
export default function PhotoCard({
  imageUrl,
  type,
  date,
  addedBy = "Client",
}) {
  // แปลง type เป็นภาษาไทย
  const getTypeLabel = (type) => {
    switch (type) {
      case "front":
        return "ด้านหน้า";
      case "side":
        return "ด้านข้าง";
      case "back":
        return "ด้านหลัง";
      default:
        return type;
    }
  };

  // สีของ text ตาม type
  const getTypeColor = (type) => {
    switch (type) {
      case "front":
        return "text-gray-900";
      case "side":
        return "text-gray-900";
      case "back":
        return "text-gray-900";
      default:
        return "text-gray-600";
    }
  };

  // แปลงวันที่เป็นรูปแบบที่อ่านง่าย
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-0">
        {/* รูปภาพ */}
        <div className="relative aspect-square w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${getTypeLabel(type)} - ${formatDate(date)}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">ไม่มีรูปภาพ</p>
              </div>
            </div>
          )}
        </div>

        {/* ข้อมูลด้านล่าง */}
        <div className="p-4 space-y-2">
          {/* Type Text */}
          <div className="justify-start ">
            <span className={`text-xl font-bold text-gray-900 ${getTypeColor(type)}`}>
              {getTypeLabel(type)}
            </span>
          </div>

          {/* วันที่ */}
          <div className="flex justify-start gap-2 text-sm text-gray-600">
            <span>{formatDate(date)}</span>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
