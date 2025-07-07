import { generateRegistrationLink } from "@/actions/trainer/registration/generateRegistrationLink";
import { toast } from "@/hooks/use-toast";

/**
 * useJWTRegistrationLink Hook
 * จัดการการสร้างลิงก์ JWT สำหรับ Registration
 */
export function useJWTRegistrationLink() {
  /**
   * สร้างลิงก์ JWT Registration
   * @param {string} trainerId - ID ของ Trainer
   * @param {string} packageId - ID ของ Package
   * @param {number} expiryHours - จำนวนชั่วโมงที่ลิงก์จะหมดอายุ (default: 24 ชม. = 1 วัน)
   * @returns {Object} result - ผลลัพธ์การสร้างลิงก์
   */
  const generateLink = async (trainerId, packageId, expiryHours = 24) => {
    try {
      // Validate input
      if (!trainerId || !packageId) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณาระบุ Trainer ID และ Package ID",
          variant: "destructive",
        });
        return { success: false, error: "ข้อมูลไม่ครบถ้วน" };
      }

      // เรียก Server Action
      const result = await generateRegistrationLink({
        trainerId,
        packageId,
        expiryHours,
      });

      if (result.success) {
        // สำเร็จ: คัดลอกลิงก์ไปยัง clipboard และแสดง toast
        if (navigator.clipboard && result.url) {
          try {
            await navigator.clipboard.writeText(result.url);

            toast({
              title: "ลิงก์สร้างเสร็จสิ้น! 🎉",
              description: `ลิงก์ถูกคัดลอกแล้ว หมดอายุ: ${formatExpiryDate(
                result.expires_at
              )}`,
              variant: "default",
            });
          } catch (clipboardError) {
            // ถ้าคัดลอกไม่ได้ แค่แสดง toast ว่าสร้างเสร็จ
            toast({
              title: "ลิงก์สร้างเสร็จสิ้น! 🎉",
              description: `หมดอายุ: ${formatExpiryDate(result.expires_at)}`,
              variant: "default",
            });
          }
        }

        return result;
      } else {
        // ไม่สำเร็จ: แสดง error
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message || "ไม่สามารถสร้างลิงก์ได้",
          variant: "destructive",
        });

        return result;
      }
    } catch (error) {
      console.error("Error generating registration link:", error);

      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        variant: "destructive",
      });

      return {
        success: false,
        error: error.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ",
      };
    }
  };

  /**
   * Format วันที่หมดอายุให้อ่านง่าย
   */
  const formatExpiryDate = (dateString) => {
    if (!dateString) return "ไม่ระบุ";

    try {
      const date = new Date(dateString);
      return date.toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "ไม่ระบุ";
    }
  };

  return {
    generateLink,
  };
}

export default useJWTRegistrationLink;
