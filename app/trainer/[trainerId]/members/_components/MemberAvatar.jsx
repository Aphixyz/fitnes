import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MemberAvatar = ({ firstname, lastname, profileImage, size = "sm" }) => {
  // สร้างชื่อย่อจากชื่อแรก
  const getInitials = (firstname, lastname) => {
    const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : "";
    const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
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

  return (
    <Avatar className={sizeClasses[size]}>
      {profileImage ? (
        <AvatarImage
          src={profileImage}
          alt={`${firstname} ${lastname}`}
          className="object-cover"
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
