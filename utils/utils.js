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

/**
 * ขอรายชื่อวันในสัปดาห์เป็นภาษาไทย
 * @returns {string[]} - รายชื่อวันในสัปดาห์ภาษาไทย
 */
export function getThaiDays() {
  return ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
}

/**
 * ตรวจสอบว่าสตริงเป็นชื่อวันในภาษาไทยหรือไม่
 * @param {string} day - สตริงที่ต้องการตรวจสอบ
 * @returns {boolean} - true หากเป็นชื่อวันในภาษาไทย
 */
export function isThaiDay(day) {
  const thaiDays = getThaiDays();
  return thaiDays.includes(day);
}

/**
 * แปลงชื่อวันภาษาอังกฤษเป็นภาษาไทย
 * @param {string} englishDay - ชื่อวันภาษาอังกฤษ (monday, tuesday, ...)
 * @returns {string} - ชื่อวันภาษาไทย
 */
export function getThaiDay(englishDay) {
  const dayMapping = {
    monday: "จันทร์",
    tuesday: "อังคาร",
    wednesday: "พุธ",
    thursday: "พฤหัสบดี",
    friday: "ศุกร์",
    saturday: "เสาร์",
    sunday: "อาทิตย์",
  };

  return dayMapping[englishDay?.toLowerCase()] || englishDay;
}

/**
 * แปลงชื่อวันภาษาไทยเป็นภาษาอังกฤษ
 * @param {string} thaiDay - ชื่อวันภาษาไทย
 * @returns {string} - ชื่อวันภาษาอังกฤษ (monday, tuesday, ...)
 */
