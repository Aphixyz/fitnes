//api/member/[id]/registration-status
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req, contextPromise) {
  const context = await contextPromise;
  const memberId = context.params.id;

  try {
    const [rows] = await db.query(
      "SELECT payment_status FROM registration WHERE member_id = ?",
      [memberId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ status: "NOT_FOUND" });
    }

    return NextResponse.json({ status: rows[0].payment_status || "PENDING" });
  } catch (err) {
    console.error("DB error:", err);
    return NextResponse.json(
      { status: "ERROR", message: "Database error" },
      { status: 500 }
    );
  }
}

