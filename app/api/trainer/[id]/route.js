import pool from "../../../../lib/db";
import { NextResponse } from "next/server";


export async function GET(req, { params }) {
  try {
      const { id } = params;  // ดึงค่า id จาก params

      // ใช้ pool.query เพื่อดึงข้อมูลจากฐานข้อมูล
      const [trainer] = await pool.query('SELECT * FROM trainer WHERE trainer_id = ?', [id]);

      if (trainer.length === 0) {
          return Response.json(
              { error: 'ไม่พบเทรนเนอร์ที่มี ID นี้' },
              { status: 404 }
          );
      }

      return Response.json({ trainer }, { status: 200 });
  } catch (error) {
      return Response.json(
          { error: 'ดึงข้อมูลเทรนเนอร์ไม่สำเร็จ', details: error.message },
          { status: 500 }
      );
  }
}



export async function PUT(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Trainer ID is required in the URL" },
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

    const [res] = await pool.query(
      `
        UPDATE trainer 
        SET 
          trainer_username=?, 
          trainer_password=?, 
          trainer_firstname=?, 
          trainer_lastname=?, 
          trainer_nickname=?, 
          trainer_email=?, 
          trainer_phone=?, 
          trainer_dob=?, 
          trainer_gender=?, 
          trainer_exp=?, 
          trainer_startdate=?, 
          trainer_enddate=?, 
          trainer_status=? 
        WHERE trainer_id=?`,
      [
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
      ]
    );

    if (res.affectedRows === 0) {
      return NextResponse.json(
        { error: `No trainer found with id ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Trainer updated successfully", res },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update trainer", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Trainer ID is required in the URL" },
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
      { message: "Trainer deleted successfully", res },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete trainer", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Trainer ID is required in the URL" },
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

    // เริ่มต้นสร้างคำสั่ง SQL ที่จะอัปเดตข้อมูลเทรนเนอร์
    let updateFields = [];
    let values = [];

    // ตรวจสอบว่าแต่ละฟิลด์มีค่าและเพิ่มลงในคำสั่ง SQL
    if (trainer_username) {
      updateFields.push("trainer_username = ?");
      values.push(trainer_username);
    }
    if (trainer_password) {
      updateFields.push("trainer_password = ?");
      values.push(trainer_password);
    }
    if (trainer_firstname) {
      updateFields.push("trainer_firstname = ?");
      values.push(trainer_firstname);
    }
    if (trainer_lastname) {
      updateFields.push("trainer_lastname = ?");
      values.push(trainer_lastname);
    }
    if (trainer_nickname) {
      updateFields.push("trainer_nickname = ?");
      values.push(trainer_nickname);
    }
    if (trainer_email) {
      updateFields.push("trainer_email = ?");
      values.push(trainer_email);
    }
    if (trainer_phone) {
      updateFields.push("trainer_phone = ?");
      values.push(trainer_phone);
    }
    if (trainer_dob) {
      updateFields.push("trainer_dob = ?");
      values.push(trainer_dob);
    }
    if (trainer_gender) {
      updateFields.push("trainer_gender = ?");
      values.push(trainer_gender);
    }
    if (trainer_exp) {
      updateFields.push("trainer_exp = ?");
      values.push(trainer_exp);
    }
    if (trainer_startdate) {
      updateFields.push("trainer_startdate = ?");
      values.push(trainer_startdate);
    }
    if (trainer_enddate) {
      updateFields.push("trainer_enddate = ?");
      values.push(trainer_enddate);
    }
    if (trainer_status !== undefined) {
      updateFields.push("trainer_status = ?");
      values.push(trainer_status);
    }

    // ถ้าไม่มีฟิลด์ใดๆ ที่จะอัปเดต
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
    }

    // เพิ่ม ID ของเทรนเนอร์เพื่อทำการอัปเดต
    values.push(id);

    // สร้างคำสั่ง SQL สำหรับการอัปเดต
    const sql = `
      UPDATE trainer 
      SET ${updateFields.join(", ")} 
      WHERE trainer_id = ?
    `;

    // ทำการอัปเดตฐานข้อมูล
    const [res] = await pool.query(sql, values);

    if (res.affectedRows === 0) {
      return NextResponse.json(
        { error: `No trainer found with id ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Trainer updated successfully", res },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update trainer", details: error.message },
      { status: 500 }
    );
  }
}
