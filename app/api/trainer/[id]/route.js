import pool from "../../../../lib/db";
import { NextResponse } from "next/server";

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
