import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

// กำหนดตัวแปรแบบ global เพื่อแคชข้อมูล
let cachedExercises = null;
let lastCacheTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 ชั่วโมง

// โหลดข้อมูลจากแคชหรือไฟล์
async function loadExerciseData() {
  // ใช้ข้อมูลจากแคชถ้ายังไม่หมดอายุ
  if (
    cachedExercises &&
    lastCacheTime &&
    Date.now() - lastCacheTime < CACHE_DURATION
  ) {
    return cachedExercises;
  }

  // โหลดข้อมูลจากไฟล์ JSON
  try {
    const filePath = path.join(process.cwd(), "data", "exercises.json");
    const raw = await fs.readFile(filePath, "utf-8");
    cachedExercises = JSON.parse(raw);
    lastCacheTime = Date.now();
    return cachedExercises;
  } catch (error) {
    console.error("Error loading exercise data:", error);
    throw error;
  }
}

/**
 * API Route สำหรับดึงข้อมูลท่าออกกำลังกายจาก exercises.json
 */
export async function GET(request, { params }) {
  const { exerciseId } = params;

  try {
    // อ่านข้อมูลจากไฟล์ exercises.json (ใช้ระบบแคช)
    const exercises = await loadExerciseData();

    // หาท่าออกกำลังกายที่ต้องการตาม ID
    const exercise = exercises.find(
      (ex) => ex.id === exerciseId || ex.id === parseInt(exerciseId)
    );

    // ถ้าไม่พบ ส่ง 404
    if (!exercise) {
      return NextResponse.json(
        { message: "ไม่พบท่าออกกำลังกายที่ระบุ" },
        { status: 404 }
      );
    }

    // สร้างข้อมูลที่จะส่งกลับ และจัดการ instructions ให้เป็น array เสมอ
    const formattedExercise = {
      ...exercise,
      instructions: formatInstructions(exercise.instructions),
    };

    return NextResponse.json(formattedExercise, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลท่าออกกำลังกาย" },
      { status: 500 }
    );
  }
}

/**
 * ฟังก์ชันสำหรับจัดรูปแบบ instructions ให้เป็น array เสมอ
 */
function formatInstructions(instructions) {
  // ถ้าเป็น array อยู่แล้ว
  if (Array.isArray(instructions)) {
    return instructions;
  }

  // ถ้าเป็น string
  if (typeof instructions === "string") {
    return instructions.split("\n").filter((line) => line.trim() !== "");
  }

  // ถ้าไม่มีข้อมูลหรือเป็นประเภทข้อมูลอื่นๆ
  if (!instructions) {
    return [];
  }

  // พยายามแปลงให้เป็น string แล้วแยกเป็น array
  try {
    const str = String(instructions);
    return str.split("\n").filter((line) => line.trim() !== "");
  } catch (e) {
    return [];
  }
}
