import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";

export async function PATCH(req, { params }) {
  try {
    const { id, goal_id } = await params;
    const {
      fitness_goal_type,
      fitness_goal_description,
      fitness_goal_status,
      fitness_goal_startdate,
      fitness_goal_enddate,
    } = await req.json();

    let updateFields = [];
    let values = [];

    if (fitness_goal_type) {
      updateFields.push("fitness_goal_type = ?");
      values.push(fitness_goal_type);
    }

    if (fitness_goal_description) {
      updateFields.push("fitness_goal_description = ?");
      values.push(fitness_goal_description);
    }

    if (fitness_goal_status !== undefined) {
      updateFields.push("fitness_goal_status = ?");
      values.push(fitness_goal_status);
    }

    if (fitness_goal_startdate) {
      updateFields.push("fitness_goal_startdate = ?");
      values.push(fitness_goal_startdate);
    }

    if (fitness_goal_enddate) {
      updateFields.push("fitness_goal_enddate = ?");
      values.push(fitness_goal_enddate);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
    }

    values.push(goal_id); // Add goal_id for WHERE condition

    const sql = `UPDATE fitness_goal SET ${updateFields.join(
      ", "
    )} WHERE fitness_goal_id = ?`;
    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Goal not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Goal updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update goal", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id, goal_id } = await params; // ✅ ใช้ context.params ดึงค่า id และ goal_id
    if (!id || !goal_id) {
      return NextResponse.json(
        { error: "Member ID and Goal ID are required" },
        { status: 400 }
      );
    }

    const sql = `DELETE FROM fitness_goal WHERE fitness_goal_id = ? AND member_id = ?`;
    const [result] = await pool.query(sql, [goal_id, id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Goal not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Goal deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete goal", details: error.message },
      { status: 500 }
    );
  }
}
