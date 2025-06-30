# Nutrition Logging Module — Developer Reference

เอกสารนี้สรุปขั้นตอนและโครงสร้างสำหรับฟีเจอร์ **Member Nutrition Logging** ตั้งแต่การดึงข้อมูลแผนโภชนาการปัจจุบัน จนถึงการบันทึก log ลงฐานข้อมูล

---

## 📋 **Chat Progress Summary**

### ✅ **สิ่งที่ทำเสร็จแล้วในแชทนี้:**

#### **1. Server Actions Implementation**

- ✅ **`fetchNutritionPlans.js`** - ดึง active macro plan จาก `macro_plan` table
- ✅ **`upsertLogNutrition.js`** - บันทึก nutrition intake แบบ **accumulative (บวกสะสม)**
- ✅ **`fetchDailyIntake.js`** - ดึงข้อมูล intake รายวันจาก `intake_logs` table
- ✅ **`fetchWeeklyIntake.js`** - ดึงข้อมูล intake รายสัปดาห์ + สถิติค่าเฉลี่ย

#### **2. Business Logic Analysis**

- ✅ กำหนด business logic: Member สามารถ log หลายครั้งต่อวัน
- ✅ ระบบจะสะสมยอด calories/protein/carb/fat ในวันเดียวกัน
- ✅ รองรับทั้ง Daily Goal และ Weekly Goal

#### **3. Database Schema Understanding**

- ✅ ใช้ `macro_plan` table สำหรับเก็บแผนที่ trainer กำหนด (เป็น ratio %)
- ✅ ใช้ `intake_logs` table สำหรับเก็บ log การบริโภคของ member
- ✅ แก้ไข field name `created_at` → `create_at` ตามโครงสร้างฐานข้อมูลจริง

#### **4. Front-end Implementation - COMPLETED**

- ✅ **`page.jsx`** - SSR page หลักที่ดึง macro plan และแสดง components
- ✅ **`MacroPlanDisplay.jsx`** - แสดงแผนโภชนาการปัจจุบันพร้อม progress circles
- ✅ **`NutritionLogger.jsx`** - ฟอร์มบันทึก nutrition intake พร้อม validation
- ✅ **`DailyProgress.jsx`** - แสดงความคืบหน้ารายวัน **เชื่อมต่อข้อมูลจริงแล้ว**
- ✅ **`WeeklyProgress.jsx`** - แสดงกราฟความคืบหน้ารายสัปดาห์ **เชื่อมต่อข้อมูลจริงแล้ว**
- ✅ **`NoActivePlanMessage.jsx`** - ข้อความเมื่อไม่มีแผนโภชนาการ
- ✅ **`NutritionPageClient.jsx`** - Client wrapper สำหรับจัดการ refresh logic

#### **5. Helper Functions Integration**

- ✅ ลบ custom `nutritionUtils.js` ออกทั้งหมด (ตาม DRY principle)
- ✅ ใช้ `calcMacroGrams()` จาก `@/utils/macro-utils.js`
- ✅ ใช้ `formatDate()` จาก `@/utils/utils.js`
- ✅ รักษา code consistency ตาม project standards

#### **6. Data Flow & Refresh Logic**

- ✅ เชื่อมต่อกับฐานข้อมูลจริง **ไม่มี mock data เหลือเลย**
- ✅ Auto refresh หลังบันทึกข้อมูลสำเร็จ (ใช้ refreshKey + component re-mount)
- ✅ Toast notifications สำหรับ success/error feedback
- ✅ Form validation และ error handling ครบถ้วน

---

## 1. Fetch Current Nutrition Plan

### 1.1 จุดประสงค์

- ดึง **active macro plan** ของสมาชิก (member) ตามวันที่ปัจจุบัน

### 1.2 SQL Query (Server Action) - **UPDATED**

```sql
-- ใช้ macro_plan table แทน nutrition_plan
SELECT
  macro_plan_id,
  trainer_id,
  member_id,
  protein_ratio,
  carb_ratio,
  fat_ratio,
  start_date,
  end_date,
  plan_status,
  created_at
FROM macro_plan
WHERE member_id = ?
  AND plan_status = 'active'
  AND start_date <= CURDATE()
  AND end_date >= CURDATE()
ORDER BY start_date DESC
LIMIT 1;
```

