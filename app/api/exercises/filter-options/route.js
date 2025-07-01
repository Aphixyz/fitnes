// app/api/exercises/filter-options/route.js
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // อ่านไฟล์ JSON ที่มีข้อมูลท่าออกกำลังกาย
    const filePath = path.join(process.cwd(), "data", "exercises.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const exercises = JSON.parse(raw);
    
    // สกัดตัวเลือกทั้งหมดจากข้อมูล
    const equipment = [...new Set(exercises.map(e => e.equipment).filter(Boolean))];
    const muscles = [...new Set(
      exercises.flatMap(e => [...(e.primaryMuscles || []), ...(e.secondaryMuscles || [])])
    )].filter(Boolean);
    const levels = [...new Set(exercises.map(e => e.level).filter(Boolean))];
    const mechanics = [...new Set(exercises.map(e => e.mechanic).filter(Boolean))];
    const categories = [...new Set(exercises.map(e => e.category).filter(Boolean))];
    
    return NextResponse.json({
      equipment,
      muscles,
      levels,
      mechanics,
      categories,
    }, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400", // cache 1 hour
      },
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json({ error: "Failed to fetch filter options" }, { status: 500 });
  }
}