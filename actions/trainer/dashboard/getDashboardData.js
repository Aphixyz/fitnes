"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูลครอบคลุมสำหรับ Trainer Dashboard
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} ข้อมูล dashboard ทั้งหมด
 */
export async function getDashboardData(trainerId) {
  const connection = await pool.getConnection();

  try {
    // แปลง trainerId เป็นตัวเลข
    const trainerIdNum = parseInt(trainerId, 10);
    if (isNaN(trainerIdNum)) {
      throw new Error("Invalid trainerId");
    }

    // 1. Key Metrics - สถิติหลักทั้งหมด
    const keyMetricsQuery = `
      SELECT 
        -- จำนวนสมาชิกทั้งหมดที่ active
        COUNT(DISTINCT CASE 
          WHEN r.registration_enddate >= CURDATE() THEN r.member_id 
        END) as total_members,
        
        -- จำนวนสมาชิกที่มีกิจกรรมใน 7 วันที่ผ่านมา
        COUNT(DISTINCT CASE 
          WHEN r.registration_enddate >= CURDATE() 
          AND (recent_activity.member_id IS NOT NULL) THEN r.member_id 
        END) as active_members_7days,
        
        -- จำนวนสมาชิกที่ไม่มีกิจกรรมใน 7 วันที่ผ่านมา
        COUNT(DISTINCT CASE 
          WHEN r.registration_enddate >= CURDATE() 
          AND (recent_activity.member_id IS NULL) THEN r.member_id 
        END) as inactive_members_7days
        
      FROM registration r
      LEFT JOIN (
        SELECT DISTINCT member_id 
        FROM (
          SELECT member_id FROM exercise_log 
          WHERE log_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          UNION
          SELECT member_id FROM intake_logs 
          WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          UNION
          SELECT member_id FROM member_health 
          WHERE member_health_measurementdate >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ) as activities
      ) recent_activity ON r.member_id = recent_activity.member_id
      WHERE r.trainer_id = ?
    `;

    // 2. Member Growth - การเติบโตของสมาชิกใน 6 เดือนที่ผ่านมา
    const memberGrowthQuery = `
      SELECT 
        DATE_FORMAT(r.registration_startdate, '%Y-%m') as month,
        COUNT(DISTINCT r.member_id) as new_members
      FROM registration r
      WHERE r.trainer_id = ? 
        AND r.registration_startdate >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(r.registration_startdate, '%Y-%m')
      ORDER BY month ASC
    `;

    // 3. Member Progress Overview - ความก้าวหน้าของสมาชิก
    const memberProgressQuery = `
      SELECT 
        AVG(latest.member_health_weight - earliest.member_health_weight) as avg_weight_change,
        COUNT(DISTINCT mh.member_id) as members_with_progress,
        AVG(CASE 
          WHEN latest.member_health_weight > earliest.member_health_weight 
          THEN latest.member_health_weight - earliest.member_health_weight 
          ELSE 0 
        END) as avg_weight_gain,
        AVG(CASE 
          WHEN latest.member_health_weight < earliest.member_health_weight 
          THEN earliest.member_health_weight - latest.member_health_weight 
          ELSE 0 
        END) as avg_weight_loss
      FROM member_health mh
      INNER JOIN registration r ON mh.member_id = r.member_id
      INNER JOIN (
        SELECT member_id, MIN(member_health_measurementdate) as first_date
        FROM member_health 
        WHERE member_health_weight IS NOT NULL
        GROUP BY member_id
      ) first ON mh.member_id = first.member_id AND mh.member_health_measurementdate = first.first_date
      INNER JOIN member_health earliest ON mh.member_id = earliest.member_id 
        AND earliest.member_health_measurementdate = first.first_date
      INNER JOIN (
        SELECT member_id, MAX(member_health_measurementdate) as last_date
        FROM member_health 
        WHERE member_health_weight IS NOT NULL
        GROUP BY member_id
      ) last ON mh.member_id = last.member_id
      INNER JOIN member_health latest ON mh.member_id = latest.member_id 
        AND latest.member_health_measurementdate = last.last_date
      WHERE r.trainer_id = ? 
        AND r.registration_enddate >= CURDATE()
        AND earliest.member_health_weight IS NOT NULL
        AND latest.member_health_weight IS NOT NULL
    `;

    // 4. Workout Completion Stats - สถิติการออกกำลังกาย
    const workoutStatsQuery = `
      SELECT 
        COUNT(DISTINCT el.exercise_log_id) as total_workouts_logged,
        COUNT(DISTINCT el.member_id) as active_workout_members,
        COUNT(DISTINCT wp.workout_plan_id) as total_workout_plans,
        AVG(weekly_logs.workouts_per_week) as avg_workouts_per_week
      FROM registration r
      LEFT JOIN workout_plan wp ON r.member_id = wp.member_id AND wp.trainer_id = ?
      LEFT JOIN exercise_log el ON wp.workout_plan_id = el.workout_plan_id 
        AND el.log_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      LEFT JOIN (
        SELECT 
          el.member_id,
          COUNT(DISTINCT YEARWEEK(el.log_date)) as weeks,
          COUNT(el.exercise_log_id) as total_logs,
          COUNT(el.exercise_log_id) / NULLIF(COUNT(DISTINCT YEARWEEK(el.log_date)), 0) as workouts_per_week
        FROM exercise_log el
        INNER JOIN registration r2 ON el.member_id = r2.member_id
        WHERE r2.trainer_id = ? 
          AND el.log_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY el.member_id
      ) weekly_logs ON r.member_id = weekly_logs.member_id
      WHERE r.trainer_id = ? AND r.registration_enddate >= CURDATE()
    `;

    // 5. Nutrition Compliance - การปฏิบัติตามแผนโภชนาการ
    const nutritionStatsQuery = `
      SELECT 
        COUNT(DISTINCT mp.macro_plan_id) as total_macro_plans,
        COUNT(DISTINCT il.member_id) as members_logging_nutrition,
        COUNT(DISTINCT il.intake_id) as total_nutrition_logs,
        AVG(compliance.compliance_rate) as avg_compliance_rate
      FROM registration r
      LEFT JOIN macro_plan mp ON r.member_id = mp.member_id 
        AND mp.trainer_id = ? AND mp.plan_status = 'active'
      LEFT JOIN intake_logs il ON r.member_id = il.member_id 
        AND il.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      LEFT JOIN (
        SELECT 
          il2.member_id,
          (COUNT(DISTINCT il2.date) / 30.0) * 100 as compliance_rate
        FROM intake_logs il2
        INNER JOIN registration r2 ON il2.member_id = r2.member_id
        WHERE r2.trainer_id = ? 
          AND il2.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY il2.member_id
      ) compliance ON r.member_id = compliance.member_id
      WHERE r.trainer_id = ? AND r.registration_enddate >= CURDATE()
    `;

    // 6. Recent Activity - กิจกรรมล่าสุด
    const recentActivityQuery = `
      (
        SELECT 'registration' as activity_type, 
               CONCAT(m.member_firstname, ' ', m.member_lastname) as member_name,
               'เข้าร่วมใหม่' as activity_description,
               r.registration_startdate as activity_date,
               r.member_id
        FROM registration r
        INNER JOIN member m ON r.member_id = m.member_id
        WHERE r.trainer_id = ?
        ORDER BY r.registration_startdate DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 'workout' as activity_type,
               CONCAT(m.member_firstname, ' ', m.member_lastname) as member_name,
               'บันทึกการออกกำลังกาย' as activity_description,
               el.log_date as activity_date,
               el.member_id
        FROM exercise_log el
        INNER JOIN member m ON el.member_id = m.member_id
        INNER JOIN registration r ON el.member_id = r.member_id
        WHERE r.trainer_id = ?
        ORDER BY el.log_date DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 'nutrition' as activity_type,
               CONCAT(m.member_firstname, ' ', m.member_lastname) as member_name,
               'บันทึกโภชนาการ' as activity_description,
               il.date as activity_date,
               il.member_id
        FROM intake_logs il
        INNER JOIN member m ON il.member_id = m.member_id
        INNER JOIN registration r ON il.member_id = r.member_id
        WHERE r.trainer_id = ?
        ORDER BY il.date DESC
        LIMIT 5
      )
      ORDER BY activity_date DESC
      LIMIT 10
    `;

    // 7. Goal Distribution - การกระจายของเป้าหมาย
    const goalDistributionQuery = `
      SELECT 
        fg.fitness_goal_type,
        COUNT(*) as goal_count
      FROM fitness_goal fg
      INNER JOIN registration r ON fg.member_id = r.member_id
      WHERE r.trainer_id = ? 
        AND r.registration_enddate >= CURDATE()
        AND fg.fitness_goal_status = 'active'
      GROUP BY fg.fitness_goal_type
      ORDER BY goal_count DESC
    `;

    // 8. Active Members with Packages - สมาชิกที่ใช้แพ็คเกจอยู่ปัจจุบัน
    const activeMembersPackagesQuery = `
      SELECT 
        m.member_id,
        CONCAT(m.member_firstname, ' ', m.member_lastname) as member_name,
        p.packages_name,
        r.registration_startdate,
        r.registration_enddate
      FROM registration r
      INNER JOIN member m ON r.member_id = m.member_id
      INNER JOIN packages p ON r.packages_id = p.packages_id
      WHERE r.trainer_id = ? 
        AND r.registration_enddate >= CURDATE()
      ORDER BY r.registration_enddate ASC
    `;

    // Execute all queries in parallel
    const [
      keyMetricsResult,
      memberGrowthResult,
      memberProgressResult,
      workoutStatsResult,
      nutritionStatsResult,
      recentActivityResult,
      goalDistributionResult,
      activeMembersPackagesResult
    ] = await Promise.all([
      connection.query(keyMetricsQuery, [trainerIdNum]),
      connection.query(memberGrowthQuery, [trainerIdNum]),
      connection.query(memberProgressQuery, [trainerIdNum]),
      connection.query(workoutStatsQuery, [trainerIdNum, trainerIdNum, trainerIdNum]),
      connection.query(nutritionStatsQuery, [trainerIdNum, trainerIdNum, trainerIdNum]),
      connection.query(recentActivityQuery, [trainerIdNum, trainerIdNum, trainerIdNum]),
      connection.query(goalDistributionQuery, [trainerIdNum]),
      connection.query(activeMembersPackagesQuery, [trainerIdNum])
    ]);

    // Process results
    const keyMetrics = keyMetricsResult[0][0] || {};
    const memberGrowth = memberGrowthResult[0] || [];
    const memberProgress = memberProgressResult[0][0] || {};
    const workoutStats = workoutStatsResult[0][0] || {};
    const nutritionStats = nutritionStatsResult[0][0] || {};
    const recentActivity = recentActivityResult[0] || [];
    const goalDistribution = goalDistributionResult[0] || [];
    const activeMembersPackages = activeMembersPackagesResult[0] || [];

    return {
      success: true,
      data: {
        keyMetrics: {
          totalMembers: keyMetrics.total_members || 0,
          activeMembers7Days: keyMetrics.active_members_7days || 0,
          inactiveMembers7Days: keyMetrics.inactive_members_7days || 0
        },
        memberGrowth: memberGrowth.map(row => ({
          month: row.month,
          newMembers: row.new_members,
          monthName: new Date(row.month + '-01').toLocaleDateString('th-TH', { 
            year: 'numeric', 
            month: 'short' 
          })
        })),
        memberProgress: {
          averageWeightChange: parseFloat(memberProgress.avg_weight_change) || 0,
          membersWithProgress: parseInt(memberProgress.members_with_progress) || 0,
          averageWeightGain: parseFloat(memberProgress.avg_weight_gain) || 0,
          averageWeightLoss: parseFloat(memberProgress.avg_weight_loss) || 0
        },
        workoutStats: {
          totalWorkoutsLogged: workoutStats.total_workouts_logged || 0,
          activeWorkoutMembers: workoutStats.active_workout_members || 0,
          totalWorkoutPlans: workoutStats.total_workout_plans || 0,
          averageWorkoutsPerWeek: parseFloat(workoutStats.avg_workouts_per_week || 0).toFixed(1)
        },
        nutritionStats: {
          totalMacroPlans: nutritionStats.total_macro_plans || 0,
          membersLoggingNutrition: nutritionStats.members_logging_nutrition || 0,
          totalNutritionLogs: nutritionStats.total_nutrition_logs || 0,
          averageComplianceRate: parseFloat(nutritionStats.avg_compliance_rate || 0).toFixed(1)
        },
        recentActivity: recentActivity.map(activity => ({
          type: activity.activity_type,
          memberName: activity.member_name,
          description: activity.activity_description,
          date: activity.activity_date,
          memberId: activity.member_id,
          timeAgo: getTimeAgo(activity.activity_date)
        })),
        goalDistribution,
        activeMembersPackages: activeMembersPackages.map(member => ({
          memberId: member.member_id,
          memberName: member.member_name,
          packageName: member.packages_name,
          startDate: member.registration_startdate,
          endDate: member.registration_enddate
        }))
      }
    };

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard",
      error: error.message
    };
  } finally {
    connection.release();
  }
}

/**
 * คำนวณเวลาที่ผ่านมา
 * @param {Date} date - วันที่
 * @returns {string} เวลาที่ผ่านมาในรูปแบบข้อความ
 */
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'เมื่อสักครู่';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;
  
  return new Date(date).toLocaleDateString('th-TH');
}

export default getDashboardData;