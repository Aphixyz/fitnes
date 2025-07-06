# OnboardingWizard Data Flow Documentation

## Overview

OnboardingWizard เป็น component หลักที่จัดการกระบวนการ onboarding ของสมาชิกใหม่ในระบบ FitTrack โดยแบ่งเป็น 4 steps หลัก และแต่ละ step มี sub-steps ย่อย

## โครงสร้างหลัก (Main Structure)

### 1. Steps Configuration

```javascript
const STEPS = [
  {
    id: "personal",
    title: "ข้อมูลส่วนตัว",
    icon: User,
    subSteps: ["weight-height", "body-fat"],
  },
  {
    id: "lifestyle",
    title: "ไลฟ์สไตล์",
    icon: Activity,
    subSteps: [
      "experience-level",
      "training-frequency",
      "activity-level",
      "training-time",
    ],
  },
  {
    id: "goals",
    title: "เป้าหมาย",
    icon: Target,
    subSteps: ["goal-type", "target-weight", "timeline"],
  },
  {
    id: "summary",
    title: "สรุป",
    icon: CheckCircle2,
    subSteps: ["summary"],
  },
];
```

### 2. State Management

```javascript
// Navigation State
const [currentStepIndex, setCurrentStepIndex] = useState(0);
const [currentSubStepIndex, setCurrentSubStepIndex] = useState(0);
const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState({});

// Data States
const [memberData, setMemberData] = useState({});
const [personalData, setPersonalData] = useState({
  member_health_weight: "",
  member_health_height: "",
  member_health_bodyfat: 15,
});
const [lifestyleData, setLifestyleData] = useState({
  fitness_experience_level: "",
  fitness_training_frequency: null,
  member_activity_level: null,
  fitness_training_time: "",
});
const [goalsData, setGoalsData] = useState({
  fitness_goal_type: "",
  fitness_goal_targetweight: "",
  fitness_desired_time: null,
  muscle_goal_type: "",
});

// Calculation Results
const [calculatedTDEE, setCalculatedTDEE] = useState(null);
const [macroSuggestion, setMacroSuggestion] = useState(null);
```

## Data Flow Process

### Step 1: Personal Profile (ข้อมูลส่วนตัว)

#### Sub-step 1.1: Weight & Height

- **Input**: น้ำหนัก (kg), ส่วนสูง (cm)
- **State**: `personalData.member_health_weight`, `personalData.member_health_height`
- **Validation**: ต้องกรอกทั้งสองค่า

#### Sub-step 1.2: Body Fat %

- **Input**: เปอร์เซ็นต์ไขมัน (slider 4-50%)
- **State**: `personalData.member_health_bodyfat`
- **Default**: 15%
- **Validation**: ไม่บังคับ

#### Server Action: `savePersonalProfile()`

```javascript
// File: actions/member/onboarding/onboarding.js
export async function savePersonalProfile(memberId, personalData) {
  // 1. Validate input data
  // 2. Start transaction
  // 3. Upsert member_health table
  // 4. Return success/error result
}
```

**Database Impact:**

- Table: `member_health`
- Fields: `member_health_weight`, `member_health_height`, `member_health_bodyfat`
- Operation: INSERT หรือ UPDATE (ถ้ามีข้อมูลวันนี้แล้ว)

---

### Step 2: Lifestyle Profile (ไลฟ์สไตล์)

#### Sub-step 2.1: Experience Level

- **Options**: beginner, intermediate, advanced
- **State**: `lifestyleData.fitness_experience_level`

#### Sub-step 2.2: Training Frequency

- **Options**: 0, 1-3, 4-6, 7+ วัน/สัปดาห์
- **State**: `lifestyleData.fitness_training_frequency`

#### Sub-step 2.3: Activity Level

- **Options**: 0-3 (เคลื่อนไหวน้อยมาก ถึง ออกกำลังกายหนัก)
- **State**: `lifestyleData.member_activity_level`

#### Sub-step 2.4: Training Time

- **Options**: morning, afternoon, evening, night
- **State**: `lifestyleData.fitness_training_time`

#### Server Action: `saveLifestyleProfile()`

```javascript
// File: actions/member/onboarding/onboarding.js
export async function saveLifestyleProfile(memberId, lifestyleData) {
  // 1. Validate input data
  // 2. Start transaction
  // 3. Update member_health table (activity_level)
  // 4. Create/Update fitness_goal table (preliminary data)
  // 5. Return success/error result
}
```

**Database Impact:**

- Table: `member_health` → `member_activity_level`
- Table: `fitness_goal` → สร้าง record เบื้องต้น (status: 'active')

---

### Step 3: Fitness Goals (เป้าหมาย)

#### Sub-step 3.1: Goal Type

- **Options**: ลดน้ำหนัก, เพิ่มกล้ามเนื้อ, รักษาหุ่น
- **State**: `goalsData.fitness_goal_type`

#### Sub-step 3.2: Target Weight

- **Input**: น้ำหนักเป้าหมาย (kg)
- **State**: `goalsData.fitness_goal_targetweight`
- **Validation**: ขึ้นอยู่กับ goal type

#### Sub-step 3.3: Timeline

- **Options**: 0-3 (1, 2, 3, 4+ เดือน)
- **State**: `goalsData.fitness_desired_time`

