import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";

export async function PATCH(req, { params }) {
  try {
    const { id, goal_id } = params;
    const { fitness_goal_type, fitness_goal_description, fitness_goal_status } =
      await req.json();

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

    if (fitness_goal_status) {
      updateFields.push("fitness_goal_status = ?");
      values.push(fitness_goal_status);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
    }

    values.push(goal_id);

    const sql = `UPDATE fitness_goal SET ${updateFields.join(
      ", "
    )} WHERE fitness_goal_id = ?`;
    const [result] = await pool.query(sql, values);

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

export async function DELETE(req, context) {
  try {
    const { id, goal_id } = context.params; // ✅ ใช้ context.params ดึงค่า id และ goal_id
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
