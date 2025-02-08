import pool from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Trainer ID is required" },
        { status: 400 }
      );
    }

    // ดึงข้อมูลจากฐานข้อมูล
    const [trainer] = await pool.query(
      "SELECT * FROM trainer WHERE trainer_id = ?",
      [id]
    );

    if (!trainer.length) {
      return NextResponse.json(
        { error: `No trainer found with ID ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ trainer: trainer[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch trainer", details: error.message },
      { status: 500 }
    );
  }
}

// export async function PUT(req, { params }) {
//   try {
//     const { id } = params;

//     if (!id) {
//       return NextResponse.json({ error: "Trainer ID is required" }, { status: 400 });
//     }

//     const [trainer] = await pool.query("SELECT * FROM trainer WHERE trainer_id = ?", [id]);

//     if (trainer.length === 0) {
//       return NextResponse.json({ error: `No trainer found with id ${id}` }, { status: 404 });
//     }

//     return NextResponse.json({ trainer: trainer[0] }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch trainer", details: error.message },
//       { status: 500 }
//     );
//   }
// }

// PUT: Update an entire trainer record
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Trainer ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      trainer_username,
      trainer_password,
      trainer_firstname,
      trainer_lastname,
      trainer_nickname,
      trainer_email,
      trainer_phone,
      trainer_dob,
      trainer_gender,
      trainer_exp,
      trainer_startdate,
      trainer_enddate,
      trainer_status,
    } = body;

    const sql = `
      UPDATE trainer 
      SET trainer_username=?, trainer_password=?, trainer_firstname=?, trainer_lastname=?, trainer_nickname=?,
          trainer_email=?, trainer_phone=?, trainer_dob=?, trainer_gender=?, trainer_exp=?, 
          trainer_startdate=?, trainer_enddate=?, trainer_status=?
      WHERE trainer_id=?`;

    const values = [
      trainer_username,
      trainer_password,
      trainer_firstname,
      trainer_lastname,
      trainer_nickname,
      trainer_email,
      trainer_phone,
      trainer_dob,
      trainer_gender,
      trainer_exp,
      trainer_startdate,
      trainer_enddate,
      trainer_status,
      id,
    ];

    const [res] = await pool.query(sql, values);

    if (res.affectedRows === 0) {
      return NextResponse.json(
        { error: `No trainer found with id ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Trainer updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update trainer", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update specific trainer fields & status
export async function PATCH(req, { params }) {
  try {
    const id = params.id; // รับค่า ID จาก URL

    if (!id) {
      return NextResponse.json(
        { error: "Trainer ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    let updateFields = [];
    let values = [];

    // กำหนดเฉพาะฟิลด์ที่อนุญาตให้อัปเดต
    const allowedFields = [
      "trainer_username",
      "trainer_password",
      "trainer_firstname",
      "trainer_lastname",
      "trainer_nickname",
      "trainer_email",
      "trainer_phone",
      "trainer_dob",
      "trainer_gender",
      "trainer_exp",
      "trainer_startdate",
      "trainer_enddate",
      "trainer_status",
    ];

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    // ถ้าไม่มีข้อมูลให้อัปเดต
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
    }

    // ตรวจสอบค่า `trainer_status` (ต้องเป็น 0 หรือ 1)
    if ("trainer_status" in body) {
      if (![0, 1].includes(body.trainer_status)) {
        return NextResponse.json(
          { error: "Invalid status. Allowed values: 0 (Inactive), 1 (Active)" },
          { status: 400 }
        );
      }
    }

    // เพิ่ม ID เข้าไปใน values
    values.push(id);

    // สร้าง SQL สำหรับอัปเดต
    const sql = `UPDATE trainer SET ${updateFields.join(
      ", "
    )} WHERE trainer_id = ?`;

    const [res] = await pool.query(sql, values);

    if (res.affectedRows === 0) {
      return NextResponse.json(
        { error: `No trainer found with id ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Trainer updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Trainer Error:", error);
    return NextResponse.json(
      { error: "Failed to update trainer", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a trainer
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Trainer ID is required" },
        { status: 400 }
      );
    }

    const [res] = await pool.query("DELETE FROM trainer WHERE trainer_id=?", [
      id,
    ]);

    if (res.affectedRows === 0) {
      return NextResponse.json(
        { error: `No trainer found with id ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Trainer deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete trainer", details: error.message },
      { status: 500 }
    );
  }
}
