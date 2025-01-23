import pool from "../../lib/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    // ดึงค่า id จาก params (slug)
    const { id } = params;

    // ตรวจสอบว่า id ถูกส่งมาหรือไม่
    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required in the URL" },
        { status: 400 }
      );
    }

    // รับข้อมูลที่ต้องการอัปเดตจาก Body
    const body = await req.json();
    const {
      member_name,
      member_pass,
      member_firstname,
      member_lastname,
      member_nickname,
      member_email,
      member_phone,
      member_dob,
      member_gender,
      member_exp,
      member_startdate,
      member_enddate,
      member_status,
    } = body;

    // คำสั่ง SQL สำหรับอัปเดตข้อมูล
    const [res] = await pool.query(
      `
        UPDATE member 
        SET 
          member_name=?, 
          member_pass=?, 
          member_firstname=?, 
          member_lastname=?, 
          member_nickname=?, 
          member_email=?, 
          member_phone=?, 
          member_dob=?, 
          member_gender=?, 
          member_exp=?, 
          member_startdate=?, 
          member_enddate=?, 
          member_status=? 
        WHERE member_id=?`,
      [
        member_name,
        member_pass,
        member_firstname,
        member_lastname,
        member_nickname,
        member_email,
        member_phone,
        member_dob,
        member_gender,
        member_exp,
        member_startdate,
        member_enddate,
        member_status,
        id, // ใช้ id จาก params
      ]
    );

    // ตรวจสอบว่าแถวไหนถูกอัปเดตหรือไม่
    if (res.affectedRows === 0) {
      return NextResponse.json(
        { error: "No member found with id ${id}" },
        { status: 404 }
      );
    }

    // ส่งผลลัพธ์สำเร็จกลับ
    return NextResponse.json(
      { message: "Member updated successfully", res },
      { status: 200 }
    );
  } catch (error) {
    // กรณีเกิดข้อผิดพลาด
    return NextResponse.json(
      { error: "Failed to update member", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    // ดึงค่า id จาก params (slug)
    const { id } = params;

    // ตรวจสอบว่า id ถูกส่งมาหรือไม่
    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required in the URL" },
        { status: 400 }
      );
    }

    // คำสั่ง SQL สำหรับลบข้อมูล
    const [res] = await pool.query("DELETE FROM member WHERE member_id=?", [
      id,
    ]);

    // ตรวจสอบว่าแถวไหนถูกลบหรือไม่
    if (res.affectedRows === 0) {
      return NextResponse.json(
        { error: "No member found with id ${id}" },
        { status: 404 }
      );
    }

    // ส่งผลลัพธ์สำเร็จกลับ
    return NextResponse.json(
      { message: "Member deleted successfully", res },
      { status: 200 }
    );
  } catch (error) {
    // กรณีเกิดข้อผิดพลาด
    return NextResponse.json(
      { error: "Failed to delete member", details: error.message },
      { status: 500 }
    );
  }
}
