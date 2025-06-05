"use server";

import db from "@/lib/db";
import {
  calculateDailyTargets,
  calculateWeeklyTargets,
  calculateMonthlyTargets,
  createMacroCardsData,
  isMacroPlanActive,
} from "./TargetCalculator";

/**
 * ดึงข้อมูล Dashboard สำหรับสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} ข้อมูล dashboard
 */
export async function getDashboardData(memberId) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    // ดึงข้อมูลสมาชิก
    const [memberData] = await db.query(
      `SELECT 
        member_id,
        member_firstname,
        member_lastname,
        member_gender,
        member_dob,
        member_email
       FROM member 
       WHERE member_id = ?`,
      [memberId]
    );

    if (!memberData || memberData.length === 0) {
      throw new Error("ไม่พบข้อมูลสมาชิก");
    }

    const member = memberData[0];

    // ดึงข้อมูลสุขภาพล่าสุด
    const [healthData] = await db.query(
      `SELECT 
        member_health_weight,
        member_health_height,
        member_health_bodyfat,
        member_activity_level,
        member_health_measurementdate
       FROM member_health 
       WHERE member_id = ? 
       ORDER BY member_health_measurementdate DESC 
       LIMIT 1`,
      [memberId]
    );

    if (!healthData || healthData.length === 0) {
      throw new Error("ไม่พบข้อมูลสุขภาพ กรุณาทำ onboarding ก่อน");
    }

    const health = healthData[0];

    // ดึงข้อมูล macro plan ที่ active
    const [macroPlanData] = await db.query(
      `SELECT 
        macro_plan_id,
        trainer_id,
        protein_ratio,
        carb_ratio,
        fat_ratio,
        start_date,
        end_date,
        plan_status,
        created_at
       FROM macro_plan 
       WHERE member_id = ? AND plan_status = 'active'
       AND CURDATE() BETWEEN start_date AND end_date
       ORDER BY created_at DESC 
       LIMIT 1`,
      [memberId]
    );

    if (!macroPlanData || macroPlanData.length === 0) {
      throw new Error("ไม่พบแผนโภชนาการที่ active กรุณาติดต่อเทรนเนอร์");
    }

    const macroPlan = macroPlanData[0];

    // ตรวจสอบว่า macro plan active หรือไม่
    if (!isMacroPlanActive(macroPlan)) {
      throw new Error("แผนโภชนาการหมดอายุแล้ว กรุณาติดต่อเทรนเนอร์");
    }

    // รวมข้อมูล member profile
    const memberProfile = {
      ...member,
      ...health,
    };

    // คำนวณ targets
    const dailyTargets = calculateDailyTargets(memberProfile, macroPlan);
    if (!dailyTargets.success) {
      throw new Error(dailyTargets.message);
    }

    const weeklyTargets = calculateWeeklyTargets(dailyTargets);
    const monthlyTargets = calculateMonthlyTargets(dailyTargets);

    // สร้าง macro cards data
    const targets = {
      daily: dailyTargets.daily,
      weekly: weeklyTargets.weekly,
      monthly: monthlyTargets.monthly,
    };

    // ดึงข้อมูลเทรนเนอร์ (ถ้ามี)
    let trainerInfo = null;
    if (macroPlan.trainer_id) {
      const [trainerData] = await db.query(
        `SELECT 
          trainer_firstname,
          trainer_lastname,
          trainer_specialization
         FROM trainer 
         WHERE trainer_id = ?`,
        [macroPlan.trainer_id]
      );

      if (trainerData && trainerData.length > 0) {
        trainerInfo = trainerData[0];
      }
    }

    return {
      success: true,
      data: {
        member: {
          id: member.member_id,
          name: `${member.member_firstname} ${member.member_lastname}`,
          email: member.member_email,
          gender: member.member_gender,
          dateOfBirth: member.member_dob,
        },
        health: {
          weight: health.member_health_weight,
          height: health.member_health_height,
          bodyFat: health.member_health_bodyfat,
          activityLevel: health.member_activity_level,
          lastMeasurement: health.member_health_measurementdate,
        },
        macroPlan: {
          id: macroPlan.macro_plan_id,
          ratios: {
            protein: macroPlan.protein_ratio,
            carb: macroPlan.carb_ratio,
            fat: macroPlan.fat_ratio,
          },
          period: {
            startDate: macroPlan.start_date,
            endDate: macroPlan.end_date,
          },
          status: macroPlan.plan_status,
        },
        targets,
        calculations: dailyTargets.calculations,
        trainer: trainerInfo,
      },
    };
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล dashboard",
    };
  }
}

/**
 * ดึงข้อมูล macro cards สำหรับ period ที่เลือก
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} period - "daily" | "weekly" | "monthly"
 * @returns {Promise<Object>} macro cards data
 */
export async function getMacroCardsData(memberId, period = "daily") {
  try {
    const dashboardData = await getDashboardData(memberId);

    if (!dashboardData.success) {
      throw new Error(dashboardData.message);
    }

    const macroCards = createMacroCardsData(dashboardData.data.targets, period);

    return {
      success: true,
      data: {
        period,
        cards: macroCards,
        calculations: dashboardData.data.calculations,
      },
    };
  } catch (error) {
    console.error("Error getting macro cards data:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล macro cards",
    };
  }
}

/**
 * ดึงสถิติสรุปสำหรับ dashboard
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} สถิติสรุป
 */
export async function getDashboardStats(memberId) {
  try {
    const dashboardData = await getDashboardData(memberId);

    if (!dashboardData.success) {
      throw new Error(dashboardData.message);
    }

    const { data } = dashboardData;

    // คำนวณ BMI
    const heightInM = data.health.height / 100;
    const bmi = data.health.weight / (heightInM * heightInM);

    // กำหนดสถานะ BMI
    let bmiStatus = "ปกติ";
    if (bmi < 18.5) bmiStatus = "น้ำหนักน้อย";
    else if (bmi >= 25) bmiStatus = "น้ำหนักเกิน";
    else if (bmi >= 30) bmiStatus = "อ้วน";

    // คำนวณวันที่เหลือของแผน
    const today = new Date();
    const endDate = new Date(data.macroPlan.period.endDate);
    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
    );

    return {
      success: true,
      data: {
        bmi: {
          value: Math.round(bmi * 10) / 10,
          status: bmiStatus,
        },
        planProgress: {
          daysRemaining,
          totalDays: Math.ceil(
            (endDate - new Date(data.macroPlan.period.startDate)) /
              (1000 * 60 * 60 * 24)
          ),
        },
        lastUpdate: data.health.lastMeasurement,
        tdee: data.calculations.tdee,
        bmr: data.calculations.bmr,
      },
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงสถิติ",
    };
  }
}
