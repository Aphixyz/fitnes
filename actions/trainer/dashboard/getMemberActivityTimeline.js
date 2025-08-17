"use server";

import pool from "@/lib/db";

/**
 * ดึง timeline activities ของ member สำหรับ trainer
 * @param {number} trainerId - รหัสเทรนเนอร์ (สำหรับยืนยันสิทธิ์)
 * @param {number} memberId - รหัสสมาชิกที่จะดู activities
 * @param {Object} options - ตัวเลือกการค้นหา
 * @param {number} options.days - จำนวนวันย้อนหลัง (default: 30)
 * @param {Array} options.activityTypes - ประเภทกิจกรรม (default: ['all'])
 * @param {number} options.limit - จำนวนรายการสูงสุด (default: 100)
 * @returns {Promise<Object>} ข้อมูล timeline activities
 */
export async function getMemberActivityTimeline(trainerId, memberId, options = {}) {
  const connection = await pool.getConnection();

  try {
    // Validate and parse parameters
    const trainerIdNum = parseInt(trainerId, 10);
    const memberIdNum = parseInt(memberId, 10);
    
    if (isNaN(trainerIdNum) || isNaN(memberIdNum)) {
      return {
        success: false,
        message: "Invalid trainerId or memberId"
      };
    }

    // Set default options
    const {
      days = 30,
      activityTypes = ['all'],
      limit = 100
    } = options;

    // Validate trainer-member relationship
    const relationshipQuery = `
      SELECT 
        m.member_id,
        CONCAT(m.member_firstname, ' ', m.member_lastname) as full_name,
        m.member_profileimage
      FROM member m
      INNER JOIN registration r ON m.member_id = r.member_id
      WHERE m.member_id = ? 
        AND r.trainer_id = ?
    `;

    const [relationshipResult] = await connection.query(relationshipQuery, [memberIdNum, trainerIdNum]);

    if (relationshipResult.length === 0) {
      return {
        success: false,
        message: "ไม่พบสมาชิกนี้หรือคุณไม่มีสิทธิ์เข้าถึงข้อมูล"
      };
    }

    const memberInfo = relationshipResult[0];
    const dateRange = new Date();
    dateRange.setDate(dateRange.getDate() - days);
    const startDate = dateRange.toISOString().split('T')[0];

    // Prepare activity queries based on activityTypes filter
    const shouldInclude = (type) => activityTypes.includes('all') || activityTypes.includes(type);

    let unionQueries = [];
    let queryParams = [];

    // 1. Workout logging activities
    if (shouldInclude('workout')) {
      unionQueries.push(`
        SELECT 
          'workout' as type,
          el.log_date as date,
          CONCAT(el.log_date, 'T08:00:00') as timestamp,
          wp.plan_name as program_name,
          COUNT(DISTINCT els.exercise_log_set_id) as total_sets,
          SUM(CASE WHEN els.weight IS NOT NULL AND els.reps IS NOT NULL 
              THEN els.weight * els.reps ELSE 0 END) as total_volume,
          NULL as duration,
          GROUP_CONCAT(DISTINCT pe.exercise_id ORDER BY pe.order_index SEPARATOR ',') as exercises
        FROM exercise_log el
        INNER JOIN workout_plan wp ON el.workout_plan_id = wp.workout_plan_id
        INNER JOIN workout_program wprog ON el.workout_program_id = wprog.workout_program_id
        LEFT JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
        LEFT JOIN program_exercise pe ON wprog.workout_program_id = pe.workout_program_id
        WHERE el.member_id = ? AND el.log_date >= ?
        GROUP BY el.exercise_log_id, el.log_date, wp.plan_name
      `);
      queryParams.push(memberIdNum, startDate);
    }

    // 2. Nutrition logging activities
    if (shouldInclude('nutrition')) {
      unionQueries.push(`
        SELECT 
          'nutrition' as type,
          il.date as date,
          CONCAT(il.date, 'T12:00:00') as timestamp,
          'daily_nutrition' as program_name,
          NULL as total_sets,
          NULL as total_volume,
          NULL as duration,
          CONCAT(
            'calories:', COALESCE(il.calories, 0), 
            '|protein:', COALESCE(il.protein, 0),
            '|carb:', COALESCE(il.carb, 0),
            '|fat:', COALESCE(il.fat, 0)
          ) as exercises
        FROM intake_logs il
        WHERE il.member_id = ? AND il.date >= ?
      `);
      queryParams.push(memberIdNum, startDate);
    }

    // 3. Health metrics activities (measurements)
    if (shouldInclude('health_metrics')) {
      unionQueries.push(`
        SELECT 
          'health_metrics' as type,
          mh.member_health_measurementdate as date,
          CONCAT(mh.member_health_measurementdate, 'T07:00:00') as timestamp,
          'health_measurement' as program_name,
          NULL as total_sets,
          NULL as total_volume,
          NULL as duration,
          CONCAT(
            'weight:', COALESCE(mh.member_health_weight, 0),
            '|bodyfat:', COALESCE(mh.member_health_bodyfat, 0),
            '|chest:', COALESCE(mh.member_health_chest, 0),
            '|waist:', COALESCE(mh.member_health_waist, 0),
            '|hip:', COALESCE(mh.member_health_hip, 0),
            '|arm:', COALESCE(mh.member_health_arm, 0),
            '|thigh:', COALESCE(mh.member_health_thigh, 0)
          ) as exercises
        FROM member_health mh
        WHERE mh.member_id = ? AND mh.member_health_measurementdate >= ?
          AND (mh.member_health_weight IS NOT NULL 
               OR mh.member_health_bodyfat IS NOT NULL
               OR mh.member_health_chest IS NOT NULL
               OR mh.member_health_waist IS NOT NULL
               OR mh.member_health_hip IS NOT NULL
               OR mh.member_health_arm IS NOT NULL
               OR mh.member_health_thigh IS NOT NULL)
      `);
      queryParams.push(memberIdNum, startDate);
    }

    // 4. Progress photos activities
    if (shouldInclude('progress_photo')) {
      unionQueries.push(`
        SELECT 
          'progress_photo' as type,
          mh.member_health_measurementdate as date,
          CONCAT(mh.member_health_measurementdate, 'T07:05:00') as timestamp,
          'progress_photos' as program_name,
          NULL as total_sets,
          NULL as total_volume,
          NULL as duration,
          CONCAT(
            'front:', IF(mh.photo_front IS NOT NULL, '1', '0'),
            '|side:', IF(mh.photo_side IS NOT NULL, '1', '0'),
            '|back:', IF(mh.photo_back IS NOT NULL, '1', '0')
          ) as exercises
        FROM member_health mh
        WHERE mh.member_id = ? AND mh.member_health_measurementdate >= ?
          AND (mh.photo_front IS NOT NULL 
               OR mh.photo_side IS NOT NULL 
               OR mh.photo_back IS NOT NULL)
      `);
      queryParams.push(memberIdNum, startDate);
    }

    if (unionQueries.length === 0) {
      return {
        success: false,
        message: "ไม่ได้เลือกประเภทกิจกรรมใดๆ"
      };
    }

    // Combine all queries
    const mainQuery = `
      SELECT * FROM (
        ${unionQueries.join(' UNION ALL ')}
      ) activities
      ORDER BY timestamp DESC
      LIMIT ?
    `;

    queryParams.push(limit);

    const [activitiesResult] = await connection.query(mainQuery, queryParams);

    // Process and group activities by date
    const activitiesGrouped = {};
    const activityCounts = {
      workout: 0,
      nutrition: 0,
      health_metrics: 0,
      progress_photo: 0
    };

    activitiesResult.forEach(activity => {
      const dateKey = activity.date.toISOString().split('T')[0];
      
      if (!activitiesGrouped[dateKey]) {
        activitiesGrouped[dateKey] = [];
      }

      // Count activities
      if (activityCounts.hasOwnProperty(activity.type)) {
        activityCounts[activity.type]++;
      }

      // Format activity data based on type
      let formattedActivity = {
        type: activity.type,
        timestamp: activity.timestamp,
        data: {}
      };

      switch (activity.type) {
        case 'workout':
          formattedActivity.data = {
            programName: activity.program_name,
            totalSets: parseInt(activity.total_sets) || 0,
            totalVolume: parseFloat(activity.total_volume) || 0,
            duration: activity.duration || 0,
            exercises: activity.exercises ? activity.exercises.split(',') : []
          };
          break;

        case 'nutrition':
          const nutritionData = {};
          if (activity.exercises) {
            const parts = activity.exercises.split('|');
            parts.forEach(part => {
              const [key, value] = part.split(':');
              nutritionData[key] = parseInt(value) || 0;
            });
          }
          formattedActivity.data = {
            mealType: 'daily_summary',
            totalCalories: nutritionData.calories || 0,
            protein: nutritionData.protein || 0,
            carb: nutritionData.carb || 0,
            fat: nutritionData.fat || 0,
            foods: []
          };
          break;

        case 'health_metrics':
          const metricsData = {};
          const measurements = {};
          if (activity.exercises) {
            const parts = activity.exercises.split('|');
            parts.forEach(part => {
              const [key, value] = part.split(':');
              const numValue = parseFloat(value) || 0;
              if (['chest', 'waist', 'hip', 'arm', 'thigh'].includes(key)) {
                if (numValue > 0) measurements[key] = numValue;
              } else {
                if (numValue > 0) metricsData[key] = numValue;
              }
            });
          }
          formattedActivity.data = {
            weight: metricsData.weight || null,
            bodyFat: metricsData.bodyfat || null,
            muscleMass: null, // Not available in current schema
            measurements: measurements
          };
          break;

        case 'progress_photo':
          const photoData = {};
          const angles = [];
          if (activity.exercises) {
            const parts = activity.exercises.split('|');
            parts.forEach(part => {
              const [key, value] = part.split(':');
              if (value === '1') {
                photoData[key] = true;
                angles.push(key);
              }
            });
          }
          formattedActivity.data = {
            photoCount: angles.length,
            angles: angles,
            hasComparison: angles.length >= 2
          };
          break;
      }

      activitiesGrouped[dateKey].push(formattedActivity);
    });

    // Convert to array format and sort by date
    const activities = Object.keys(activitiesGrouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({
        date: date,
        activitiesByDate: activitiesGrouped[date].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        )
      }));

    // Calculate consistency (percentage of days with any activity)
    const totalDaysWithActivity = Object.keys(activitiesGrouped).length;
    const consistency = days > 0 ? Math.round((totalDaysWithActivity / days) * 100 * 10) / 10 : 0;

    return {
      success: true,
      data: {
        member: {
          memberId: memberInfo.member_id,
          fullName: memberInfo.full_name,
          profileImage: memberInfo.member_profileimage
        },
        activities,
        summary: {
          totalDays: days,
          activitiesCounts: activityCounts,
          consistency: consistency
        }
      }
    };

  } catch (error) {
    console.error("Error fetching member activity timeline:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล timeline activities",
      error: error.message
    };
  } finally {
    connection.release();
  }
}

export default getMemberActivityTimeline;