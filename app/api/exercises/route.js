import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

// กำหนดตัวแปรแบบ global เพื่อแคชข้อมูล
let cachedExercises = null;
let lastCacheTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 ชั่วโมง

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

export async function GET(request) {
  try {
    // 1. อ่าน query parameters
    const { searchParams } = new URL(request.url);

    const equipmentParams = searchParams.getAll("equipment");
    const muscleParams = searchParams.getAll("muscle");
    const levelParams = searchParams.getAll("level");
    const categoryParams = searchParams.getAll("category");
    const mechanicParams = searchParams.getAll("mechanic");

    const q = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // 2. โหลดข้อมูลจากแคชหรือไฟล์
    const exercises = await loadExerciseData();

    // 3. สร้างฟังก์ชันกรองข้อมูล
    const filterExercises = (data) => {
      // เริ่มกรองจากตัวกรองที่น่าจะกรองได้มากที่สุดก่อน (เพื่อลดจำนวนรายการเร็วๆ)
      let filtered = [...data];

      // ค้นหาตามข้อความ (กรองได้เยอะสุด)
      if (q) {
        const qLower = q.toLowerCase();
        filtered = filtered.filter((e) =>
          e.name?.toLowerCase().includes(qLower)
        );
      }

      // กรองตามกล้ามเนื้อ
      if (muscleParams.length > 0) {
        filtered = filtered.filter((e) =>
          muscleParams.some(
            (muscle) =>
              e.primaryMuscles?.includes(muscle) ||
              (e.secondaryMuscles &&
                e.secondaryMuscles.some((m) => m === muscle))
          )
        );
      }

      // กรองตามอุปกรณ์
      if (equipmentParams.length > 0) {
        filtered = filtered.filter(
          (e) => e.equipment && equipmentParams.includes(e.equipment)
        );
      }

      // กรองตามระดับ
      if (levelParams.length > 0) {
        filtered = filtered.filter(
          (e) => e.level && levelParams.includes(e.level)
        );
      }

      // กรองตามประเภท
      if (categoryParams.length > 0) {
        filtered = filtered.filter(
          (e) => e.category && categoryParams.includes(e.category)
        );
      }

      // กรองตามกลไก
      if (mechanicParams.length > 0) {
        filtered = filtered.filter(
          (e) => e.mechanic && mechanicParams.includes(e.mechanic)
        );
      }

      return filtered;
    };

    // 4. กรองข้อมูล
    const filteredExercises = filterExercises(exercises);

    // 5. ทำ pagination
    const paged = filteredExercises.slice(offset, offset + limit);

    // 6. สร้าง response
    return NextResponse.json(
      {
        success: true,
        total: filteredExercises.length,
        limit,
        offset,
        nextOffset:
          offset + limit < filteredExercises.length ? offset + limit : null,
        data: paged,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error processing exercise request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process exercise request",
      },
      { status: 500 }
    );
  }
}
