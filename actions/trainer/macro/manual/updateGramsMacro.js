"use server";

import {
  convertGramsToRatios,
  convertRatiosToGrams,
} from "@/utils/macro-utils";
import { updateRatioMacro, getCurrentMacroPlan } from "./updateRatioMacro";

/**
 * อัปเดต Macro Plan แบบกำหนดกรัม
 *
 * @param {number} macroPlanId - รหัส macro plan ที่ต้องการแก้ไข
 * @param {number} trainerId - รหัส trainer (สำหรับตรวจสอบสิทธิ์)
 * @param {number} proteinGrams - โปรตีนเป็นกรัมใหม่
 * @param {number} carbGrams - คาร์บเป็นกรัมใหม่
 * @param {number} fatGrams - ไขมันเป็นกรัมใหม่
 * @returns {Promise<Object>} ผลลัพธ์การอัปเดต macro plan
 */
export async function updateGramsMacro(
  macroPlanId,
  trainerId,
  proteinGrams,
  carbGrams,
  fatGrams
) {
  try {
    // ตรวจสอบ input parameters
    if (!macroPlanId || !trainerId) {
      throw new Error("ต้องระบุ macroPlanId และ trainerId");
    }

    if (proteinGrams < 0 || carbGrams < 0 || fatGrams < 0) {
      throw new Error("ค่ากรัมทั้งหมดต้องเป็นบวก");
    }

    if (proteinGrams === 0 && carbGrams === 0 && fatGrams === 0) {
      throw new Error("ต้องกำหนด macro อย่างน้อย 1 ตัว");
    }

    // ตรวจสอบความสมเหตุสมผล (ไม่เกิน 1000g ต่อ macro)
    if (proteinGrams > 1000 || carbGrams > 1000 || fatGrams > 1000) {
      throw new Error("ค่ากรัมต่อ macro ไม่ควรเกิน 1000g");
    }

    // คำนวณ totalCalories และ ratios จากกรัมใหม่
    const totalCal = proteinGrams * 4 + carbGrams * 4 + fatGrams * 9;

    if (totalCal === 0) {
      throw new Error("Total calories ต้องมากกว่า 0");
    }

    // ใช้ helper function เพื่อแปลงกรัมเป็น ratios
    const { calorie_target, protein_ratio, carb_ratio, fat_ratio } =
      convertGramsToRatios(proteinGrams, carbGrams, fatGrams);

    // เรียกใช้ updateRatioMacro โดยส่งค่าที่คำนวณได้
    const result = await updateRatioMacro(
      macroPlanId,
      trainerId,
      calorie_target,
      protein_ratio,
      carb_ratio,
      fat_ratio
    );

    // ถ้าสำเร็จ ให้เพิ่มข้อมูล grams ลงใน response
    if (result.success) {
      return {
        ...result,
        mode: "grams",
        grams: {
          protein_g: proteinGrams,
          carb_g: carbGrams,
          fat_g: fatGrams,
        },
        input_grams: {
          protein_g: proteinGrams,
          carb_g: carbGrams,
          fat_g: fatGrams,
        },
        calculated: {
          total_calories: totalCal,
          protein_ratio,
          carb_ratio,
          fat_ratio,
        },
        message: "อัปเดต Macro Plan (แบบกรัม) สำเร็จ",
      };
    } else {
      return result;
    }
  } catch (error) {
    console.error("Error updating grams macro plan:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการอัปเดต Macro Plan แบบกรัม",
    };
  }
}

/**
 * ดึงข้อมูล Macro Plan ปัจจุบันในรูปแบบ Grams สำหรับแสดงผลก่อนแก้ไข
 *
 * @param {number} macroPlanId - รหัส macro plan
 * @param {number} trainerId - รหัส trainer (สำหรับตรวจสอบสิทธิ์)
 * @returns {Promise<Object>} ข้อมูล macro plan ปัจจุบันในรูปแบบ grams
 */
export async function getCurrentMacroPlanAsGrams(macroPlanId, trainerId) {
  try {
    // ดึงข้อมูลปัจจุบันในรูปแบบ ratios
    const currentPlanResult = await getCurrentMacroPlan(macroPlanId, trainerId);

    if (!currentPlanResult.success) {
      return currentPlanResult;
    }

    const plan = currentPlanResult.plan;

    // แปลงจาก ratios เป็น grams
    const grams = convertRatiosToGrams(
      plan.macros.calorie_target,
      plan.macros.protein_ratio,
      plan.macros.carb_ratio,
      plan.macros.fat_ratio
    );

    return {
      success: true,
      plan: {
        ...plan,
        grams: {
          protein_g: grams.protein_g,
          carb_g: grams.carb_g,
          fat_g: grams.fat_g,
          total_calories: plan.macros.calorie_target,
        },
      },
      summary: {
        ...currentPlanResult.summary,
        display_mode: "grams",
        grams_summary: `Protein: ${grams.protein_g}g | Carb: ${grams.carb_g}g | Fat: ${grams.fat_g}g | Total: ${plan.macros.calorie_target} cal`,
      },
    };
  } catch (error) {
    console.error("Error getting current macro plan as grams:", error);
    return {
      success: false,
      message:
        error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล macro plan แบบกรัม",
    };
  }
}
