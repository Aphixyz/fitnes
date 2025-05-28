import pool from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function fetchWorkoutDetailById({
  trainer_id,
  member_id,
  workout_plan_id,
}) {
  const conn = await pool.getConnection();
  try {
    // ดึงข้อมูลแผนการออกกำลังกาย
    const [planRows] = await conn.query(
      `SELECT plan_name, plan_note, plan_duration, plan_startdate, plan_enddate
       FROM workout_plan
       WHERE trainer_id = ? AND member_id = ? AND workout_plan_id = ?`,
      [trainer_id, member_id, workout_plan_id]
    );
    if (!planRows.length) {
      return {
        success: false,
        error: "not_found",
        message: "ไม่พบแผนการออกกำลังกาย",
      };
    }
    const plan = planRows[0];

    // ดึงโปรแกรมย่อยภายในแผน
    const [programRows] = await conn.query(
      `SELECT workout_program_id, program_name, program_note
       FROM workout_program
       WHERE workout_plan_id = ?
       ORDER BY order_index`,
      [workout_plan_id]
    );

    // ถ้ามีโปรแกรมย่อย ➔ ดึงท่าออกกำลังกาย
    let exercisesByProgram = {};
    if (programRows.length) {
      const progIds = programRows.map((p) => p.workout_program_id);
      const [exerciseRows] = await conn.query(
        `SELECT workout_program_id, exercise_id
         FROM program_exercise
         WHERE workout_program_id IN (?)
         ORDER BY order_index`,
        [progIds]
      );

      // อ่านชื่อท่าจาก JSON
      let exercisesJson = [];
      try {
        const filePath = path.join(
          process.cwd(),
          "data",
          "exercises.json"
        );
        exercisesJson = JSON.parse(await fs.readFile(filePath, "utf8"));
      } catch (e) {
        console.error("Error reading exercises.json:", e);
      }
      const nameMap = exercisesJson.reduce((m, ex) => {
        m[ex.id.toString()] = ex.name;
        return m;
      }, {});

      // จัดกลุ่มท่าตามโปรแกรม
      exerciseRows.forEach((row) => {
        if (!exercisesByProgram[row.workout_program_id]) {
          exercisesByProgram[row.workout_program_id] = [];
        }
        exercisesByProgram[row.workout_program_id].push({
          exercise_id: row.exercise_id,
          exercise_name: nameMap[row.exercise_id] || "",
        });
      });
    }

    // สร้างผลลัพธ์ programs array
    const programs = programRows.map((p) => ({
      workout_program_id: p.workout_program_id,
      program_name: p.program_name,
      program_note: p.program_note,
      exercises: exercisesByProgram[p.workout_program_id] || [],
    }));

    return {
      success: true,
      plan: {
        plan_name: plan.plan_name,
        plan_note: plan.plan_note,
        plan_duration: plan.plan_duration,
        plan_startdate: plan.plan_startdate,
        plan_enddate: plan.plan_enddate,
        programs,
      },
    };
  } catch (error) {
    console.error("Error fetching workout detail:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    };
  } finally {
    conn.release();
  }
}
