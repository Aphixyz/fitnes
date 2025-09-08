import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MemberAvatar = ({ firstname, lastname, profileImage, size = "sm" }) => {
  // สร้างชื่อย่อจากชื่อแรก
  const getInitials = (firstname, lastname) => {
    const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : "";
    const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  };

  // สร้าง URL รูปภาพจาก path ที่เก็บในฐานข้อมูล
  const getImageUrl = (profileImage) => {
    if (!profileImage) return null;

    // ถ้าเป็น full URL แล้ว (เริ่มต้นด้วย http/https) ให้ใช้เลย
    if (profileImage.startsWith("http")) {
      return profileImage;
    }

    // ถ้าเป็น path ใน public/uploads/ ให้เพิ่ม /uploads/ prefix
    if (profileImage.startsWith("profile_") || profileImage.includes(".")) {
      return `/uploads/${profileImage}`;
    }

    // ถ้าเป็น path ที่มี /uploads/ อยู่แล้ว ให้ใช้เลย
    if (profileImage.startsWith("/uploads/")) {
      return profileImage;
    }

    // กรณีอื่นๆ ให้เพิ่ม /uploads/ prefix
    return `/uploads/${profileImage}`;
  };

  // กำหนดขนาด Avatar
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const imageUrl = getImageUrl(profileImage);

  return (
    <Avatar className={sizeClasses[size]}>
      {imageUrl ? (
        <AvatarImage
          src={imageUrl}
          alt={`${firstname || ""} ${lastname || ""}`}
          className="object-cover object-center"
        />
      ) : null}
      <AvatarFallback
        className={`bg-indigo-100 text-indigo-700 font-medium ${textSizeClasses[size]}`}
      >
        {getInitials(firstname, lastname)}
      </AvatarFallback>
    </Avatar>
  );
};

export default MemberAvatar;
