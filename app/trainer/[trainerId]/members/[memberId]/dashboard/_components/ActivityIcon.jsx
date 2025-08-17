import React from 'react';
import { Dumbbell, Apple, Scale, Camera, Activity, Target } from 'lucide-react';

/**
 * ActivityIcon component - แสดงไอคอนตามประเภทกิจกรรม
 * @param {string} type - ประเภทกิจกรรม
 * @param {string} size - ขนาดไอคอน
 * @param {string} className - CSS classes เพิ่มเติม
 */
export function ActivityIcon({ type, size = "w-5 h-5", className = "" }) {
  const iconClass = `${size} ${className}`;

  const iconMap = {
    workout: {
      icon: <Dumbbell className={iconClass} />,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    nutrition: {
      icon: <Apple className={iconClass} />,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    health_metrics: {
      icon: <Scale className={iconClass} />,
      color: "text-purple-600", 
      bgColor: "bg-purple-50"
    },
    progress_photo: {
      icon: <Camera className={iconClass} />,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    default: {
      icon: <Activity className={iconClass} />,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    }
  };

  const config = iconMap[type] || iconMap.default;

  return (
    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor}`}>
      <span className={config.color}>
        {config.icon}
      </span>
    </div>
  );
}

/**
 * getActivityTypeConfig - ได้คอนฟิกของกิจกรรมแต่ละประเภท
 * @param {string} type - ประเภทกิจกรรม
 * @returns {object} คอนฟิกสำหรับกิจกรรม
 */
export function getActivityTypeConfig(type) {
  const configs = {
    workout: {
      title: "การออกกำลังกาย",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    nutrition: {
      title: "บันทึกโภชนาการ",
      color: "text-green-600", 
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    health_metrics: {
      title: "บันทึกสุขภาพ",
      color: "text-purple-600",
      bgColor: "bg-purple-50", 
      borderColor: "border-purple-200"
    },
    progress_photo: {
      title: "ภาพความคืบหน้า",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  };

  return configs[type] || {
    title: "กิจกรรมอื่นๆ",
    color: "text-gray-600",
    bgColor: "bg-gray-50", 
    borderColor: "border-gray-200"
  };
}

export default ActivityIcon;