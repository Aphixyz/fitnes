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
 * Calculate BMI from height and weight
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} - BMI value
 */
export function calculateBMI(weight, height) {
  // Convert height from cm to m
  const heightInMeters = height / 100;

  // Calculate BMI: weight(kg) / height(m)^2
  return (weight / (heightInMeters * heightInMeters)).toFixed(2);
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
 * Calculate daily calorie needs
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @param {string} activityLevel - Activity level
 * @returns {number} - Daily calorie needs
 */
export function calculateDailyCalories(
  weight,
  height,
  age,
  gender,
  activityLevel = "moderate"
) {
  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Apply activity multiplier
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    veryActive: 1.9, // Very hard exercise & physical job or 2x training
  };

  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
}
