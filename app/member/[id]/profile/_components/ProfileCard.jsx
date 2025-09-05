"use client";

import { 
  ChevronRight, 
  User, 
  Target, 
  Dumbbell, 
  Apple, 
  Package, 
  LogOut,
  Image
} from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * ProfileCard Component - การ์ดสำหรับแต่ละเมนูใน Profile
 * @param {Object} props
 * @param {string} props.title - หัวข้อหลัก
 * @param {string} props.subtitle - รายละเอียดย่อย
 * @param {string} props.iconName - ชื่อ icon (เช่น "User", "Target")
 * @param {string} props.href - URL สำหรับ navigation
 * @param {boolean} props.isLogout - เป็นปุ่ม logout หรือไม่ (สไตล์แยก)
 * @param {Function} props.onClick - custom click handler
 * @param {string} props.iconColor - สีของ icon (ถ้าต้องการกำหนดเอง)
 * @param {string} props.textColor - สีของข้อความ (สำหรับ logout)
 */
export default function ProfileCard({
  title,
  subtitle,
  iconName,
  href,
  isLogout = false,
  onClick,
  iconColor = "text-gray-700",
  textColor = "text-gray-900"
}) {
  const router = useRouter();

  // Map icon names to components
  const iconMap = {
    "User": User,
    "Target": Target,
    "Dumbbell": Dumbbell,
    "Apple": Apple,
    "Package": Package,
    "LogOut": LogOut,
    "Image": Image,
  };

  const IconComponent = iconMap[iconName];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-center p-4 bg-white rounded-lg border border-gray-200 
        hover:bg-gray-50 transition-colors duration-200 cursor-pointer
        ${isLogout ? 'hover:bg-red-50 hover:border-red-200' : ''}
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mr-4">
        <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
          isLogout ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          {IconComponent && (
            <IconComponent 
              className={`w-5 h-5 ${
                isLogout ? 'text-red-600' : iconColor
              }`} 
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-base ${
          isLogout ? 'text-red-600' : textColor
        }`}>
          {title}
        </h3>
        {subtitle && (
          <p className={`text-sm mt-1 ${
            isLogout ? 'text-red-500' : 'text-gray-500'
          }`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Arrow - ไม่แสดงสำหรับ logout card */}
      {!isLogout && (
        <div className="flex-shrink-0 ml-2">
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      )}
    </div>
  );
}