// "use server";

// import { z } from "zod";
// import pool from "@/lib/db";
// import { revalidatePath } from "next/cache";

// // Schema สำหรับ Validate ข้อมูลการสร้าง Workout Program
// const addProgramSchema = z.object({
//   workout_plan_id: z.coerce.number().positive("ต้องระบุรหัสแผนการออกกำลังกาย"),
//   trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
//   program_name: z.string().min(1, "ต้องระบุชื่อโปรแกรม"),
//   program_note: z.string().optional(),
//   order_index: z.number().int().optional(),
// });

// export async function addWorkoutProgram(data) {
//   const connection = await pool.getConnection();

//   try {
//     const validatedData = addProgramSchema.parse(data);
//     const {
//       workout_plan_id,
//       trainer_id,
//       program_name,
//       program_note,
//       order_index,
//     } = validatedData;

//     // เช็คสิทธิ์ว่า trainer เป็นเจ้าของ workout plan
//     const [planCheck] = await connection.query(
//       "SELECT member_id FROM workout_plan WHERE workout_plan_id = ? AND trainer_id = ?",
//       [workout_plan_id, trainer_id]
//     );

//     if (!planCheck.length) {
//       return {
//         success: false,
//         error: "authorization_error",
//         message: "คุณไม่มีสิทธิ์เพิ่มโปรแกรมในแผนนี้",
//       };
//     }

//     const member_id = planCheck[0].member_id;

//     // หาค่า order_index ถ้าไม่มีการระบุมา (จะใส่ต่อจากค่าสูงสุดที่มีอยู่)
//     let nextOrderIndex = 0;
//     if (order_index === undefined) {
//       const [maxOrder] = await connection.query(
//         "SELECT MAX(order_index) as max_order FROM workout_program WHERE workout_plan_id = ?",
//         [workout_plan_id]
//       );

//       nextOrderIndex =
//         maxOrder[0].max_order !== null ? maxOrder[0].max_order + 1 : 0;
//     } else {
//       nextOrderIndex = order_index;
//     }

//     // สร้าง workout_program ใหม่
//     const [programResult] = await connection.query(
//       `INSERT INTO workout_program
//        (workout_plan_id, program_name, program_note, order_index)
//        VALUES (?, ?, ?, ?)`,
//       [workout_plan_id, program_name, program_note || null, nextOrderIndex]
//     );

//     const workout_program_id = programResult.insertId;

//     // Revalidate paths
//     revalidatePath(
//       `/trainer/${trainer_id}/members/${member_id}/workout-plan/${workout_plan_id}`
//     );

//     return {
//       success: true,
//       data: {
//         workout_program_id,
//         workout_plan_id,
//         program_name,
//         program_note: program_note || null,
//         order_index: nextOrderIndex,
//       },
//       message: "เพิ่มโปรแกรมสำเร็จ",
//     };
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return {
//         success: false,
//         error: "validation_error",
//         validationErrors: error.errors,
//         message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูล",
//       };
//     }

//     console.error("เกิดข้อผิดพลาด:", error);
//     return {
//       success: false,
//       error: "database_error",
//       message: "เกิดข้อผิดพลาดในการเพิ่มโปรแกรม กรุณาลองใหม่",
//     };
//   } finally {
//     connection.release();
//   }
// }
"use server";

import pool from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  workout_plan_id: z.coerce.number().positive(),
  program_name: z.string().min(1, "กรุณากรอกชื่อโปรแกรม"),
  program_note: z.string().optional(),
});

export async function addWorkoutProgram(formData) {
  // รับ formData จาก <form action={addWorkoutProgram}>
  const data = {
    workout_plan_id: Number(formData.get("workout_plan_id")),
    program_name: formData.get("program_name"),
    program_note: formData.get("program_note") || null,
  };

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.errors };
  }

  const { workout_plan_id, program_name, program_note } = parsed.data;
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO workout_program
         (workout_plan_id, program_name, program_note, order_index)
       VALUES (?, ?, ?, (
         SELECT COALESCE(MAX(order_index),0)+1
         FROM workout_program WHERE workout_plan_id = ?
       ))`,
      [workout_plan_id, program_name, program_note, workout_plan_id]
    );
    const newId = result.insertId;

    // ให้หน้า planId revalidate เพื่อดึงรายการโปรแกรมย่อยใหม่
    revalidatePath(
      `/trainer/${parsed.data.trainer_id}/members/${parsed.data.member_id}/workout-plan/${workout_plan_id}`
    );

    return { success: true, workout_program_id: newId };
  } catch (err) {
    console.error(err);
    return { success: false, message: "ไม่สามารถเพิ่มโปรแกรมย่อยได้" };
  } finally {
    conn.release();
  }
}