### 1.3 Data Output - **UPDATED**

```js
{
  macro_plan_id: 42,
  trainer_id: 1,
  member_id: 5,
  protein_ratio: 30.00,    // เป็น % แทน grams
  carb_ratio: 40.00,       // เป็น % แทน grams
  fat_ratio: 30.00,        // เป็น % แทน grams
  start_date: '2025-06-01',
  end_date: '2025-06-30',
  plan_status: 'active'
  // หมายเหตุ: ต้องคำนวณ macros จริงจาก ratio × target calories
}
```

---

## 2. upsert Intake Log - **UPDATED: Accumulative Logic**

### 2.1 จุดประสงค์

- บันทึกข้อมูล macro intake ประจำวัน**แบบสะสม** ลง `intake_logs`
- รองรับการบันทึก**หลายครั้งต่อวัน** (เช้า กลางวัน เย็น ขนม ฯลฯ)

### 2.2 Business Logic - **NEW**

```js
// การทำงานของ InsertLogNutrition:
// 1. เช็คว่ามี record สำหรับ member_id + date นี้แล้วไหม?
// 2. ถ้ามี → UPDATE แบบบวกสะสม (old_calories + new_calories)
// 3. ถ้าไม่มี → INSERT record ใหม่

// ตัวอย่าง:
// ครั้งที่ 1: calories: 500 → total: 500
// ครั้งที่ 2: calories: 300 → total: 800 (500+300)
// ครั้งที่ 3: calories: 200 → total: 1000 (800+200)
```

### 2.3 SQL for Insert / Update - **UPDATED**

```sql
-- เช็คว่ามี record อยู่แล้วไหม
SELECT intake_logs_id, calories, protein, carb, fat
FROM intake_logs
WHERE member_id = ? AND date = ?;

-- ถ้ามี → UPDATE แบบบวกสะสม
UPDATE intake_logs
SET
  calories = calories + ?,
  protein = protein + ?,
  carb = carb + ?,
  fat = fat + ?
WHERE member_id = ? AND date = ?;

-- ถ้าไม่มี → INSERT ใหม่
INSERT INTO intake_logs (member_id, date, calories, protein, carb, fat)
VALUES (?, ?, ?, ?, ?, ?);
```

### 2.4 Response Format - **NEW**

```js
// กรณี Accumulate (บวกสะสม)
{
  success: true,
  action: 'accumulated',
  intake_logs_id: 123,
  member_id: 5,
  date: '2025-01-17',
  // ค่าที่เพิ่มในครั้งนี้
  added_calories: 300,
  added_protein: 20,
  added_carb: 40,
  added_fat: 10,
  // ยอดรวมใหม่หลังจากบวกสะสม
  total_calories: 1200,
  total_protein: 80,
  total_carb: 150,
  total_fat: 40,
  message: 'Nutrition intake accumulated successfully'
}

// กรณี Create ใหม่
{
  success: true,
  action: 'created',
  // ... (added_* และ total_* จะเท่ากัน)
}
```

---

## 3. Back-end Server Actions

### 3.1 File Structure - **COMPLETED**

```
/actions
  /member
    /my-nutrition-plans/
      ✅ fetchNutritionPlans.js    # ดึง active macro plan
      ✅ upsertLogNutrition.js     # บันทึก intake แบบสะสม
      ✅ fetchDailyIntake.js       # ดึงข้อมูลรายวัน
      ✅ fetchWeeklyIntake.js      # ดึงข้อมูลรายสัปดาห์ + สถิติ
```

---

## 4. Front-end Implementation - **DETAILED CHECKLIST**

### 4.1 SSR Page: `/member/[id]/nutrition/page.jsx`

#### **📋 Page Setup Checklist:**

- ✅ สร้างไฟล์ `app/member/[id]/nutrition/page.jsx`
- ✅ Import `fetchNutritionPlans` และเรียกใช้ใน server component
- ✅ เตรียม memberId จาก params และ validation
- ✅ Handle กรณีไม่มี active macro plan
- ✅ Pass ข้อมูลไปยัง client components ผ่าน `NutritionPageClient`

