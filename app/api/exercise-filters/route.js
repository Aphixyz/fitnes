// import fs from "fs/promises";
// import path from "path";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     // โหลดข้อมูลท่าออกกำลังกายจากไฟล์ JSON
//     const filePath = path.join(process.cwd(), "data", "exercises.json");
//     const raw = await fs.readFile(filePath, "utf-8");
//     const exercises = JSON.parse(raw);

//     // สกัดตัวเลือกที่ไม่ซ้ำกัน
//     const muscles = new Set();
//     const equipment = new Set();
//     const levels = new Set();
//     const categories = new Set();
//     const mechanics = new Set();

//     exercises.forEach((exercise) => {
//       // เพิ่มกล้ามเนื้อหลัก
//       if (exercise.primaryMuscles) {
//         exercise.primaryMuscles.forEach((muscle) => muscles.add(muscle));
//       }

//       // เพิ่มกล้ามเนื้อรอง
//       if (exercise.secondaryMuscles) {
//         exercise.secondaryMuscles.forEach((muscle) => muscles.add(muscle));
//       }

//       // เพิ่มอุปกรณ์
//       if (exercise.equipment) {
//         equipment.add(exercise.equipment);
//       }

//       // เพิ่มระดับความยาก
//       if (exercise.level) {
//         levels.add(exercise.level);
//       }

//       // เพิ่มประเภท
//       if (exercise.category) {
//         categories.add(exercise.category);
//       }

//       // เพิ่มกลไก
//       if (exercise.mechanic) {
//         mechanics.add(exercise.mechanic);
//       }
//     });

//     // แปลง Set เป็น Array และเรียงลำดับ
//     return NextResponse.json({
//       muscles: Array.from(muscles).sort(),
//       equipment: Array.from(equipment).sort(),
//       levels: Array.from(levels).sort(),
//       categories: Array.from(categories).sort(),
//       mechanics: Array.from(mechanics).sort(),
//     });
//   } catch (error) {
//     console.error("Error fetching filter options:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch filter options" },
//       { status: 500 }
//     );
//   }
// }

import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

// กำหนดตัวแปร global เพื่อแคชข้อมูล
let cachedFilterOptions = null;
let lastCacheTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ชั่วโมง

export async function GET() {
  try {
    // ใช้ข้อมูลจากแคชถ้ายังไม่หมดอายุ
    if (cachedFilterOptions && lastCacheTime && Date.now() - lastCacheTime < CACHE_DURATION) {
      return NextResponse.json(cachedFilterOptions, {
        headers: {
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=172800" // 24 ชั่วโมง
        }
      });
    }

    // โหลดข้อมูลจากไฟล์ JSON
    const filePath = path.join(process.cwd(), "data", "exercises.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const exercises = JSON.parse(raw);

    // สร้างเซ็ตเพื่อเก็บค่าที่ไม่ซ้ำกัน
    const muscles = new Set();
    const equipment = new Set();
    const levels = new Set();
    const categories = new Set();
    const mechanics = new Set();

    // วนลูปกรอกข้อมูลในเซ็ต
    exercises.forEach((exercise) => {
      // กล้ามเนื้อหลัก
      if (Array.isArray(exercise.primaryMuscles)) {
        exercise.primaryMuscles.forEach((m) => muscles.add(m));
      }
      
      // กล้ามเนื้อรอง
      if (Array.isArray(exercise.secondaryMuscles)) {
        exercise.secondaryMuscles.forEach((m) => muscles.add(m));
      }
      
      // อุปกรณ์
      if (exercise.equipment) {
        equipment.add(exercise.equipment);
      }
      
      // ระดับ
      if (exercise.level) {
        levels.add(exercise.level);
      }
      
      // หมวดหมู่
      if (exercise.category) {
        categories.add(exercise.category);
      }
      
      // กลไก
      if (exercise.mechanic) {
        mechanics.add(exercise.mechanic);
      }
    });

    // สร้างออบเจ็กต์ของตัวเลือก filter แปลงจากเซ็ตเป็นอาร์เรย์และเรียงลำดับ
    cachedFilterOptions = {
      muscles: Array.from(muscles).filter(Boolean).sort(),
      equipment: Array.from(equipment).filter(Boolean).sort(),
      levels: Array.from(levels).filter(Boolean).sort(),
      categories: Array.from(categories).filter(Boolean).sort(),
      mechanics: Array.from(mechanics).filter(Boolean).sort()
    };
    
    lastCacheTime = Date.now();

    // ส่งข้อมูลกลับพร้อมตั้งค่าการแคช
    return NextResponse.json(cachedFilterOptions, {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=172800" // 24 ชั่วโมง
      }
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}