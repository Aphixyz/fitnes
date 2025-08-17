"use server";

import db from "@/lib/db";

/**
 * Get member workout data for a specific date
 * @param {number} memberId - Member ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object} Workout data including exercise logs and sets
 */
export async function getMemberWorkoutData(memberId, date) {
  if (!memberId || !date) {
    throw new Error("กรุณาระบุรหัสสมาชิกและวันที่");
  }

  try {
    // Get workout log data for the specific date
    const [workoutLogsResult] = await db.query(
      `SELECT 
         el.exercise_log_id,
         el.member_id,
         el.workout_plan_id,
         el.workout_program_id,
         el.log_date,
         wp.plan_name,
         wpr.program_name
       FROM exercise_log el
       JOIN workout_plan wp ON el.workout_plan_id = wp.workout_plan_id
       JOIN workout_program wpr ON el.workout_program_id = wpr.workout_program_id
       WHERE el.member_id = ? AND el.log_date = ?
       ORDER BY el.exercise_log_id`,
      [memberId, date]
    );

    if (!workoutLogsResult || workoutLogsResult.length === 0) {
      return {
        success: true,
        data: {
          date,
          hasWorkoutData: false,
          workoutLogs: [],
          exercises: []
        }
      };
    }

    // Get all exercise log sets for the workout logs
    const exerciseLogIds = workoutLogsResult.map(log => log.exercise_log_id);
    
    const [exerciseLogsetsResult] = await db.query(
      `SELECT 
         els.exercise_log_set_id,
         els.exercise_log_id,
         els.program_exercise_set_id,
         els.set_order,
         els.weight,
         els.reps,
         els.time,
         els.distance,
         pe.exercise_id,
         pe.order_index as exercise_order
       FROM exercise_log_set els
       JOIN program_exercise_set pes ON els.program_exercise_set_id = pes.program_exercise_set_id
       JOIN program_exercise pe ON pes.program_exercise_id = pe.program_exercise_id
       WHERE els.exercise_log_id IN (${exerciseLogIds.map(() => '?').join(',')})
       ORDER BY pe.order_index, els.set_order`,
      exerciseLogIds
    );

    // Get exercise information (assuming exercise_id references some exercise library)
    // For now, we'll use exercise_id as the exercise name
    const exerciseIds = [...new Set(exerciseLogsetsResult.map(set => set.exercise_id))];
    
    // Group sets by exercise
    const exerciseGroups = {};
    
    exerciseLogsetsResult.forEach(set => {
      const exerciseId = set.exercise_id;
      
      if (!exerciseGroups[exerciseId]) {
        exerciseGroups[exerciseId] = {
          exerciseId: exerciseId,
          exerciseName: exerciseId, // You might want to get actual exercise names from exercise library
          order: set.exercise_order,
          sets: []
        };
      }
      
      exerciseGroups[exerciseId].sets.push({
        setNumber: set.set_order,
        weight: set.weight,
        reps: set.reps,
        time: set.time,
        distance: set.distance,
        volume: set.weight && set.reps ? set.weight * set.reps : 0
      });
    });

    // Convert to array and sort by exercise order
    const exercises = Object.values(exerciseGroups).sort((a, b) => a.order - b.order);

    // Calculate summary statistics
    const totalSets = exerciseLogsetsResult.length;
    const totalVolume = exerciseLogsetsResult.reduce((sum, set) => {
      return sum + (set.weight && set.reps ? set.weight * set.reps : 0);
    }, 0);
    const totalReps = exerciseLogsetsResult.reduce((sum, set) => {
      return sum + (set.reps || 0);
    }, 0);

    return {
      success: true,
      data: {
        date,
        hasWorkoutData: true,
        workoutInfo: {
          planName: workoutLogsResult[0]?.plan_name,
          programName: workoutLogsResult[0]?.program_name,
          totalSets,
          totalVolume,
          totalReps
        },
        exercises,
        summary: {
          totalExercises: exercises.length,
          totalSets,
          totalVolume,
          totalReps,
          averageVolume: exercises.length > 0 ? totalVolume / exercises.length : 0
        }
      }
    };
  } catch (error) {
    console.error("Error fetching member workout data:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการโหลดข้อมูลการออกกำลังกาย",
      data: null
    };
  }
}