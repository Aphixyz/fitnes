/**
 * Nutrition Utilities สำหรับระบบ FitTrack
 * ใช้สำหรับคำนวณ macro planning และ calorie goals
 */

// 1. คำนวณอายุจาก date of birth
export function calcAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // ปรับอายุถ้ายังไม่ถึงวันเกิดในปีนี้
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

// 2. คำนวณ BMR ด้วยสูตร Mifflin-St Jeor
export function calcBMR(weight, height, gender, age) {
  // weight: kg, height: cm, age: years
  let bmr;

  if (gender.toLowerCase() === "male" || gender.toLowerCase() === "ชาย") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (
    gender.toLowerCase() === "female" || gender.toLowerCase() === "หญิง"
  ) {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    throw new Error("Gender must be male/female or ชาย/หญิง");
  }

  return Math.round(bmr);
}

// 4. แปลง physical activity เป็น activity factor จาก integer code
/**
 * แปลงรหัสกิจกรรม (0-3) เป็น activity factor
 * 0: 1.2 (low)
 * 1: 1.375 (moderate)
 * 2: 1.55 (high)
 * 3: 1.725 (very_high)
 * ค่าที่ไม่ตรงช่วงจะคืน 1.2 (low)
 */
export function mapActivityFactor(ActivityFactor) {
  const activityMap = {
    0: 1.2,     // low
    1: 1.375,   // moderate
    2: 1.55,    // high
    3: 1.725,   // very_high
  };
  return activityMap[ActivityFactor] || 1.2;
}

// 5. คำนวณ TDEE (Total Daily Energy Expenditure)
/**
 * คำนวณ TDEE โดยใช้ค่า activityLevel (รหัสกิจกรรม 0-3)
 * @param {number} bmr - ค่า Basal Metabolic Rate
 * @param {number} activityLevel - รหัสกิจกรรม (0-3)
 * @returns {number} TDEE (Total Daily Energy Expenditure)
 */
export function calcTDEE(bmr, activityLevel) {
  const activityFactor = mapActivityFactor(activityLevel);
  return Math.round(bmr * activityFactor);
}

// 6. ปรับ Calorie ตาม Goal type
export function adjustCaloriesForGoal(tdee, goalType) {
  const adjustments = {
    lose_weight: -500, // ลดน้ำหนัก (deficit 500 cal)
    maintain_weight: 0, // คงที่น้ำหนัก
    gain_muscle: 300, // เพิ่มกล้ามเนื้อ (surplus 300 cal)
  };

  const adjustment = adjustments[goalType] || 0;
  return tdee + adjustment;
}

// 7. Default Macro Ratios Strategy
export function getDefaultMacroRatios(goalType, experienceLevel) {
  const macroStrategies = {
    lose_weight: {
      beginner: { protein: 30, carb: 40, fat: 30 },
      intermediate: { protein: 35, carb: 35, fat: 30 },
      advanced: { protein: 40, carb: 30, fat: 30 },
    },
    maintain_weight: {
      beginner: { protein: 25, carb: 45, fat: 30 },
      intermediate: { protein: 30, carb: 40, fat: 30 },
      advanced: { protein: 30, carb: 40, fat: 30 },
    },
    gain_muscle: {
      beginner: { protein: 25, carb: 50, fat: 25 },
      intermediate: { protein: 30, carb: 45, fat: 25 },
      advanced: { protein: 35, carb: 40, fat: 25 },
    },
  };

  return (
    macroStrategies[goalType]?.[experienceLevel] ||
    macroStrategies.maintain_weight.beginner
  );
}

// 8. แปลง calories เป็น grams สำหรับแต่ละ macro
export function calcMacroGrams(calorieGoal, macroRatios) {
  // Calories per gram: Protein = 4, Carb = 4, Fat = 9
  const proteinCalories = (calorieGoal * macroRatios.protein) / 100;
  const carbCalories = (calorieGoal * macroRatios.carb) / 100;
  const fatCalories = (calorieGoal * macroRatios.fat) / 100;

  return {
    protein: Math.round(proteinCalories / 4), // grams
    carb: Math.round(carbCalories / 4), // grams
    fat: Math.round(fatCalories / 9), // grams
    calories: calorieGoal,
  };
}

/**
 * แปลงรหัส trainingFrequency (0–3) เป็นจำนวนวัน/สัปดาห์ (approx)
 * 0 -> 0, 1 -> 2 (for 1–3), 2 -> 5 (for 4–6), 3 -> 7
 */
export function mapTrainingFrequencyToDays(code) {
  switch (code) {
    case 0: return 0;
    case 1: return 2;
    case 2: return 5;
    case 3: return 7;
    default: return 0;
  }
}



// Helper function สำหรับ validate macro ratios
export function validateMacroRatios(protein, carb, fat) {
  const total = protein + carb + fat;
  return Math.abs(total - 100) < 0.01; // อนุญาตให้ผิดพลาด 0.01%
}

// Helper function สำหรับแปลง goal type เป็นภาษาไทย
export function translateGoalType(goalType) {
  const translations = {
    lose_weight: "ลดน้ำหนัก",
    maintain_weight: "คงที่น้ำหนัก",
    gain_muscle: "เพิ่มกล้ามเนื้อ",
  };

  return translations[goalType] || goalType;
}

// Helper function สำหรับแปลง experience level เป็นภาษาไทย
export function translateExperienceLevel(level) {
  const translations = {
    beginner: "มือใหม่",
    intermediate: "ปานกลาง",
    advanced: "ขั้นสูง",
  };

  return translations[level] || level;
}

