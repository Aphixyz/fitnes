// "use server";

// import db from "@/lib/db";

// /**
//  * ดึงข้อมูลความก้าวหน้าของสมาชิก
//  * @param {number} memberId - รหัสสมาชิก
//  * @param {number} days - จำนวนวันย้อนหลังที่ต้องการดึงข้อมูล (เช่น 90 วัน)
//  * @returns {Promise<Object>} - ข้อมูลความก้าวหน้า
//  */
// export async function getProgressSnapshot(memberId, days = 90) {
//   try {
//     if (!memberId) {
//       throw new Error("กรุณาระบุรหัสสมาชิก");
//     }

//     // คำนวณวันที่เริ่มต้น (วันปัจจุบันย้อนหลังไป X วัน)
//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - days);
//     const startDateStr = startDate.toISOString().split('T')[0]; // รูปแบบ YYYY-MM-DD

//     // ดึงข้อมูลน้ำหนักย้อนหลัง X วัน
//     const [weightData] = await db.query(
//       `SELECT snapshot_date, weight_kg
//        FROM progress_snapshot
//        WHERE member_id = ? 
//        AND snapshot_date >= ? 
//        ORDER BY snapshot_date ASC`,
//       [memberId, startDateStr]
//     );

//     // ดึงข้อมูล compliance ล่าสุด
//     const [complianceData] = await db.query(
//       `SELECT 
//          AVG(workout_compliance) as avg_workout_compliance,
//          AVG(nutrition_compliance) as avg_nutrition_compliance
//        FROM progress_snapshot
//        WHERE member_id = ?
//        AND snapshot_date >= ?`,
//       [memberId, startDateStr]
//     );

//     // ดึงข้อมูล health metrics ล่าสุด
//     const [latestHealthData] = await db.query(
//       `SELECT *
//        FROM progress_snapshot
//        WHERE member_id = ?
//        ORDER BY snapshot_date DESC
//        LIMIT 1`,
//       [memberId]
//     );

//     // ดึงข้อมูลเป้าหมายน้ำหนักของสมาชิก
//     const [goalData] = await db.query(
//       `SELECT target_weight_kg
//        FROM fitness_goal
//        WHERE member_id = ?
//        ORDER BY goal_date DESC
//        LIMIT 1`,
//       [memberId]
//     );

//     // ดึงข้อมูลน้ำหนักเริ่มต้น
//     const [initialWeight] = await db.query(
//       `SELECT weight_kg
//        FROM member_health
//        WHERE member_id = ?
//        ORDER BY record_date ASC
//        LIMIT 1`,
//       [memberId]
//     );

//     return {
//       weightData: weightData || [],
//       compliance: complianceData && complianceData.length > 0 ? {
//         workout: Math.round(complianceData[0].avg_workout_compliance || 0),
//         nutrition: Math.round(complianceData[0].avg_nutrition_compliance || 0)
//       } : { workout: 0, nutrition: 0 },
//       latestMetrics: latestHealthData && latestHealthData.length > 0 ? latestHealthData[0] : null,
//       targetWeight: goalData && goalData.length > 0 ? goalData[0].target_weight_kg : null,
//       initialWeight: initialWeight && initialWeight.length > 0 ? initialWeight[0].weight_kg : null
//     };
//   } catch (error) {
//     console.error("Error fetching progress data:", error);
//     return {
//       weightData: [],
//       compliance: { workout: 0, nutrition: 0 },
//       latestMetrics: null,
//       targetWeight: null,
//       initialWeight: null,
//       error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลความก้าวหน้า"
//     };
//   }
// }