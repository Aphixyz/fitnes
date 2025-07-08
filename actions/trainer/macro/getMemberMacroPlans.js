"use server";

import pool from "@/lib/db";
import { isMacroPlanActive } from "../../macro-engine/macro-engine";

/**
 * ดึงรายการแผนโภชนาการทั้งหมดของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} trainerId - รหัสเทรนเนอร์ (เพื่อตรวจสอบสิทธิ์)
 * @returns {Promise<Object>} รายการแผนโภชนาการ
 */
export async function getMemberMacroPlans(memberId, trainerId) {
  const connection = await pool.getConnection();

  try {
    if (!memberId || !trainerId) {
      throw new Error("ข้อมูลสมาชิกและเทรนเนอร์จำเป็นต้องระบุ");
    }

    // ตรวจสอบว่าสมาชิกมีอยู่
    const [memberExists] = await connection.query(
      "SELECT member_id, member_firstname, member_lastname FROM member WHERE member_id = ?",
      [memberId]
    );

    if (!memberExists || memberExists.length === 0) {
      throw new Error("ไม่พบข้อมูลสมาชิก");
    }

    // ดึงรายการแผนโภชนาการทั้งหมด
    const [plans] = await connection.query(
      `SELECT mp.*, 
              t.trainer_firstname, t.trainer_lastname, t.trainer_specialization,
              m.member_firstname, m.member_lastname
       FROM macro_plan mp
       JOIN trainer t ON mp.trainer_id = t.trainer_id
       JOIN member m ON mp.member_id = m.member_id
       WHERE mp.member_id = ? AND mp.trainer_id = ?
       ORDER BY mp.created_at DESC`,
      [memberId, trainerId]
    );

    // ประมวลผลข้อมูลแผนและเพิ่มสถานะ
    const processedPlans = await Promise.all(
      plans.map(async (plan) => {
        const isActive = await isMacroPlanActive(plan);
        const today = new Date();
        const startDate = new Date(plan.start_date);
        const endDate = new Date(plan.end_date);

        // กำหนดสถานะแผน
        let planStatus = plan.plan_status;
        let displayStatus = "ไม่ใช้งาน";
        let statusColor = "gray";

        if (plan.plan_status === "active") {
          if (isActive) {
            displayStatus = "ใช้งาน";
            statusColor = "green";
          } else {
            displayStatus = "หมดอายุ";
            statusColor = "red";
            planStatus = "expired";
          }
        } else if (plan.plan_status === "inactive") {
          displayStatus = "ไม่ใช้งาน";
          statusColor = "gray";
        }

        // คำนวณระยะเวลาการใช้งาน
        const durationDays = Math.ceil(
          (endDate - startDate) / (1000 * 60 * 60 * 24)
        );

        return {
          ...plan,
          actualStatus: planStatus,
          displayStatus,
          statusColor,
          isActive,
          durationDays,
          formattedDates: {
            startDate: startDate.toLocaleDateString("th-TH"),
            endDate: endDate.toLocaleDateString("th-TH"),
            createdAt: new Date(plan.created_at).toLocaleDateString("th-TH"),
          },
          trainerName: `${plan.trainer_firstname} ${plan.trainer_lastname}`,
          memberName: `${plan.member_firstname} ${plan.member_lastname}`,
          // เพิ่มข้อมูลสำหรับ UI
          macroSummary: {
            protein: parseFloat(plan.protein_ratio),
            carb: parseFloat(plan.carb_ratio),
            fat: parseFloat(plan.fat_ratio),
          },
        };
      })
    );

    // แยกแผนตามสถานะ
    const activePlans = processedPlans.filter(
      (plan) => plan.actualStatus === "active" && plan.isActive
    );
    const expiredPlans = processedPlans.filter(
      (plan) => plan.actualStatus === "expired" || !plan.isActive
    );
    const inactivePlans = processedPlans.filter(
      (plan) => plan.actualStatus === "inactive"
    );

    return {
      success: true,
      data: {
        member: memberExists[0],
        plans: processedPlans,
        summary: {
          total: processedPlans.length,
          active: activePlans.length,
          expired: expiredPlans.length,
          inactive: inactivePlans.length,
        },
        categorized: {
          active: activePlans,
          expired: expiredPlans,
          inactive: inactivePlans,
        },
      },
      message: "ดึงข้อมูลแผนโภชนาการสำเร็จ",
    };
  } catch (error) {
    console.error("Error getting member macro plans:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแผนโภชนาการ",
    };
  } finally {
    connection.release();
  }
}

/**
 * ดึงข้อมูลแผนโภชนาการเฉพาะรายการ
 * @param {number} planId - รหัสแผนโภชนาการ
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} ข้อมูลแผนโภชนาการ
 */
