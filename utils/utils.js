import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines classes with tailwind-merge to handle tailwind class conflicts
 * @param {string} inputs - Class names to combine
 * @returns {string} - Combined and deduped class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * คำนวณอายุจากวันเกิด
 * @param {string} dateOfBirth - วันเกิดในรูปแบบ ISO หรือรูปแบบที่ JavaScript รองรับ
 * @returns {number} อายุเป็นปี
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};

/**
 * จัดรูปแบบวันที่เป็นภาษาไทย
 * @param {string} dateString - วันที่ในรูปแบบ ISO หรือรูปแบบที่ JavaScript รองรับ
 * @returns {string} วันที่ในรูปแบบ วัน เดือน ปี (ภาษาไทย)
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";

  const options = { year: "numeric", month: "long", day: "numeric" };
  try {
    return new Date(dateString).toLocaleDateString("th-TH", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // คืนค่าเดิมหากแปลงไม่สำเร็จ
  }
};

/**
 * จัดรูปแบบวันและเวลาเป็น DD/MM/YYYY HH:MM
 * @param {string|Date} date - วันที่และเวลาที่ต้องการจัดรูปแบบ
 * @returns {string} - วันที่และเวลาในรูปแบบ DD/MM/YYYY HH:MM
 */
export function formatDateTime(date) {
  if (!date) return "-";

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date time:", error);
    return "-";
  }
}

/**
 * Format a number as Thai Baht
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);
}

/**
 * สร้างตัวอักษรย่อชื่อจากชื่อและนามสกุล
 * @param {string} firstName - ชื่อ
 * @param {string} lastName - นามสกุล
 * @returns {string} ตัวอักษรย่อชื่อ
 */
export const getInitials = (firstName, lastName) => {
  const firstInitial = firstName?.charAt(0) || "";
  const lastInitial = lastName?.charAt(0) || "";
  return `${firstInitial}${lastInitial}`;
};

/**
 * Truncate text with ellipsis if it exceeds maxLength
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * คำนวณดัชนีมวลกาย (BMI)
 * @param {number} weightKg - น้ำหนักในหน่วยกิโลกรัม
 * @param {number} heightCm - ส่วนสูงในหน่วยเซนติเมตร
 * @returns {number|null} - ค่า BMI หรือ null ถ้าข้อมูลไม่ถูกต้อง
 */
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) return null;

  try {
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(2);
  } catch (error) {
    console.error("Error calculating BMI:", error);
    return null;
  }
}

/**
 * Get BMI category based on BMI value
 * @param {number} bmi - BMI value
 * @returns {string} - BMI category
 */
export function getBMICategory(bmi) {
  if (bmi < 18.5) return "น้ำหนักน้อย/ผอม";
  if (bmi < 23) return "ปกติ";
  if (bmi < 25) return "ท้วม/โรคอ้วนระดับ 1";
  if (bmi < 30) return "อ้วน/โรคอ้วนระดับ 2";
  return "อ้วนมาก/โรคอ้วนระดับ 3";
}

/**
 * แปลงค่า BMI เป็นสถานะน้ำหนักตามเกณฑ์
 * @param {number} bmi - ค่า BMI
 * @returns {Object} - ข้อมูลสถานะน้ำหนัก
 */
export function getBmiStatus(bmi) {
  if (!bmi) return { label: "ไม่มีข้อมูล", color: "text-gray-500" };

  if (bmi < 18.5) return { label: "น้ำหนักน้อย/ผอม", color: "text-blue-500" };
  if (bmi < 23) return { label: "ปกติ (สุขภาพดี)", color: "text-green-500" };
  if (bmi < 25)
    return { label: "ท้วม/โรคอ้วนระดับ 1", color: "text-yellow-500" };
  if (bmi < 30)
    return { label: "อ้วน/โรคอ้วนระดับ 2", color: "text-orange-500" };
  return { label: "อ้วนมาก/โรคอ้วนระดับ 3", color: "text-red-500" };
}

/**
 * คำนวณแคลอรี่ที่ควรได้รับต่อวัน (BMR)
 * @param {string} gender - เพศ ('male' หรือ 'female')
 * @param {number} weightKg - น้ำหนักในหน่วยกิโลกรัม
 * @param {number} heightCm - ส่วนสูงในหน่วยเซนติเมตร
 * @param {number} age - อายุในหน่วยปี
 * @param {string} activityLevel - ระดับกิจกรรม
 * @returns {number|null} - แคลอรี่ที่ควรได้รับต่อวัน หรือ null ถ้าข้อมูลไม่ถูกต้อง
 */
export function calculateDailyCalories(
  gender,
  weightKg,
  heightCm,
  age,
  activityLevel = "moderate"
) {
  if (!gender || !weightKg || !heightCm || !age) return null;

  try {
    // คำนวณ BMR
    let bmr;
    if (gender.toLowerCase() === "male") {
      bmr = 66 + 13.75 * weightKg + 5 * heightCm - 6.75 * age;
    } else {
      bmr = 655 + 9.56 * weightKg + 1.85 * heightCm - 4.68 * age;
    }

    // ปรับตามระดับกิจกรรม
    const activityFactors = {
      sedentary: 1.2, // ไม่ค่อยเคลื่อนไหว
      light: 1.375, // ออกกำลังกายเบา 1-3 วันต่อสัปดาห์
      moderate: 1.55, // ออกกำลังกายปานกลาง 3-5 วันต่อสัปดาห์
      active: 1.725, // ออกกำลังกายหนัก 6-7 วันต่อสัปดาห์
      very_active: 1.9, // ออกกำลังกายหนักมาก วันละ 2 ครั้ง
    };

    const factor = activityFactors[activityLevel] || activityFactors.moderate;

    return Math.round(bmr * factor);
  } catch (error) {
    console.error("Error calculating daily calories:", error);
    return null;
  }
}

/**
 * แปลงหน่วยเป็นเซนติเมตรเป็นเมตร
 * @param {number} cm - ความสูงในหน่วยเซนติเมตร
 * @returns {number} - ความสูงในหน่วยเมตร
 */
export function cmToM(cm) {
  return cm / 100;
}

/**
 * ดึง URL หลักของแอปพลิเคชัน
 * @returns {string} Base URL ของแอปพลิเคชัน
 */
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // ใช้ window.location เมื่ออยู่บนเบราวเซอร์
    return `${window.location.protocol}//${window.location.host}`;
  }

  // เมื่อรันบน Server
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // ค่าเริ่มต้นสำหรับโหมดพัฒนา
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // ค่าเริ่มต้นสำหรับโหมดโปรดักชัน
  return "https://fittrack.example.com";
}

export function paginate(items, currentPage = 1, perPage = 10) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / perPage);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const data = items.slice(start, end);

  return {
    data,
    totalItems,
    totalPages,
    currentPage,
    perPage,
  };
}

