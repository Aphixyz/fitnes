import pool from "../../../../lib/db";
import { NextResponse } from "next/server";

// ดึงข้อมูลสมาชิกตาม ID
export async function GET(req, { params }) {
  try {
    const { id } = await params 

    if (!id) {
      return new Response(JSON.stringify({ error: "Member ID is required" }), {
        status: 400,
      });
    }

    // ดึงข้อมูลจากฐานข้อมูล
    const [members] = await pool.query(
      "SELECT * FROM member WHERE member_id = ?",
      [id]
    );

    // ✅ ตรวจสอบให้แน่ใจว่าได้ข้อมูลมา
    if (!members || members.length === 0) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(members[0]), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch member",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}

// อัปเดตข้อมูลสมาชิก
export async function PATCH(req, context) {
  try {
    const { params } = context; // Extract params properly
    const { id } = params; // Get `id` from params

    if (!id) {
      return new Response(JSON.stringify({ error: "Member ID is required" }), {
        status: 400,
      });
    }

    const body = await req.json();
    let updateFields = [];
    let values = [];

    // ✅ Allowed fields that can be updated
    const allowedFields = [
      "member_username",
      "member_password",
      "member_firstname",
      "member_lastname",
      "member_email",
      "member_phone",
      "member_gender",
      "member_dob",
    ];

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    // ✅ If no fields are provided for update
    if (updateFields.length === 0) {
      return new Response(
        JSON.stringify({ error: "No fields provided for update" }),
        { status: 400 }
      );
    }

    // ✅ Add `id` as the last parameter
    values.push(id);

    // ✅ Construct dynamic SQL query for update
    const sql = `UPDATE member SET ${updateFields.join(
      ", "
    )} WHERE member_id = ?`;

    const [res] = await pool.query(sql, values);

    if (res.affectedRows === 0) {
      return new Response(
        JSON.stringify({ error: `No member found with ID ${id}` }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Member updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to update member",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