export async function getMacroPlanById(planId, trainerId) {
  const connection = await pool.getConnection();

  try {
    if (!planId || !trainerId) {
      throw new Error("ข้อมูลแผนและเทรนเนอร์จำเป็นต้องระบุ");
    }

    // ดึงข้อมูลแผน
    const [plan] = await connection.query(
      `SELECT mp.*, 
              t.trainer_firstname, t.trainer_lastname, t.trainer_specialization,
              m.member_firstname, m.member_lastname, m.member_email
       FROM macro_plan mp
       JOIN trainer t ON mp.trainer_id = t.trainer_id
       JOIN member m ON mp.member_id = m.member_id
       WHERE mp.macro_plan_id = ? AND mp.trainer_id = ?`,
      [planId, trainerId]
    );

    if (!plan || plan.length === 0) {
      throw new Error("ไม่พบแผนโภชนาการหรือไม่มีสิทธิ์เข้าถึง");
    }

    const planData = plan[0];
    const isActive = await isMacroPlanActive(planData);

    return {
      success: true,
      data: {
        ...planData,
        isActive,
        trainerName: `${planData.trainer_firstname} ${planData.trainer_lastname}`,
        memberName: `${planData.member_firstname} ${planData.member_lastname}`,
        macroSummary: {
          protein: parseFloat(planData.protein_ratio),
          carb: parseFloat(planData.carb_ratio),
          fat: parseFloat(planData.fat_ratio),
        },
      },
      message: "ดึงข้อมูลแผนโภชนาการสำเร็จ",
    };
  } catch (error) {
    console.error("Error getting macro plan by ID:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแผนโภชนาการ",
    };
  } finally {
    connection.release();
  }
}

/**
 * ลบแผนโภชนาการ
 * @param {number} planId - รหัสแผนโภชนาการ
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} ผลลัพธ์การลบ
 */
export async function deleteMacroPlan(planId, trainerId) {
  const connection = await pool.getConnection();

  try {
    if (!planId || !trainerId) {
      throw new Error("ข้อมูลแผนและเทรนเนอร์จำเป็นต้องระบุ");
    }

    // ตรวจสอบว่าแผนมีอยู่และเทรนเนอร์มีสิทธิ์ลบ
    const [planExists] = await connection.query(
      `SELECT macro_plan_id, trainer_id, member_id, plan_status
       FROM macro_plan 
       WHERE macro_plan_id = ? AND trainer_id = ?`,
      [planId, trainerId]
    );

    if (!planExists || planExists.length === 0) {
      throw new Error("ไม่พบแผนโภชนาการหรือไม่มีสิทธิ์ลบ");
    }

    const plan = planExists[0];

    // ตรวจสอบว่าเป็นแผนที่ active อยู่หรือไม่
    if (plan.plan_status === "active") {
      throw new Error(
        "ไม่สามารถลบแผนที่กำลังใช้งานอยู่ได้ กรุณาปิดการใช้งานก่อน"
      );
    }

    // ลบแผน
    await connection.query(
      "DELETE FROM macro_plan WHERE macro_plan_id = ? AND trainer_id = ?",
      [planId, trainerId]
    );

    return {
      success: true,
      message: "ลบแผนโภชนาการเรียบร้อยแล้ว",
      data: { planId },
    };
  } catch (error) {
    console.error("Error deleting macro plan:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการลบแผนโภชนาการ",
    };
  } finally {
    connection.release();
  }
}

/**
 * ดึงสถิติแผนโภชนาการของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} สถิติแผนโภชนาการ
 */
export async function getMemberMacroPlansStats(memberId, trainerId) {
  const connection = await pool.getConnection();

  try {
    if (!memberId || !trainerId) {
      throw new Error("ข้อมูลสมาชิกและเทรนเนอร์จำเป็นต้องระบุ");
    }

    // ดึงสถิติแผน
    const [stats] = await connection.query(
      `SELECT 
         COUNT(*) as total_plans,
         COUNT(CASE WHEN plan_status = 'active' THEN 1 END) as active_plans,
         COUNT(CASE WHEN plan_status = 'inactive' THEN 1 END) as inactive_plans,
         MIN(created_at) as first_plan_date,
         MAX(created_at) as latest_plan_date
       FROM macro_plan 
       WHERE member_id = ? AND trainer_id = ?`,
      [memberId, trainerId]
    );

    const statsData = stats[0];

    return {
      success: true,
      data: {
        totalPlans: parseInt(statsData.total_plans),
        activePlans: parseInt(statsData.active_plans),
        inactivePlans: parseInt(statsData.inactive_plans),
        firstPlanDate: statsData.first_plan_date,
        latestPlanDate: statsData.latest_plan_date,
      },
      message: "ดึงสถิติแผนโภชนาการสำเร็จ",
    };
  } catch (error) {
    console.error("Error getting macro plans stats:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงสถิติแผนโภชนาการ",
    };
  } finally {
    connection.release();
  }
}
