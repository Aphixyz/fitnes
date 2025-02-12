import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(req, context) {
  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Fetch all health records for the member
    const [result] = await pool.query(
      `SELECT * FROM member_health WHERE member_id = ? ORDER BY member_health_record_date DESC`,
      [id]
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        { message: "No health records found", healthRecords: [] },
        { status: 200 }
      );
    }

    return NextResponse.json({ healthRecords: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch health data", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req, context) {
  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log("📌 Received Data:", body);

    const {
      member_health_weight,
      member_health_height,
      member_health_bmi,
      member_health_medical_condition,
      member_health_injury,
    } = body;

    if (!member_health_weight || !member_health_height || !member_health_bmi) {
      return NextResponse.json(
        { error: "Weight, height, and BMI are required" },
        { status: 422 }
      );
    }

    const sql = `
        INSERT INTO member_health (
          member_health_record_date,
          member_health_weight,
          member_health_height,
          member_health_bmi,
          member_health_medical_condition,
          member_health_injury,
          member_id
        ) VALUES (NOW(), ?, ?, ?, ?, ?, ?)
      `;

    const values = [
      member_health_weight,
      member_health_height,
      member_health_bmi,
      member_health_medical_condition || null,
      member_health_injury || null,
      id,
    ];

    console.log("Insert Query Values:", values);

    const [result] = await pool.query(sql, values);
    console.log("Insert Result:", result);

    if (!result || result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Insert failed, no rows affected" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Health data saved successfully",
        insertedId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("📌 Insert Error:", error.message);
    return NextResponse.json(
      { error: "Failed to save health data", details: error.message },
      { status: 500 }
    );
  }
}
