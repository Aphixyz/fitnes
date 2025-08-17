"use server";

import { z } from "zod";
import pool from "@/lib/db";
import fs from 'fs';
import path from 'path';

// Schema สำหรับ validate ข้อมูลที่รับมา
const getWorkoutPlanSchema = z.object({
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  member_id: z.coerce.number().positive("ต้องระบุรหัสสมาชิก"),
  includeDetails: z.boolean().optional().default(false)
});

export async function getWorkoutPlanByMemberId(data) {
  const connection = await pool.getConnection();
  
  try {
    const { trainer_id, member_id, includeDetails } = getWorkoutPlanSchema.parse(data);
    
    // ตรวจสอบความสัมพันธ์ระหว่างเทรนเนอร์และสมาชิก
    const [memberCheck] = await connection.query(
      `SELECT registration_id FROM registration 
       WHERE trainer_id = ? AND member_id = ?`,
      [trainer_id, member_id]
    );
    
    if (!memberCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลของสมาชิกนี้",
      };
    }

    // ดึงข้อมูลสมาชิก (สำหรับชื่อ)
    const [memberData] = await connection.query(
      "SELECT member_firstname, member_lastname FROM member WHERE member_id = ?",
      [member_id]
    );
    
    if (!memberData.length) {
      return {
        success: false,
        error: "not_found",
        message: "ไม่พบข้อมูลสมาชิก",
      };
    }
    
    // ดึงรายการแผนการออกกำลังกาย
    const [plans] = await connection.query(
      `SELECT 
         wp.*,
         CASE 
           WHEN CURDATE() < wp.plan_startdate THEN 'upcoming'
           WHEN wp.plan_enddate IS NULL OR CURDATE() <= wp.plan_enddate THEN 'active'
           ELSE 'completed'
         END as plan_timeline_status
       FROM workout_plan wp
       WHERE wp.trainer_id = ? AND wp.member_id = ?
       ORDER BY 
         wp.plan_status = 'active' DESC,
         wp.created_at DESC`,
      [trainer_id, member_id]
    );
    
    if (includeDetails && plans.length > 0) {
      // หากต้องการรายละเอียดเพิ่มเติม ดึงข้อมูล workout_program สำหรับแต่ละแผน
      const planIds = plans.map(p => p.workout_plan_id);
      
      const [programs] = await connection.query(
        `SELECT 
           wp.*,
           wpr.workout_plan_id
         FROM workout_program wp
         JOIN workout_plan wpr ON wp.workout_plan_id = wpr.workout_plan_id
         WHERE wpr.workout_plan_id IN (?)
         ORDER BY wp.order_index ASC`,
        [planIds]
      );
      
      // ดึงข้อมูลท่าออกกำลังกาย
      const programIds = programs.map(p => p.workout_program_id);
      
      if (programIds.length > 0) {
        // ดึงข้อมูลท่าออกกำลังกายจากฐานข้อมูล (ไม่รวมรายละเอียดของท่า)
        const [exercises] = await connection.query(
          `SELECT 
             pe.*,
             wp.workout_plan_id
           FROM program_exercise pe
           JOIN workout_program wp ON pe.workout_program_id = wp.workout_program_id
           WHERE pe.workout_program_id IN (?)
           ORDER BY pe.order_index ASC`,
          [programIds]
        );
        
        // อ่านข้อมูลท่าออกกำลังกายจากไฟล์ JSON
        let exerciseData = {};
        try {
          const exerciseFilePath = path.join(process.cwd(), 'data', 'exercises.json');
          const exerciseFileContent = fs.readFileSync(exerciseFilePath, 'utf8');
          const exercisesArray = JSON.parse(exerciseFileContent);
          
          // แปลงเป็น object โดยใช้ id เป็น key
          exerciseData = exercisesArray.reduce((acc, exercise) => {
            acc[exercise.id] = exercise;
            return acc;
          }, {});
        } catch (error) {
          console.error('Error reading exercise data:', error);
        }
        
        // รวมข้อมูลท่าออกกำลังกายกับข้อมูลจากฐานข้อมูล
        const enrichedExercises = exercises.map(ex => {
          const exerciseInfo = exerciseData[ex.exercise_id] || {};
          return {
            ...ex,
            exercise_name: exerciseInfo.name || ex.exercise_id,
            exercise_category: exerciseInfo.category || 'unknown',
            primaryMuscles: exerciseInfo.primaryMuscles || [],
            secondaryMuscles: exerciseInfo.secondaryMuscles || [],
            equipment: exerciseInfo.equipment || 'unknown',
            level: exerciseInfo.level || 'beginner',
            images: exerciseInfo.images || []
          };
        });
        
        // ดึงข้อมูล sets สำหรับแต่ละท่าออกกำลังกาย
        const exerciseIds = exercises.map(ex => ex.program_exercise_id);
        let exerciseSets = [];
        
        if (exerciseIds.length > 0) {
          const [sets] = await connection.query(
            `SELECT 
               pes.*
             FROM program_exercise_set pes
             WHERE pes.program_exercise_id IN (?)
             ORDER BY pes.set_order ASC`,
            [exerciseIds]
          );
          exerciseSets = sets;
        }
        
        // จัดกลุ่ม sets ตาม exercise
        const setsByExercise = {};
        exerciseSets.forEach(set => {
          if (!setsByExercise[set.program_exercise_id]) {
            setsByExercise[set.program_exercise_id] = [];
          }
          setsByExercise[set.program_exercise_id].push(set);
        });
        
        // เพิ่ม sets เข้าไปในแต่ละท่าออกกำลังกาย
        enrichedExercises.forEach(exercise => {
          exercise.sets = setsByExercise[exercise.program_exercise_id] || [];
        });
        
        // จัดกลุ่มท่าออกกำลังกายตาม program
        const exercisesByProgram = {};
        enrichedExercises.forEach(ex => {
          if (!exercisesByProgram[ex.workout_program_id]) {
            exercisesByProgram[ex.workout_program_id] = [];
          }
          exercisesByProgram[ex.workout_program_id].push(ex);
        });
        
        // เพิ่มท่าออกกำลังกายเข้าไปในแต่ละ program
        programs.forEach(program => {
          program.exercises = exercisesByProgram[program.workout_program_id] || [];
        });
        
        // จัดกลุ่ม program ตาม plan
        const programsByPlan = {};
        programs.forEach(program => {
          if (!programsByPlan[program.workout_plan_id]) {
            programsByPlan[program.workout_plan_id] = [];
          }
          programsByPlan[program.workout_plan_id].push(program);
        });
        
        // เพิ่ม program เข้าไปในแต่ละ plan
        plans.forEach(plan => {
          plan.programs = programsByPlan[plan.workout_plan_id] || [];
        });
      } else {
        // มีแผนแต่ไม่มีโปรแกรม
        plans.forEach(plan => {
          plan.programs = [];
        });
      }
    }
    
    return {
      success: true,
      member: memberData[0],
      plans: plans.map(plan => ({
        ...plan,
        // แปลงเวลาเป็น string เพื่อให้ JSON.stringify ทำงานได้
        created_at: plan.created_at ? plan.created_at.toISOString() : null,
        updated_at: plan.updated_at ? plan.updated_at.toISOString() : null
      }))
    };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "validation_error",
        validationErrors: error.errors,
        message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูล",
      };
    }
    
    console.error("Error fetching workout plans:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรแกรม",
    };
  } finally {
    connection.release();
  }
}