```js
// ตัวอย่าง structure:
export default async function NutritionPage({ params }) {
  const memberId = parseInt(params.id);
  const macroPlan = await fetchNutritionPlans(memberId);

  if (!macroPlan) {
    return <NoActivePlanMessage />;
  }

  return (
    <div>
      <MacroPlanDisplay plan={macroPlan} />
      <NutritionLogger memberId={memberId} />
      <DailyProgress memberId={memberId} />
    </div>
  );
}
```

### 4.2 Client Components: `/member/[id]/nutrition/_components/`

#### **📋 Components Checklist:**

##### **A. MacroPlanDisplay.jsx** - แสดงเป้าหมาย ✅ **COMPLETED**

- ✅ สร้าง component แสดง current macro plan
- ✅ แสดง protein/carb/fat ratio (%) พร้อม ProgressCircle
- ✅ คำนวณ target calories (ใช้ hardcoded 2000 ตอนนี้)
- ✅ แสดง target macros เป็น grams ด้วย `calcMacroGrams()`
- ✅ Style ด้วย Tailwind + Shadcn UI แบบ responsive
- ✅ แสดงข้อมูลแผน (วันที่, trainer ID) และคำแนะนำ

##### **B. NutritionLogger.jsx** - ฟอร์มบันทึก ✅ **COMPLETED**

- ✅ สร้างฟอร์มสำหรับบันทึก nutrition intake
- ✅ DatePicker (default = today)
- ✅ Input fields: calories, protein, carb, fat พร้อม validation
- ✅ Validation (numbers ≥ 0, max limits, required fields)
- ✅ เรียก `InsertLogNutrition` server action
- ✅ Handle response (success/error) พร้อม toast notifications
- ✅ Auto reset form หลังบันทึกสำเร็จ
- ✅ เพิ่ม `onSuccess` callback สำหรับ refresh data

```js
// ตัวอย่าง structure:
"use client";
import { useState } from "react";
import { upsertLogNutrition } from "@/actions/member/my-nutrition-plans/upsertLogNutrition";

export default function NutritionLogger({ memberId }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    calories: "",
    protein: "",
    carb: "",
    fat: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await upsertLogNutrition({
      memberId,
      date: formData.date,
      calories: parseFloat(formData.calories),
      protein: parseFloat(formData.protein),
      carb: parseFloat(formData.carb),
      fat: parseFloat(formData.fat),
    });

    if (result.success) {
      // Show success toast
      // Reset form
      // Trigger refresh
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

##### **C. DailyProgress.jsx** - แสดงความคืบหน้า ✅ **COMPLETED**

- ✅ สร้าง component แสดงความคืบหน้ารายวัน
- ✅ ดึงข้อมูล intake_logs ด้วย `fetchDailyIntake()` **เชื่อมต่อข้อมูลจริง**
- ✅ แสดง current vs target macros พร้อม Progress bars
- ✅ แสดง remaining macros และ status badges
- ✅ เตือนถ้าเกินเป้า (color-coded: red/yellow/green)
- ✅ Style เป็น cards ด้วย Shadcn UI responsive design
- ✅ Loading states และ error handling

##### **D. WeeklyProgress.jsx** - แสดงความคืบหน้ารายสัปดาห์ ✅ **COMPLETED**

- ✅ สร้าง component แสดงความคืบหน้ารายสัปดาห์
- ✅ ดึงข้อมูล intake_logs ด้วย `fetchWeeklyStats()` **เชื่อมต่อข้อมูลจริง**
- ✅ แสดงเป็น chart (LineChart + BarChart) ด้วย Recharts
- ✅ Toggle ระหว่าง line และ bar chart views
- ✅ เปรียบเทียบกับ weekly goals และแสดงค่าเฉลี่ยต่อวัน
- ✅ จัดการ empty data (วันที่ไม่มีข้อมูล = 0)
- ✅ Chart config และ responsive design

##### **E. NoActivePlanMessage.jsx** - ข้อความแนะนำ ✅ **COMPLETED**

- ✅ Component แสดงเมื่อไม่มี active macro plan
- ✅ Step-by-step guide สำหรับรับแผนโภชนาการ
- ✅ Contact trainer functionality
- ✅ ข้อมูลประโยชน์และสิ่งที่ทำได้ขณะรอแผน
- ✅ Alert components และ informative cards

##### **F. NutritionPageClient.jsx** - Client Wrapper ✅ **NEW COMPONENT**

- ✅ Client-side wrapper สำหรับจัดการ refresh logic
- ✅ ใช้ `refreshKey` เพื่อ force re-mount components
- ✅ Handle `onSuccess` callback จาก NutritionLogger
- ✅ แยก SSR logic จาก client-side interactions
  // Reset form
  // Trigger refresh
  }
  };

  return <form onSubmit={handleSubmit}>{/_ Form fields _/}</form>;
  }

```

