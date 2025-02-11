import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(req, { params }) {
  try {

    const { id } = await params
    
    // ✅ ใช้ query ดึงข้อมูลจาก database
    const [goals] = await pool.query("SELECT * FROM fitness_goal WHERE member_id = ? ORDER BY fitness_goal_startdate DESC", [id]);

    if (!goals || goals.length === 0) {
      return NextResponse.json({ error: "No goals found" }, { status: 404 });
    }

    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    console.error("GET API Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    // ✅ ตรวจสอบว่า params.id มีค่าหรือไม่

    const { id } = await params;
    
    const {
      fitness_goal_type,
      fitness_goal_description,
      fitness_goal_startdate,
      fitness_goal_enddate,
    } = await req.json();

    // ✅ ตรวจสอบค่าที่ต้องมี
    if (!fitness_goal_type || !fitness_goal_startdate) {
      return NextResponse.json({ error: "Goal type and start date are required" }, { status: 400 });
    }

    // ✅ LOG เพื่อ Debugging
    console.log("Adding goal for member:", id);
    console.log("Received data:", {
      fitness_goal_type,
      fitness_goal_description,
      fitness_goal_startdate,
      fitness_goal_enddate,
    });

    const sql = `
      INSERT INTO fitness_goal (member_id, fitness_goal_type, fitness_goal_description, fitness_goal_startdate, fitness_goal_enddate, fitness_goal_status)
      VALUES (?, ?, ?, ?, ?, 1)
    `;

    const values = [
      id,
      fitness_goal_type,
      fitness_goal_description,
      fitness_goal_startdate,
      fitness_goal_enddate || null,
    ];

    // ✅ Execute SQL Query
    const [result] = await pool.query(sql, values);

    return NextResponse.json(
      { message: "Goal added successfully", fitness_goal_id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST API Error:", error.message);
    return NextResponse.json(
      { error: "Failed to add goal", details: error.message },
      { status: 500 }
    );
  }
}