import pool from "../../../../lib/db";
import { NextResponse } from "next/server";

// ดึงข้อมูลสมาชิกตาม ID
export async function GET(req, { params }) {
  try {
    const { id } = params; // ✅ ใช้ { params } ให้ถูกต้อง
    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // ดึงข้อมูลจากฐานข้อมูล
    const [member] = await pool.query(
      "SELECT * FROM member WHERE member_id = ?",
      [id]
    );

    if (!member.length) {
      return NextResponse.json(
        { error: `No member found with ID ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ member: member[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch member", details: error.message },
      { status: 500 }
    );
  }
}

// อัปเดตข้อมูลสมาชิก
export async function PATCH(req, { params }) {
  try {
    const { id } = params; // ✅ ใช้ params ตรง ๆ
    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    let updateFields = [];
    let values = [];

    // ฟิลด์ที่อนุญาตให้อัปเดต
    const allowedFields = [
      "member_username",
      "member_password",
      "member_firstname",
      "member_lastname",
      "member_email",
      "member_phone",
      "member_gender",
      "member_dob"
    ];

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    // ถ้าไม่มีฟิลด์ให้อัปเดต
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
    }

    // เพิ่ม ID เข้าไปเป็นค่าล่าสุด
    values.push(id);

    // สร้าง SQL สำหรับอัปเดต
    const sql = `UPDATE member SET ${updateFields.join(
      ", "
    )} WHERE member_id = ?`;

    const [res] = await pool.query(sql, values);

    if (res.affectedRows === 0) {
      return NextResponse.json(
        { error: `No member found with ID ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Member updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update member", details: error.message },
      { status: 500 }
    );
  }
}
