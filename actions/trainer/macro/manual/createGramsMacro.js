"use server";

import { convertGramsToRatios } from "@/utils/macro-utils";
import { createRatioMacro } from "./createRatioMacro";

/**
 * สร้าง Macro Plan แบบกำหนดกรัม
 *
 * @param {number} trainerId - รหัส trainer
 * @param {number} memberId - รหัส member
 * @param {number} proteinGrams - โปรตีนเป็นกรัม
 * @param {number} carbGrams - คาร์บเป็นกรัม
 * @param {number} fatGrams - ไขมันเป็นกรัม
 * @returns {Promise<Object>} ผลลัพธ์การสร้าง macro plan
 */
export async function createGramsMacro(
  trainerId,
  memberId,
  proteinGrams,
  carbGrams,
  fatGrams
) {
  try {
    // ตรวจสอบ input parameters
    if (!trainerId || !memberId) {
      throw new Error("ต้องระบุ trainerId และ memberId");
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

    // คำนวณ totalCalories และ ratios จากกรัม
    const totalCal = proteinGrams * 4 + carbGrams * 4 + fatGrams * 9;

    if (totalCal === 0) {
      throw new Error("Total calories ต้องมากกว่า 0");
    }

    // ใช้ helper function เพื่อแปลงกรัมเป็น ratios
    const { calorie_target, protein_ratio, carb_ratio, fat_ratio } =
      convertGramsToRatios(proteinGrams, carbGrams, fatGrams);

    // เรียกใช้ createRatioMacro โดยส่งค่าที่คำนวณได้
    const result = await createRatioMacro(
      trainerId,
      memberId,
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
        message: "สร้าง Macro Plan (แบบกรัม) สำเร็จ",
      };
    } else {
      return result;
    }
  } catch (error) {
    console.error("Error creating grams macro plan:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการสร้าง Macro Plan แบบกรัม",
    };
  }
}
