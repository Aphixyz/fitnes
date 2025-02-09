import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

// ✅ POST - เพิ่มเป้าหมายการออกกำลังกาย
export async function POST(req, context) {
  try {
    const { id } = context.params; // ✅ ใช้ context.params ดึงค่า id
    const {
      fitness_goal_type,
      fitness_goal_description,
      fitness_goal_startdate,
      fitness_goal_enddate,
    } = await req.json();

    if (!fitness_goal_type || !fitness_goal_startdate) {
      return NextResponse.json(
        { error: "Goal type and start date are required" },
        { status: 400 }
      );
    }

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
    
    const [result] = await pool.query(sql, values);

    return NextResponse.json(
      { message: "Goal added successfully", fitness_goal_id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add goal", details: error.message },
      { status: 500 }
    );
  }
}

// ✅ GET - ดึงเป้าหมายการออกกำลังกายทั้งหมดของสมาชิก
export async function GET(req, context) {
  try {
    const { id } = context.params; // ✅ ใช้ context.params ดึงค่า id
    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    const sql = `SELECT * FROM fitness_goal WHERE member_id = ? ORDER BY fitness_goal_startdate DESC`;
    const [goals] = await pool.query(sql, [id]);

    if (goals.length === 0) {
      return NextResponse.json(
        { message: "No fitness goals found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch fitness goals", details: error.message },
      { status: 500 }
    );
  }
}