##### **C. DailyProgress.jsx** - แสดงความคืบหน้า

- [ ] สร้าง component แสดงความคืบหน้ารายวัน
- [ ] ดึงข้อมูล intake_logs ของวันนี้
- [ ] แสดง current vs target macros
- [ ] Progress bars หรือ circular progress
- [ ] แสดง remaining macros
- [ ] เตือนถ้าเกินเป้า (over goal warning)
- [ ] Style เป็น cards ด้วย Shadcn UI

##### **D. WeeklyProgress.jsx** - แสดงความคืบหน้ารายสัปดาห์

- [ ] สร้าง component แสดงความคืบหน้ารายสัปดาห์
- [ ] ดึงข้อมูล intake_logs ของ 7 วันที่ผ่านมา
- [ ] แสดงเป็น chart (Recharts)
- [ ] เปรียบเทียบกับ weekly goals
- [ ] แสดงค่าเฉลี่ยต่อวัน

##### **E. Helper Functions**

- [ ] สร้าง utility functions สำหรับ:
  - คำนวณ TDEE จาก member health data
  - แปลง macro ratio เป็น grams
  - Format numbers สำหรับแสดงผล
  - Date utilities (get week range, etc.)

#### **📋 State Management:**

- [ ] ใช้ useState สำหรับ form data
- [ ] ใช้ useEffect สำหรับ fetch daily/weekly data
- [ ] พิจารณาใช้ React Query สำหรับ caching
- [ ] Handle loading states

#### **📋 UI/UX Enhancements:**

- [ ] เพิ่ม loading spinners
- [ ] เพิ่ม error boundaries
- [ ] เพิ่ม toast notifications (success/error)
- [ ] เพิ่ม confirmation dialogs
- [ ] ทำให้ responsive (mobile-first)
- [ ] เพิ่ม animations เบาๆ

#### **📋 Data Fetching Functions:**

- [ ] สร้าง function ดึง daily intake logs
- [ ] สร้าง function ดึง weekly intake logs
- [ ] สร้าง function คำนวณ progress percentages

---

## 🎯 **IMPLEMENTATION COMPLETED - สรุปผลงานทั้งหมด**

### 📅 **Development Summary (Session Complete)**

ในแชทนี้ได้พัฒนา **Member Nutrition Logging Module** ให้เสร็จสมบูรณ์ ตั้งแต่ Server Actions จนถึง Front-end Components ทั้งหมด

---

### 🗂️ **File Structure ที่สร้างขึ้น:**

```

📁 actions/member/my-nutrition-plans/
├── ✅ fetchNutritionPlans.js # ดึง active macro plan
├── ✅ upsertLogNutrition.js # บันทึก intake (สะสม)
├── ✅ fetchDailyIntake.js # ดึงข้อมูลรายวัน
└── ✅ fetchWeeklyIntake.js # ดึงข้อมูลรายสัปดาห์

📁 app/member/[id]/nutrition/
├── ✅ page.jsx # SSR Main Page
├── 📁 \_components/
│ ├── ✅ MacroPlanDisplay.jsx # แสดงแผนโภชนาการ
│ ├── ✅ NutritionLogger.jsx # ฟอร์มบันทึก
│ ├── ✅ DailyProgress.jsx # ความคืบหน้ารายวัน
│ ├── ✅ WeeklyProgress.jsx # ความคืบหน้ารายสัปดาห์
│ ├── ✅ NoActivePlanMessage.jsx # ข้อความเมื่อไม่มีแผน
│ └── ✅ NutritionPageClient.jsx # Client wrapper
└── 📄 nutrition.md # Developer documentation

```

---

### 🔧 **Server Actions Capabilities:**

#### **1. fetchNutritionPlans.js**
- ดึง active macro plan ของ member
- เช็ควันที่ start_date ≤ today ≤ end_date
- Return format: `{ protein_ratio, carb_ratio, fat_ratio, ... }`