#### Server Action: `saveFitnessGoals()`

```javascript
// File: actions/member/onboarding/onboarding.js
export async function saveFitnessGoals(memberId, goalsData) {
  // 1. Validate input data
  // 2. Calculate timeline (weeks)
  // 3. Start transaction
  // 4. Update fitness_goal table (complete data)
  // 5. Return success/error result
}
```

**Database Impact:**

- Table: `fitness_goal` → อัพเดทข้อมูลให้สมบูรณ์

---

### Step 4: Summary & Macro Plan Generation

#### Sub-step 4.1: Summary & Finish

- **Display**: แสดงสรุปข้อมูลทั้งหมด
- **Action**: เรียก `handleFinish()` → `suggestMacroPlan()`

#### Server Action: `suggestMacroPlan()`

```javascript
// File: actions/macro-engine/suggestMacroPlan.js
export async function suggestMacroPlan(memberId) {
  // 1. Fetch member data (member, member_health, fitness_goal)
  // 2. Calculate macro ratios using macro-utils
  // 3. Create macro_plan record in database
  // 4. Return complete macro plan data
}
```

**Database Impact:**

- Table: `macro_plan` → สร้าง record ใหม่
- Fields: `trainer_id`, `member_id`, `protein_ratio`, `carb_ratio`, `fat_ratio`, etc.

## Server Actions Integration

### 1. Data Fetching Actions

```javascript
// File: actions/member/getMemberData.js
getMemberById(memberId); // ดึงข้อมูลพื้นฐานสมาชิก
```

### 2. Data Saving Actions (Sequential)

```javascript
// Step 1 Complete
savePersonalProfile(memberId, personalData);

// Step 2 Complete
saveLifestyleProfile(memberId, lifestyleData);

// Step 3 Complete
saveFitnessGoals(memberId, goalsData);

// Step 4 Complete
suggestMacroPlan(memberId);
```

### 3. Utility Functions

```javascript
// File: utils/macro-utils.js
calcAge(dateOfBirth); // คำนวณอายุ
calcBMR(weight, height, gender, age); // คำนวณ BMR
calcTDEE(bmr, activityLevel); // คำนวณ TDEE
getDefaultMacroRatios(goalType, experienceLevel); // ดึง macro ratios
calcMacroGrams(calories, ratios); // คำนวณ macro เป็นกรัม
```

## Database Schema Flow

### Tables Involved:

1. **member** → ข้อมูลพื้นฐาน (อ่านอย่างเดียว)
2. **member_health** → ข้อมูลสุขภาพ (INSERT/UPDATE)
3. **fitness_goal** → เป้าหมาย (INSERT/UPDATE)
4. **registration** → ข้อมูล trainer (อ่านเพื่อหา trainer_id)
5. **macro_plan** → แผนโภชนาการ (INSERT)

### Data Dependencies:

```
member (base data)
    ↓
member_health (weight, height, body fat, activity level)
    ↓
fitness_goal (experience, frequency, goal type, timeline)
    ↓
macro_plan (calculated ratios, target calories)
```

## Error Handling

### Client-side Validation:

- Form validation ก่อนเลื่อน sub-step
- Required field checking
- Data type validation

### Server-side Error Handling:

- Database transaction rollback
- Error message propagation
- Loading states management

### Error States:

```javascript
const [errors, setErrors] = useState({
  weight: "กรุณากรอกน้ำหนัก",
  height: "กรุณากรอกส่วนสูง",
  experience: "กรุณาเลือกระดับประสบการณ์",
  frequency: "กรุณาเลือกความถี่การออกกำลังกาย",
  submit: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
});
```

## Navigation Flow

### Progress Calculation:

```javascript
const totalSubSteps = STEPS.reduce(
  (total, step) => total + step.subSteps.length,
  0
);
const currentSubStepGlobal =
  STEPS.slice(0, currentStepIndex).reduce(
    (total, step) => total + step.subSteps.length,
    0
  ) + currentSubStepIndex;
const progressPercentage = ((currentSubStepGlobal + 1) / totalSubSteps) * 100;
```

### Navigation Functions:

- `handleNext()` → ตรวจสอบ validation, บันทึกข้อมูล, เลื่อนไป sub-step ถัดไป
- `handlePrevious()` → ย้อนกลับ sub-step ก่อนหน้า
- `handleFinish()` → สร้าง macro plan และ redirect ไป dashboard

## Final Output

เมื่อ onboarding เสร็จสิ้น:

1. **member_health** table มีข้อมูลสุขภาพล่าสุด
2. **fitness_goal** table มีเป้าหมายที่ active
3. **macro_plan** table มีแผนโภชนาการที่คำนวณแล้ว
4. User ถูก redirect ไปที่ `/member/${memberId}/dashboard`
5. Dashboard จะแสดงข้อมูล macro targets และ progress tracking

## Key Features

### Real-time Calculations:

- TDEE calculation อัพเดทตาม input
- Body fat percentage slider with visual feedback
- Target weight validation ตาม goal type

### User Experience:

- Step-by-step wizard interface
- Progress bar แสดงความคืบหน้า
- Validation feedback ทันที
- Loading states ระหว่างบันทึกข้อมูล

### Data Persistence:

- ข้อมูลบันทึกทีละ step
- Transaction safety
- Error recovery
