import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request, { params }) {
  const connection = await pool.getConnection();

  try {
    // รับค่า params จาก URL
    const { trainerId, workoutProgramId } = params;
    const { exercise_id } = await request.json();

    console.log("Received params:", {
      trainerId,
      workoutProgramId,
      exercise_id,
    });

    if (!exercise_id || !trainerId || !workoutProgramId) {
      return NextResponse.json(
        {
          success: false,
          error: "missing_params",
          message: "ต้องระบุ exercise_id, trainerId และ workoutProgramId",
        },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์ว่า trainer เป็นเจ้าของโปรแกรมนี้
    try {
      const [programCheck] = await connection.query(
        `SELECT wp.workout_plan_id, wp.member_id 
         FROM workout_program p
         JOIN workout_plan wp ON p.workout_plan_id = wp.workout_plan_id
         WHERE p.workout_program_id = ? AND wp.trainer_id = ?`,
        [workoutProgramId, trainerId]
      );

      if (!programCheck.length) {
        return NextResponse.json(
          {
            success: false,
            error: "authorization_error",
            message: "คุณไม่มีสิทธิ์เพิ่มท่าออกกำลังกายในโปรแกรมนี้",
          },
          { status: 403 }
        );
      }
    } catch (queryError) {
      console.error("Error checking program authorization:", queryError);
      return NextResponse.json(
        {
          success: false,
          error: "db_error",
          message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์",
        },
        { status: 500 }
      );
    }

    // ตรวจสอบว่าท่าออกกำลังกายนี้มีอยู่จริง
    let exerciseName = "";
    try {
      const [exerciseCheck] = await connection.query(
        "SELECT name as exercise_name FROM exercises WHERE id = ?",
        [exercise_id]
      );

      if (!exerciseCheck.length) {
        return NextResponse.json(
          {
            success: false,
            error: "not_found",
            message: "ไม่พบท่าออกกำลังกายนี้ในระบบ",
          },
          { status: 404 }
        );
      }

      exerciseName = exerciseCheck[0].exercise_name;
    } catch (queryError) {
      console.error("Error checking exercise:", queryError);
      return NextResponse.json(
        {
          success: false,
          error: "db_error",
          message: "เกิดข้อผิดพลาดในการตรวจสอบท่าออกกำลังกาย",
        },
        { status: 500 }
      );
    }

    // หาลำดับถัดไป
    let nextOrderIndex = 0;
    try {
      const [maxOrder] = await connection.query(
        "SELECT MAX(order_index) as max_order FROM program_exercise WHERE workout_program_id = ?",
        [workoutProgramId]
      );

      nextOrderIndex =
        maxOrder[0].max_order !== null ? maxOrder[0].max_order + 1 : 0;
    } catch (queryError) {
      console.error("Error finding max order:", queryError);
      return NextResponse.json(
        {
          success: false,
          error: "db_error",
          message: "เกิดข้อผิดพลาดในการคำนวณลำดับท่าออกกำลังกาย",
        },
        { status: 500 }
      );
    }

    // เพิ่มท่าออกกำลังกาย
    let program_exercise_id;
    try {
      const [exerciseResult] = await connection.query(
        `INSERT INTO program_exercise 
         (workout_program_id, exercise_id, order_index, rest, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [
          workoutProgramId,
          exercise_id,
          nextOrderIndex,
          "00:01:00", // ค่า rest เริ่มต้น 1 นาที
          "", // ค่า notes เริ่มต้นเป็น string ว่าง
        ]
      );

      program_exercise_id = exerciseResult.insertId;
    } catch (queryError) {
      console.error("Error inserting exercise:", queryError);
      return NextResponse.json(
        {
          success: false,
          error: "db_error",
          message: "เกิดข้อผิดพลาดในการเพิ่มท่าออกกำลังกาย",
          details: queryError.message,
        },
        { status: 500 }
      );
    }

    // คืนค่าผลลัพธ์
    return NextResponse.json({
      success: true,
      program_exercise_id,
      exercise_id,
      order_index: nextOrderIndex,
      exercise_name: exerciseName,
      message: "เพิ่มท่าออกกำลังกายสำเร็จ",
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return NextResponse.json(
      {
        success: false,
        error: "server_error",
        message: "เกิดข้อผิดพลาดในการเพิ่มท่าออกกำลังกาย",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