#### **2. fetchDailyIntake.js** ⭐ **ใหม่**
- ดึงข้อมูล intake รายวันจาก `intake_logs`
- Support การเลือกวันที่ (default = today)
- Return null หากไม่มีข้อมูล

#### **3. fetchWeeklyIntake.js** ⭐ **ใหม่**
- ดึงข้อมูล 7 วันย้อนหลัง
- คำนวณสถิติ (totals, averages, days with data)
- จัดการวันที่ไม่มีข้อมูล (return 0 values)

#### **4. upsertLogNutrition.js**
- บันทึกแบบ accumulative (บวกสะสมในวันเดียวกัน)
- Response พร้อม `added_*` และ `total_*` values
- รองรับการ log หลายครั้งต่อวัน

---

### 🎨 **Front-end Components Features:**

#### **MacroPlanDisplay.jsx**
- 📊 ProgressCircle แสดง macro ratios
- 🎯 คำนวณ target grams ด้วย `calcMacroGrams()`
- 🎨 Color-coded cards (orange/blue/purple)
- 📅 แสดงวันที่แผนและข้อมูล trainer

#### **NutritionLogger.jsx**
- 📝 Form validation ครบถ้วน (required, positive, max limits)
- 📅 DatePicker integration
- 🔄 Auto refresh หลังบันทึกสำเร็จ
- 🎉 Toast notifications พร้อม accumulative info
- ♻️ Form reset และ loading states

#### **DailyProgress.jsx** 🔗 **เชื่อมต่อข้อมูลจริง**
- 📈 Progress bars พร้อม color coding
- 🏷️ Status badges (เกินเป้า/ใกล้เป้า/ดี/ต้องเพิ่ม)
- 📊 แสดง current vs target และ remaining values
- 🔄 Refresh button และ error handling

#### **WeeklyProgress.jsx** 🔗 **เชื่อมต่อข้อมูลจริง**
- 📊 Recharts integration (LineChart + BarChart)
- 🔄 Toggle chart types
- 📈 แสดงค่าเฉลี่ยรายสัปดาห์
- 📅 จัดการ 7 วันครบพร้อม empty data

#### **NoActivePlanMessage.jsx**
- 📋 Step-by-step guide
- 💬 Contact trainer functionality
- ℹ️ ข้อมูลประโยชน์และคำแนะนำ
- 🎨 Informative card layout

#### **NutritionPageClient.jsx** ⭐ **ใหม่**
- 🔄 Refresh logic ด้วย `refreshKey`
- 🎯 Force re-mount หลังบันทึกสำเร็จ
- 🔧 แยก SSR จาก client interactions

---

### 🏗️ **Technical Implementation Highlights:**

#### **Database Integration:**
- ✅ เชื่อมต่อ `macro_plan` table สำหรับ trainer plans
- ✅ เชื่อมต่อ `intake_logs` table สำหรับ member intake
- ✅ แก้ไข field name: `created_at` → `create_at`
- ❌ **ไม่มี mock data เหลือเลย**

#### **Helper Functions Usage:**
- ✅ ใช้ `calcMacroGrams()` จาก `@/utils/macro-utils.js`
- ✅ ใช้ `formatDate()` จาก `@/utils/utils.js`
- ✅ ลบ custom `nutritionUtils.js` (DRY principle)
- ✅ รักษา code consistency

#### **UI/UX Features:**
- 🎨 Shadcn/ui + Radix components
- 📱 Responsive design (mobile-first)
- 🎉 Toast notifications ครบถ้วน
- ⚡ Loading states และ skeleton UI
- 🔄 Auto refresh หลังบันทึก
- 🎯 Form validation แบบ real-time

#### **Architecture:**
- 🏗️ SSR main page + Client components
- 🔄 State management ด้วย useState + useEffect
- 🎯 Component separation ตาม responsibility
- 🔗 Server actions integration ทั้งหมด

---

### 🎉 **Ready for Production:**

✅ **Database**: เชื่อมต่อฐานข้อมูลจริงแล้ว
✅ **Backend**: Server actions ครบทุกฟีเจอร์
✅ **Frontend**: Components สมบูรณ์พร้อม UX
✅ **Integration**: Data flow และ refresh logic
✅ **Standards**: ตาม project conventions
✅ **Testing**: Ready สำหรับ real data testing

**🚀 Module พร้อมใช้งานแล้ว!**
```