export function getEnglishDay(thaiDay) {
  const dayMapping = {
    จันทร์: "monday",
    อังคาร: "tuesday",
    พุธ: "wednesday",
    พฤหัสบดี: "thursday",
    ศุกร์: "friday",
    เสาร์: "saturday",
    อาทิตย์: "sunday",
  };

  return dayMapping[thaiDay] || thaiDay;
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

/**
 * แปลงค่าเวลาเป็นวินาที (เช่น "2:30" เป็น 150 วินาที)
 * @param {string|number} timeString - เวลาในรูปแบบ "M:S" หรือวินาที
 * @returns {number} เวลาในรูปแบบวินาที
 */
export function timeToSeconds(timeString) {
  if (!timeString && timeString !== 0) return 0;

  // ถ้าเป็น number อยู่แล้ว (วินาที) ให้คืนค่าเลย
  if (typeof timeString === "number") {
    return timeString;
  }

  // ถ้าเป็น string ให้แปลงจาก "M:S" format
  if (typeof timeString === "string") {
    const [minutes, seconds] = timeString.split(":").map(Number);
    return minutes * 60 + (seconds || 0);
  }

  return 0;
}

/**
 * แปลงวินาทีเป็นรูปแบบเวลา "M:S"
 * @param {number} seconds - เวลาในรูปแบบวินาที
 * @returns {string} เวลาในรูปแบบ "M:S"
 */
export function secondsToTime(seconds) {
  if (!seconds && seconds !== 0) return "";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * แปลงวินาทีเป็นรูปแบบเวลา "H:M:S" สำหรับแสดงผลใน frontend
 * @param {number} seconds - เวลาในรูปแบบวินาที
 * @returns {string} เวลาในรูปแบบ "H:M:S" หรือ "M:S" หรือ "S"
 *
 * ตัวอย่างการใช้งาน:
 * formatDuration(3661) // "1:01:01" (1 ชั่วโมง 1 นาที 1 วินาที)
 * formatDuration(125) // "2:05" (2 นาที 5 วินาที)
 * formatDuration(45) // "0:45" (45 วินาที)
 */
export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  // ถ้ามีชั่วโมง แสดงในรูปแบบ H:M:S
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  // ถ้ามีนาที แสดงในรูปแบบ M:S
  if (minutes > 0) {
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  // ถ้ามีแค่วินาที แสดงในรูปแบบ 0:S
  return `0:${secs.toString().padStart(2, "0")}`;
}

/**
 * แปลงค่าระยะทางเป็นเมตร (เช่น "1:500" เป็น 1500 เมตร)
 * @param {string|number} distanceString - ระยะทางในรูปแบบ "KM:M" หรือเมตร
 * @returns {number} ระยะทางในรูปแบบเมตร
 */
export function distanceToMeters(distanceString) {
  if (!distanceString && distanceString !== 0) return 0;

  // ถ้าเป็น number อยู่แล้ว (เมตร) ให้คืนค่าเลย
  if (typeof distanceString === "number") {
    return distanceString;
  }

  // ถ้าเป็น string ให้แปลงจาก "KM:M" format
  if (typeof distanceString === "string") {
    const [kilometers, meters] = distanceString.split(":").map(Number);
    return kilometers * 1000 + (meters || 0);
  }

  return 0;
}

/**
 * แปลงเมตรเป็นรูปแบบระยะทาง "KM:M"
 * @param {number} meters - ระยะทางในรูปแบบเมตร
 * @returns {string} ระยะทางในรูปแบบ "KM:M"
 */
export function metersToDistance(meters) {
  if (!meters && meters !== 0) return "";

  const kms = Math.floor(meters / 1000);
  const m = meters % 1000;
  return `${kms}:${m.toString().padStart(3, "0")}`;
}

// สร้างตัวเลือกเวลาพักเป็นช่วง 5 วินาที ตั้งแต่ 0 ถึง 5 นาที
export function getRestTimeOptions() {
  const options = [];

  // เพิ่มตัวเลือก "ไม่กำหนด"
  options.push({ value: "0", label: "ไม่กำหนด" });

  // เพิ่มตัวเลือกทุก 5 วินาที จาก 5 วินาที ถึง 5 นาที
  for (let i = 5; i <= 300; i += 5) {
    const mins = Math.floor(i / 60);
    const secs = i % 60;
    const label =
      mins > 0
        ? `${mins}:${secs.toString().padStart(2, "0")}`
        : `0:${secs.toString().padStart(2, "0")}`;

    options.push({ value: i.toString(), label });
  }

  return options;
}

// ===== EXERCISE FORMATTING FUNCTIONS =====

/**
 * แปลงวินาทีเป็นภาษาไทย (ชั่วโมง นาที วินาที)
 * @param {number} seconds - เวลาในรูปแบบวินาที
 * @returns {string} เวลาในรูปแบบภาษาไทย
 */
export function formatTimeThai(seconds) {
  if (!seconds || seconds === 0) return "0 วินาที";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours} ชั่วโมง`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} นาที`);
  }

  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} วินาที`);
  }

  return parts.join(" ");
}

/**
 * แปลงเมตรเป็นภาษาไทย (กิโลเมตร เมตร)
 * @param {number} meters - ระยะทางในรูปแบบเมตร
 * @returns {string} ระยะทางในรูปแบบภาษาไทย
 */
export function formatDistanceThai(meters) {
  if (!meters || meters === 0) return "0 เมตร";

  const kilometers = Math.floor(meters / 1000);
  const remainingMeters = meters % 1000;

  const parts = [];

  if (kilometers > 0) {
    parts.push(`${kilometers} กิโลเมตร`);
  }

  if (remainingMeters > 0 || parts.length === 0) {
    parts.push(`${remainingMeters} เมตร`);
  }

  return parts.join(" ");
}

/**
 * จัดรูปแบบน้ำหนัก (จัดการทศนิยม)
 * @param {number} weight - น้ำหนักในหน่วยกิโลกรัม
 * @returns {string} น้ำหนักในรูปแบบที่เหมาะสม
 */
export function formatWeight(weight) {
  const num = Number(weight);
  if (isNaN(num)) return "";
  const hasDecimal = num % 1 !== 0;
  if (hasDecimal) {
    return `${num.toFixed(2)} กก.`;
  } else {
    return `${Math.floor(num)} กก.`;
  }
}

// ===== HELPER: Short Thai Days =====
/**
 * คืนชื่อวันแบบย่อภาษาไทย (จ, อ, พ, พฤ, ศ, ส, อา)
 * @returns {string[]} - รายชื่อวันแบบย่อ
 */
export function getShortThaiDays() {
  return ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
}

// ===== WORKOUT LOGGING HELPER FUNCTIONS =====

/**
 * แสดงผลข้อมูลที่ member กรอกในแต่ละเซต
 * @param {Object} setData - ข้อมูลเซตที่ member กรอก
 * @param {string} fieldKey - ชื่อฟิลด์ (weight, reps, time, distance)
 * @returns {string} - ข้อความแสดงผล
 *
 * ตัวอย่างการใช้งาน:
 * formatLoggedSetValue({weight: 50, reps: 12}, "weight") // "50 กก."
 * formatLoggedSetValue({time: 120}, "time") // "2 นาที"
 * formatLoggedSetValue({distance: 1000}, "distance") // "1 กิโลเมตร"
 */
export function formatLoggedSetValue(setData, fieldKey) {
  if (!setData || !setData[fieldKey]) return "";

  const value = setData[fieldKey];

  switch (fieldKey) {
    case "weight":
      return formatWeight(value);
    case "reps":
      return `${value} รอบ`;
    case "time":
      return formatTimeThai(value);
    case "distance":
      return formatDistanceThai(value);
    default:
      return value.toString();
  }
}

/**
 * แสดงผลข้อมูลที่ trainer กำหนดไว้ในแต่ละเซต
 * @param {Object} set - ข้อมูลเซตจาก trainer
 * @param {string} fieldKey - ชื่อฟิลด์ (weight, reps, time, distance)
 * @returns {string} - ข้อความแสดงผล
 *
 * ตัวอย่างการใช้งาน:
 * formatTrainerSetValue({weight: 50}, "weight") // "50 กก."
 * formatTrainerSetValue({time: 60}, "time") // "1 นาที"
 * formatTrainerSetValue({distance: 500}, "distance") // "500 เมตร"
 */
export function formatTrainerSetValue(set, fieldKey) {
  if (!set || set[fieldKey] === null || set[fieldKey] === undefined) return "";

  const value = set[fieldKey];

  switch (fieldKey) {
    case "weight":
      return formatWeight(value);
    case "reps":
      return `${value} รอบ`;
    case "time":
      return formatTimeThai(value);
    case "distance":
      return formatDistanceThai(value);
    default:
      return value.toString();
  }
}

/**
 * แสดงผลข้อมูลแบบย่อสำหรับ input field
 * @param {Object} set - ข้อมูลเซตจาก trainer
 * @param {string} fieldKey - ชื่อฟิลด์ (weight, reps, time, distance)
 * @returns {string} - ข้อความแสดงผลแบบย่อ
 *
 * ตัวอย่างการใช้งาน:
 * formatInputValue({weight: 50}, "weight") // "50 กก."
 * formatInputValue({time: 60}, "time") // "1 นาที"
 * formatInputValue({distance: 500}, "distance") // "500 เมตร"
 */
export function formatInputValue(set, fieldKey) {
  if (!set || set[fieldKey] === null || set[fieldKey] === undefined) return "";

  const value = set[fieldKey];

  switch (fieldKey) {
    case "weight":
      return formatWeight(value);
    case "reps":
      return `${value} รอบ`;
    case "time":
      return formatTimeThai(value);
    case "distance":
      return formatDistanceThai(value);
    default:
      return value.toString();
  }
}

/**
 * คำนวณ Smart Placeholder สำหรับแต่ละฟิลด์
 * @param {Object} loggedSets - ข้อมูลที่ member กรอกแล้ว
 * @param {number} exerciseId - ID ของ exercise
 * @param {string} fieldKey - ชื่อฟิลด์
 * @param {number} trainerValue - ค่าที่ trainer กำหนด
 * @returns {number|null} - ค่า placeholder หรือ null
 *
 * ตัวอย่างการใช้งาน:
 * getSmartPlaceholder(loggedSets, 1, "weight", 50) // คืนค่าล่าสุดที่ member กรอก หรือ 50
 */
export function getSmartPlaceholder(
  loggedSets,
  exerciseId,
  fieldKey,
  trainerValue
) {
  // ดึงข้อมูลจาก loggedSets ที่เป็น exercise เดียวกัน
  const exerciseLoggedSets = Object.keys(loggedSets)
    .filter((key) => key.startsWith(`${exerciseId}_`))
    .map((key) => loggedSets[key])
    .filter((data) => data && data[fieldKey]); // เฉพาะที่มีข้อมูล field นี้

  // ถ้ามีข้อมูลจาก member ใช้ค่าล่าสุด
  if (exerciseLoggedSets.length > 0) {
    const latestValue =
      exerciseLoggedSets[exerciseLoggedSets.length - 1][fieldKey];
    return latestValue;
  }

  // ถ้าไม่มี ใช้ค่าจาก trainer
  return trainerValue;
}

/**
 * แสดงผลข้อมูลแบบย่อสำหรับ placeholder ใน input field
 * @param {number} value - ค่าที่ต้องการแสดงผล
 * @param {string} fieldKey - ชื่อฟิลด์ (weight, reps, time, distance)
 * @returns {string} - ข้อความแสดงผลแบบย่อ
 *
 * ตัวอย่างการใช้งาน:
 * formatPlaceholderValue(50, "weight") // "50 กก."
 * formatPlaceholderValue(60, "time") // "1 นาที"
 * formatPlaceholderValue(500, "distance") // "500 เมตร"
 */
export function formatPlaceholderValue(value, fieldKey) {
  if (!value && value !== 0) return "";

  switch (fieldKey) {
    case "weight":
      return formatWeight(value);
    case "reps":
      return `${value} รอบ`;
    case "time":
      return formatTimeThai(value);
    case "distance":
      return formatDistanceThai(value);
    default:
      return value.toString();
  }
}

// ===== NEW WORKOUT LOGGING INPUT FIELD HELPERS =====

/**
 * แปลงรูปแบบ "mm:ss" เป็นวินาที หรือคืนค่าที่เป็นวินาทีอยู่แล้ว
 * @param {string|number} timeString - เวลาในรูปแบบ "mm:ss" หรือวินาที
 * @returns {number} เวลาในรูปแบบวินาที
 */
export function parseTimeFromInput(timeString) {
  if (!timeString && timeString !== 0) return 0;

  // ถ้าเป็น number อยู่แล้ว (วินาที) ให้คืนค่าเลย
  if (typeof timeString === "number") {
    return timeString;
  }

  // ถ้าเป็น string ให้แปลงจาก "mm:ss" format
  if (typeof timeString === "string") {
    const [minutes, seconds] = timeString.split(":").map(Number);
    return (minutes || 0) * 60 + (seconds || 0);
  }

  return 0;
}

/**
 * ตรวจสอบและแปลงค่าจาก input field ตามประเภท
 * @param {string|number} value - ค่าที่ user กรอก
 * @param {string} fieldKey - ประเภทฟิลด์ (weight, reps, time, distance)
 * @returns {number} ค่าที่แปลงแล้ว
 */
export function parseInputValue(value, fieldKey) {
  if (!value && value !== 0) return 0;

  // ถ้าเป็น number อยู่แล้ว ให้คืนค่าเลย (ยกเว้น time ที่ต้องแปลงเป็นวินาที)
  if (typeof value === "number") {
    if (fieldKey === "time") {
      // สำหรับ time ที่เป็น number อยู่แล้ว (วินาที) ให้คืนค่าเลย
      return value;
    }
    return value;
  }

  // ถ้าเป็น string ให้แปลงตามประเภท
  if (typeof value === "string") {
    switch (fieldKey) {
      case "weight":
        return parseFloat(value) || 0;
      case "reps":
        return parseInt(value) || 0;
      case "time":
        return parseTimeFromInput(value);
      case "distance":
        // สำหรับ distance ใช้หน่วยเมตรเป็นค่าเริ่มต้น
        const num = parseFloat(value);
        return isNaN(num) ? 0 : Math.round(num);
      default:
        return parseFloat(value) || 0;
    }
  }

  return 0;
}

/**
 * ตรวจสอบว่าควรแสดงหน่วยกิโลเมตรหรือเมตรสำหรับระยะทาง
 * @param {number} meters - ระยะทางในเมตร
 * @returns {string} หน่วยที่เหมาะสม ("m" หรือ "km")
 */
export function getDistanceUnit(meters) {
  return meters >= 1000 ? "km" : "m";
}

/**
 * แปลงข้อมูลสำหรับการบันทึกลงฐานข้อมูล
 * @param {string|number} value - ค่าที่ต้องการแปลง
 * @param {string} fieldKey - ประเภทฟิลด์ (weight, reps, time, distance)
 * @returns {number|null} - ค่าที่แปลงแล้ว หรือ null ถ้าไม่มีค่า
 */
export function convertForDatabase(value, fieldKey) {
  if (!value && value !== 0) return null;

  switch (fieldKey) {
    case "weight":
      return parseFloat(value) || null;
    case "reps":
      return parseInt(value) || null;
    case "time":
      return parseTimeFromInput(value);
    case "distance":
      return parseFloat(value) || null;
    default:
      return parseFloat(value) || null;
  }
}

/**
 * แปลงวันที่เป็นรูปแบบสั้นภาษาไทย เช่น '12 ก.ค.' หรือ '12 ก.ค. 2024'
 * @param {string|Date} dateInput - วันที่ (YYYY-MM-DD, Date object, หรือ string ที่ JS รองรับ)
 * @param {boolean} withYear - ถ้า true จะใส่ปีด้วย
 * @returns {string} วันที่ในรูปแบบ 'd MMM' หรือ 'd MMM yyyy' (ภาษาไทย)
 */
export function formatShortThaiDate(dateInput, withYear = false) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const thaiMonths = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return withYear
    ? `${day} ${thaiMonths[month]} ${year}`
    : `${day} ${thaiMonths[month]}`;
}

/**
 * แปลงวินาทีเป็นชั่วโมงภาษาไทย (ปัดเศษลง)
 * @param {number} seconds - วินาที
 * @returns {string} เช่น '2 ชั่วโมง'
 */
export function formatHourThai(seconds) {
  if (!seconds && seconds !== 0) return "";
  return `${Math.floor(seconds / 3600)}`;
}

// ===== MEASURES PROGRESS HELPER FUNCTIONS =====

/**
 * ฟังก์ชันแปลงวันที่เป็นรูปแบบไทยสำหรับ chart
 * @param {string} dateString - วันที่ในรูปแบบ ISO หรือรูปแบบที่ JavaScript รองรับ
 * @returns {string} วันที่ในรูปแบบ "d MMM" (ภาษาไทย)
 */
export const formatThaiDateForChart = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

/**
 * ฟังก์ชันกรองข้อมูลตามช่วงเวลา
 * @param {Array} data - ข้อมูลการวัดผล
 * @param {string} period - ช่วงเวลา ("1m", "2m", "3m")
 * @returns {Array} ข้อมูลที่กรองแล้ว
 */
export const filterDataByPeriod = (data, period) => {
  if (!data || data.length === 0) return [];

  const now = new Date();
  const periodMap = {
    "1m": new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
    "2m": new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()),
    "3m": new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
  };

  const cutoffDate = periodMap[period];
  if (!cutoffDate) return data;

  return data.filter((item) => new Date(item.measurement_date) >= cutoffDate);
};

/**
 * เตรียมข้อมูลสำหรับ chart
 * @param {Array} data - ข้อมูลการวัดผล
 * @param {string} selectedType - ประเภทการวัดผล
 * @param {string} selectedPeriod - ช่วงเวลา
 * @param {Object} measurementTypes - ประเภทการวัดผลทั้งหมด
 * @returns {Array} ข้อมูลที่เตรียมแล้วสำหรับ chart
 */
export const prepareChartData = (
  data,
  selectedType,
  selectedPeriod,
  measurementTypes
) => {
  if (!data || data.length === 0) {
    return [];
  }

  const filteredData = filterDataByPeriod(data, selectedPeriod);
  if (filteredData.length === 0) return [];

  const typeKey = measurementTypes[selectedType]?.key;
  if (!typeKey) return [];

  const processedData = filteredData
    .map((item) => {
      const value = item[typeKey] || item.metrics?.[typeKey];
      const formattedDate = formatThaiDateForChart(item.measurement_date);

      return {
        date: item.measurement_date,
        value: value,
        formattedDate: formattedDate,
        fullDate: item.measurement_date,
        fullData: item,
      };
    })
    .filter((item) => {
      const hasValue = item.value !== null && item.value !== undefined;
      return hasValue;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // เรียงตามวันที่

  return processedData;
};

/**
 * เตรียมข้อมูล history
 * @param {Array} data - ข้อมูลการวัดผล
 * @param {string} selectedType - ประเภทการวัดผล
 * @param {Object} measurementTypes - ประเภทการวัดผลทั้งหมด
 * @returns {Array} ข้อมูล history
 */
export const prepareHistoryData = (data, selectedType, measurementTypes) => {
  if (!data || data.length === 0) return [];

  const typeKey = measurementTypes[selectedType]?.key;
  if (!typeKey) return [];

  return data
    .map((item) => ({
      date: item.measurement_date,
      value: item[typeKey] || item.metrics?.[typeKey],
      formattedDate: formatThaiDateForChart(item.measurement_date),
      healthId: item.member_health_id, // เพิ่ม healthId สำหรับการแก้ไข
      fullData: item,
    }))
    .filter((item) => item.value !== null && item.value !== undefined)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // เรียงจากใหม่ไปเก่า
};

/**
 * คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง
 * @param {Array} chartData - ข้อมูล chart
 * @returns {Object|null} ข้อมูลการเปลี่ยนแปลง หรือ null ถ้าไม่มีข้อมูลเพียงพอ
 */
export const calculateTrend = (chartData) => {
  if (chartData.length < 2) return null;

  const latest = chartData[chartData.length - 1].value;
  const previous = chartData[chartData.length - 2].value;

  if (previous === 0) return null; // ป้องกันการหารด้วย 0

  const change = ((latest - previous) / previous) * 100;

  return {
    percentage: Math.abs(change).toFixed(1),
    isPositive: change > 0,
  };
};

/**
 * ข้อมูลประเภทการวัดผลและหน่วย
 */
export const MEASUREMENT_TYPES = {
  weight: { label: "น้ำหนัก", unit: "กก.", key: "weight" },
  bodyfat: { label: "ไขมันร่างกาย", unit: "%", key: "bodyfat" },
  chest: { label: "รอบอก", unit: "ซม.", key: "chest" },
  waist: { label: "รอบเอว", unit: "ซม.", key: "waist" },
  arm: { label: "รอบแขน", unit: "ซม.", key: "arm" },
  thigh: { label: "รอบต้นขา", unit: "ซม.", key: "thigh" },
};

/**
 * ตัวเลือกช่วงเวลา
 */
export const PERIOD_OPTIONS = [
  { value: "1m", label: "1 เดือน" },
  { value: "2m", label: "2 เดือน" },
  { value: "3m", label: "3 เดือน" },
];
