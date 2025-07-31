/**
 * Utility functions สำหรับจัดการข้อมูล Progress Dashboard
 */

/**
 * คำนวณ BMI จากน้ำหนักและส่วนสูง
 * @param {number} weight - น้ำหนัก (kg)
 * @param {number} height - ส่วนสูง (cm)
 * @returns {number} BMI value
 */
export function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

/**
 * คำนวณ Body Fat Percentage จากข้อมูลต่างๆ
 * @param {number} weight - น้ำหนัก (kg)
 * @param {number} chest - รอบอก (cm)
 * @param {number} waist - รอบเอว (cm)
 * @param {number} hip - รอบสะโพก (cm)
 * @param {string} gender - เพศ ('male' หรือ 'female')
 * @returns {number} Body Fat Percentage
 */
export function calculateBodyFatPercentage(weight, chest, waist, hip, gender) {
  if (!weight || !chest || !waist || !hip || !gender) return null;

  // ใช้สูตร U.S. Navy Body Fat Calculator
  if (gender === "male") {
    const bodyFat =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waist - chest) +
          0.15456 * Math.log10(weight)) -
      450;
    return Math.max(0, Math.min(100, bodyFat)).toFixed(1);
  } else {
    const bodyFat =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waist + hip - chest) +
          0.221 * Math.log10(weight)) -
      450;
    return Math.max(0, Math.min(100, bodyFat)).toFixed(1);
  }
}

/**
 * คำนวณ Lean Body Mass
 * @param {number} weight - น้ำหนัก (kg)
 * @param {number} bodyFatPercentage - เปอร์เซ็นต์ไขมันในร่างกาย
 * @returns {number} Lean Body Mass (kg)
 */
export function calculateLeanBodyMass(weight, bodyFatPercentage) {
  if (!weight || !bodyFatPercentage) return null;
  return (weight * (1 - bodyFatPercentage / 100)).toFixed(1);
}

/**
 * คำนวณ Total Daily Energy Expenditure (TDEE)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {number} activityLevel - ระดับกิจกรรม (1-5)
 * @returns {number} TDEE
 */
export function calculateTDEE(bmr, activityLevel) {
  const activityMultipliers = {
    1: 1.2, // Sedentary
    2: 1.375, // Lightly active
    3: 1.55, // Moderately active
    4: 1.725, // Very active
    5: 1.9, // Extremely active
  };

  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
}

/**
 * คำนวณ Basal Metabolic Rate (BMR) ด้วยสูตร Mifflin-St Jeor
 * @param {number} weight - น้ำหนัก (kg)
 * @param {number} height - ส่วนสูง (cm)
 * @param {number} age - อายุ
 * @param {string} gender - เพศ
 * @returns {number} BMR
 */
export function calculateBMR(weight, height, age, gender) {
  if (!weight || !height || !age || !gender) return null;

  if (gender === "male") {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
}

/**
 * แปลง week number เป็นช่วงวันที่
 * @param {number} weekNumber - เลขสัปดาห์ (YEARWEEK format)
 * @returns {Object} { startDate, endDate }
 */
export function weekNumberToDateRange(weekNumber) {
  const year = Math.floor(weekNumber / 100);
  const week = weekNumber % 100;

  // สร้างวันที่เริ่มต้นของปี
  const januaryFirst = new Date(year, 0, 1);
  const daysToAdd = (week - 1) * 7;

  // หาวันจันทร์ของสัปดาห์นั้น
  const startDate = new Date(januaryFirst);
  startDate.setDate(januaryFirst.getDate() + daysToAdd);

  // ปรับให้เป็นวันจันทร์
  const dayOfWeek = startDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToMonday);

  // วันอาทิตย์
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

/**
 * คำนวณเปอร์เซ็นต์ความคืบหน้าเป้าหมาย
 * @param {number} current - ค่าปัจจุบัน
 * @param {number} target - ค่าเป้าหมาย
 * @param {number} start - ค่าเริ่มต้น
 * @returns {number} เปอร์เซ็นต์ความคืบหน้า (0-100)
 */
export function calculateProgressPercentage(current, target, start) {
  if (!current || !target || !start) return 0;

  const totalChange = target - start;
  const currentChange = current - start;

  if (totalChange === 0) return 100;

  const percentage = (currentChange / totalChange) * 100;
  return Math.max(0, Math.min(100, percentage)).toFixed(1);
}

/**
 * ตรวจสอบสถานะเป้าหมาย
 * @param {string} goalType - ประเภทเป้าหมาย
 * @param {number} current - ค่าปัจจุบัน
 * @param {number} target - ค่าเป้าหมาย
 * @param {Date} endDate - วันสิ้นสุดเป้าหมาย
 * @returns {string} สถานะ ('on_track', 'behind', 'ahead', 'completed')
 */
export function getGoalStatus(goalType, current, target, endDate) {
  const today = new Date();
  const end = new Date(endDate);
  const isExpired = today > end;

  if (isExpired) {
    return "expired";
  }

  const progress = calculateProgressPercentage(current, target, 0);
  const timeProgress = ((today - new Date()) / (end - new Date())) * 100;

  if (goalType === "weight_loss") {
    if (current <= target) return "completed";
    if (progress >= timeProgress) return "on_track";
    return "behind";
  } else if (goalType === "weight_gain") {
    if (current >= target) return "completed";
    if (progress >= timeProgress) return "on_track";
    return "behind";
  } else {
    if (progress >= 100) return "completed";
    if (progress >= timeProgress) return "on_track";
    return "behind";
  }
}

/**
 * จัดรูปแบบข้อมูลสำหรับ Chart
 * @param {Array} data - ข้อมูลดิบ
 * @param {string} dateField - ชื่อ field วันที่
 * @param {string} valueField - ชื่อ field ค่า
 * @returns {Array} ข้อมูลที่จัดรูปแบบแล้วสำหรับ chart
 */
export function formatChartData(data, dateField, valueField) {
  return data.map((item) => ({
    date: item[dateField],
    value: parseFloat(item[valueField]) || 0,
  }));
}

/**
 * คำนวณสถิติพื้นฐาน
 * @param {Array} data - ข้อมูลตัวเลข
 * @returns {Object} { min, max, avg, total }
 */
export function calculateBasicStats(data) {
  if (!data || data.length === 0) {
    return { min: 0, max: 0, avg: 0, total: 0 };
  }

  const numbers = data.map((d) => parseFloat(d) || 0).filter((n) => !isNaN(n));

  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    avg: (numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(1),
    total: numbers.reduce((a, b) => a + b, 0),
  };
}
