"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Target,
  Activity,
  User,
} from "lucide-react";
import {
  savePersonalProfile,
  saveLifestyleProfile,
  saveFitnessGoals,
} from "@/actions/member/onboarding/onboarding";
import { suggestMacroPlan } from "@/actions/macro-engine/suggestMacroPlan";
import { calcAge, calcBMR, calcTDEE } from "@/utils/macro-utils";
import { getMemberById } from "@/actions/member/getMemberData";

// กำหนด Steps และ Sub-steps ใหม่
const STEPS = [
  {
    id: "goals",
    title: "เป้าหมาย",
    icon: Target,
    subSteps: [
      "goal-type",
      "target-weight", 
      "timeline",
    ],
  },
  {
    id: "personal-lifestyle",
    title: "ข้อมูลส่วนตัว",
    icon: User,
    subSteps: [
      "น้ำหนัก-ส่วนสูง",
      "body-fat",
      "experience-level",
      "training-frequency",
      "activity-level",
      "training-time",
    ],
  },
  {
    id: "summary",
    title: "สรุป",
    icon: CheckCircle2,
    subSteps: ["summary"],
  },
];

// Goal Types
const GOAL_TYPES = [
  {
    value: "ลดน้ำหนัก",
    label: "ลดน้ำหนัก",
    description: "ลดไขมันและน้ำหนักตัว",
  },
  {
    value: "เพิ่มกล้ามเนื้อ",
    label: "เพิ่มกล้ามเนื้อ",
    description: "เพิ่มมวลกล้ามเนื้อและความแข็งแรง",
  },
  {
    value: "รักษาหุ่น",
    label: "รักษาหุ่น",
    description: "รักษาน้ำหนักและสุขภาพปัจจุบัน",
  },
];

// Muscle Gain Sub Options (for เพิ่มกล้ามเนื้อ case)
const MUSCLE_GAIN_OPTIONS = [
  {
    value: "เพิ่มกล้ามเนื้อกับลดไขมัน",
    label: "เพิ่มกล้ามเนื้อกับลดไขมัน",
    description: "Body recomposition",
  },
  {
    value: "เพิ่มกล้ามเนื้อและน้ำหนัก",
    label: "เพิ่มกล้ามเนื้อและน้ำหนัก",
    description: "Bulking",
  },
];

// Body Fat % Ranges
const BODY_FAT_RANGES = [
  { value: 4.5, label: "4-5%", min: 4, max: 5 },
  { value: 6.5, label: "6-7%", min: 6, max: 7 },
  { value: 8.5, label: "8-9%", min: 8, max: 9 },
  { value: 11, label: "10-12%", min: 10, max: 12 },
  { value: 14, label: "13-15%", min: 13, max: 15 },
  { value: 17.5, label: "16-19%", min: 16, max: 19 },
  { value: 22, label: "20-24%", min: 20, max: 24 },
  { value: 28, label: "25-31%", min: 25, max: 31 },
  { value: 35, label: "32%+", min: 32, max: 50 },
];

// Experience Levels
const EXPERIENCE_LEVELS = [
  {
    value: "beginner",
    label: "เริ่มต้น",
    description: "เพิ่งออกกำลังกายเป็นประจำ < 6 เดือน",
  },
  {
    value: "intermediate",
    label: "กลาง",
    description: "ออกกำลังกาย 6–24 เดือน",
  },
  {
    value: "advanced",
    label: "ขั้นสูง",
    description: "ออกกำลังกาย > 2 ปี",
  },
];

// Training Frequencies
const TRAINING_FREQUENCIES = [
  {
    value: 0,
    label: "0 วัน/สัปดาห์",
    description: "ไม่ได้ออกกำลังกาย",
  },
  {
    value: 1,
    label: "1-3 วัน/สัปดาห์",
    description: "น้อย",
  },
  {
    value: 2,
    label: "4-6 วัน/สัปดาห์",
    description: "ปานกลาง",
  },
  {
    value: 3,
    label: "7+ วัน/สัปดาห์",
    description: "ทุกวัน",
  },
];

// Training Times
const TRAINING_TIMES = [
  {
    value: "morning",
    label: "เช้า",
    description: "06:00 – 09:00",
  },
  {
    value: "afternoon",
    label: "กลางวัน",
    description: "10:00 – 14:00",
  },
  {
    value: "evening",
    label: "บ่าย",
    description: "15:00 – 18:00",
  },
  {
    value: "night",
    label: "เย็น",
    description: "18:00 – 21:00",
  },
];

// Activity Levels
const ACTIVITY_LEVELS = [
  {
    value: 0,
    label: "เคลื่อนไหวน้อยมาก",
    description: "นั่งทำงาน ไม่ค่อยออกกำลังกาย",
  },
  {
    value: 1,
    label: "เคลื่อนไหวเล็กน้อย",
    description: "ออกกำลังกายเบา ๆ สัปดาห์ละ 1–3 วัน",
  },
  {
    value: 2,
    label: "ออกกำลังกายปานกลาง",
    description: "ออกกำลังกายหนักปานกลาง 3–5 วันต่อสัปดาห์",
  },
  {
    value: 3,
    label: "ออกกำลังกายหนัก",
    description: "ออกกำลังกายหนักหรือมีกิจกรรมทางกายต่อเนื่องทุกวัน",
  },
];

// Primary Goals
const PRIMARY_GOALS = [
  {
    value: "lose_weight",
    label: "ลดน้ำหนัก",
    description: "ลดไขมัน รูปร่างกระชับ",
    icon: "📉",
  },
  {
    value: "maintain_weight",
    label: "รักษาน้ำหนัก",
    description: "รักษาสุขภาพ กินให้ถูกสัดส่วน",
    icon: "⚖️",
  },
  {
    value: "gain_weight",
    label: "เพิ่มน้ำหนัก",
    description: "เพิ่มกล้ามเนื้อ ร่างกายแข็งแรง",
    icon: "📈",
  },
];

// Desired Timeline
const DESIRED_TIMELINE = [
  {
    value: 0,
    label: "< 4 สัปดาห์",
    description: "เป้าหมายระยะสั้น",
    weeks: 4,
  },
  {
    value: 1,
    label: "4-8 สัปดาห์",
    description: "1–2 เดือน",
    weeks: 8,
  },
  {
    value: 2,
    label: "8-12 สัปดาห์",
    description: "2–3 เดือน",
    weeks: 12,
  },
  {
    value: 3,
    label: "12+ สัปดาห์",
    description: "3+ เดือน",
    weeks: 16,
  },
];

export default function OnboardingWizard({ memberId }) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // State สำหรับข้อมูล
  const [memberData, setMemberData] = useState({});
  const [personalData, setPersonalData] = useState({
    member_health_weight: "",
    member_health_height: "",
    member_health_bodyfat: 14,
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
    muscle_goal_type: "", // for เพิ่มกล้ามเนื้อ: "increase_weight" หรือ "body_recomposition"
  });

  const [calculatedTDEE, setCalculatedTDEE] = useState(null);
  const [macroSuggestion, setMacroSuggestion] = useState(null);

  // คำนวณ progress
  const totalSubSteps = STEPS.reduce((acc, step) => acc + step.subSteps.length, 0);
  const currentSubStepGlobal =
    STEPS.slice(0, currentStepIndex).reduce(
      (acc, step) => acc + step.subSteps.length,
      0
    ) + currentSubStepIndex;
  const progressPercentage = ((currentSubStepGlobal + 1) / totalSubSteps) * 100;

  // ดึงข้อมูลสมาชิกเพื่อคำนวณ BMR
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const data = await getMemberById(memberId);
        setMemberData(data);
      } catch (error) {
        console.error("Error fetching member data:", error);
      }
    };

    if (memberId) {
      fetchMemberData();
    }
  }, [memberId]);

  // คำนวณ TDEE เมื่อมีข้อมูลครบ
  useEffect(() => {
    if (
      personalData.member_health_weight &&
      personalData.member_health_height &&
      lifestyleData.member_activity_level !== null &&
      memberData.gender &&
      memberData.dateOfBirth
    ) {
      const age = calcAge(memberData.dateOfBirth);
      const bmr = calcBMR(
        parseFloat(personalData.member_health_weight),
        parseFloat(personalData.member_health_height),
        memberData.gender,
        age
      );
      const tdee = calcTDEE(bmr, lifestyleData.member_activity_level);

      setCalculatedTDEE({
        bmr: bmr,
        tdee: tdee,
        age: age,
      });
    }
  }, [personalData, lifestyleData, memberData]);

  const getCurrentStep = () => STEPS[currentStepIndex];

  const getCurrentSubStep = () =>
    getCurrentStep().subSteps[currentSubStepIndex];

  const validateCurrentSubStep = () => {
    return true; // No validation for now
  };

  const handleNext = async () => {
    const currentStep = getCurrentStep();

    // บันทึกข้อมูลเมื่อจบ step
    if (currentSubStepIndex === currentStep.subSteps.length - 1) {
      if (currentStep.id === "goals") {
        setLoading(true);
        const result = await saveFitnessGoals(memberId, goalsData);
        setLoading(false);
        if (!result.success) {
          alert(result.message);
          return;
        }
      } else if (currentStep.id === "personal-lifestyle") {
        setLoading(true);
        const personalResult = await savePersonalProfile(memberId, personalData);
        const lifestyleResult = await saveLifestyleProfile(memberId, lifestyleData);
        setLoading(false);
        
        if (!personalResult.success || !lifestyleResult.success) {
          alert(personalResult.message || lifestyleResult.message);
          return;
        }
      }
    }

    // Move to next sub-step or step
    if (currentSubStepIndex < currentStep.subSteps.length - 1) {
      setCurrentSubStepIndex(currentSubStepIndex + 1);
    } else if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCurrentSubStepIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentSubStepIndex > 0) {
      setCurrentSubStepIndex(currentSubStepIndex - 1);
    } else if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setCurrentSubStepIndex(STEPS[currentStepIndex - 1].subSteps.length - 1);
    }
  };


  const handleFinish = async () => {
    setLoading(true);
    try {
      const result = await suggestMacroPlan(memberId);

      if (result.success) {
        setMacroSuggestion(result);
        // Redirect to dashboard after showing summary
        setTimeout(() => {
          router.push(`/member/${memberId}/dashboard`);
        }, 3000);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการสร้าง Macro Plan");
    } finally {
      setLoading(false);
    }
  };

  // Card Selector Component
  const CardSelector = ({ options, value, onChange, name }) => (
    <div className="space-y-3">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
            value === option.value
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{option.label}</div>
              {option.description && (
                <div className="text-sm text-gray-500 mt-1">{option.description}</div>
              )}
            </div>
            {option.emoji && <span className="text-2xl">{option.emoji}</span>}
            {option.icon && <span className="text-2xl">{option.icon}</span>}
          </div>
        </button>
      ))}
    </div>
  );

  const renderSubStepContent = () => {
    getCurrentSubStep();

    switch (getCurrentSubStep()) {
      case "goal-type":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3 text-gray-800">เป้าหมายของคุณ</h1>
              <p className="text-gray-600 text-base">เลือกเป้าหมายหลักที่คุณต้องการบรรลุ</p>
            </div>

            <div className="space-y-3">
              {GOAL_TYPES.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => setGoalsData({ ...goalsData, fitness_goal_type: goal.value })}
                  className={`w-full p-6 text-left border-2 rounded-xl transition-all ${
                    goalsData.fitness_goal_type === goal.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{goal.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{goal.description}</div>
                    </div>
                    <div
                      className={`w-6 h-6 border-2 rounded ${
                        goalsData.fitness_goal_type === goal.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {goalsData.fitness_goal_type === goal.value && (
                        <div className="w-2 h-2 bg-white rounded-full m-1"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "target-weight":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3 text-gray-800">
                {goalsData.fitness_goal_type === "ลดน้ำหนัก" 
                  ? "ต้องการลดน้ำหนักเหลือเท่าไหร่"
                  : goalsData.fitness_goal_type === "รักษาหุ่น"
                  ? "ต้องการรักษาน้ำหนักที่เท่าไหร่"
                  : "เป้าหมายของคุณ"}
              </h1>
              {goalsData.fitness_goal_type === "เพิ่มกล้ามเนื้อ" ? (
                <p className="text-gray-600 text-base">เลือกแนวทางที่ต้องการ</p>
              ) : (
                <p className="text-gray-600 text-base">ระบุน้ำหนักเป้าหมายของคุณ (กิโลกรัม)</p>
              )}
            </div>

            {goalsData.fitness_goal_type === "เพิ่มกล้ามเนื้อ" && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <button
                    onClick={() => setGoalsData({ ...goalsData, muscle_goal_type: "increase_weight" })}
                    className={`w-full p-6 text-left border-2 rounded-xl transition-all ${
                      goalsData.muscle_goal_type === "increase_weight"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-semibold text-gray-900">เพิ่มกล้ามเนื้อและน้ำหนัก</div>
                        <div className="text-sm text-gray-500 mt-1">Bulking</div>
                      </div>
                      <div
                        className={`w-6 h-6 border-2 rounded ${
                          goalsData.muscle_goal_type === "increase_weight"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {goalsData.muscle_goal_type === "increase_weight" && (
                          <div className="w-2 h-2 bg-white rounded-full m-1"></div>
                        )}
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setGoalsData({ ...goalsData, muscle_goal_type: "body_recomposition" })}
                    className={`w-full p-6 text-left border-2 rounded-xl transition-all ${
                      goalsData.muscle_goal_type === "body_recomposition"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-semibold text-gray-900">เพิ่มกล้ามเนื้อกับลดไขมัน</div>
                        <div className="text-sm text-gray-500 mt-1">Body recomposition</div>
                      </div>
                      <div
                        className={`w-6 h-6 border-2 rounded ${
                          goalsData.muscle_goal_type === "body_recomposition"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {goalsData.muscle_goal_type === "body_recomposition" && (
                          <div className="w-2 h-2 bg-white rounded-full m-1"></div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
                
                <div className="max-w-sm mx-auto">
                  <Input
                    type="number"
                    placeholder="-"
                    value={goalsData.fitness_goal_targetweight}
                    onChange={(e) => setGoalsData({ ...goalsData, fitness_goal_targetweight: e.target.value })}
                    className="text-3xl font-bold h-20 text-center border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                  />
                  <p className="text-center text-gray-500 text-sm mt-2">กิโลกรัม</p>
                </div>
              </div>
            )}
            
            {(goalsData.fitness_goal_type === "ลดน้ำหนัก" || goalsData.fitness_goal_type === "รักษาหุ่น") && (
              <div className="max-w-sm mx-auto">
                <Input
                  type="number"
                  placeholder="-"
                  value={goalsData.fitness_goal_targetweight}
                  onChange={(e) => setGoalsData({ ...goalsData, fitness_goal_targetweight: e.target.value })}
                  className="text-3xl font-bold h-20 text-center border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                />
                <p className="text-center text-gray-500 text-sm mt-2">กิโลกรัม</p>
              </div>
            )}
          </div>
        );

      case "timeline":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3 text-gray-800">ช่วงเวลา</h1>
              <p className="text-gray-600 text-base">คุณต้องการบรรลุเป้าหมายภายในเวลาเท่าไหร่</p>
            </div>

            <div className="space-y-3">
              {DESIRED_TIMELINE.map((timeframe) => (
                <button
                  key={timeframe.value}
                  onClick={() => setGoalsData({ ...goalsData, fitness_desired_time: timeframe.value })}
                  className={`w-full p-6 text-left border-2 rounded-xl transition-all ${
                    goalsData.fitness_desired_time === timeframe.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{timeframe.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{timeframe.description}</div>
                    </div>
                    <div
                      className={`w-6 h-6 border-2 rounded ${
                        goalsData.fitness_desired_time === timeframe.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {goalsData.fitness_desired_time === timeframe.value && (
                        <div className="w-2 h-2 bg-white rounded-full m-1"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "น้ำหนัก-ส่วนสูง":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3 text-gray-800">น้ำหนักและส่วนสูงปัจจุบัน</h1>
              <p className="text-gray-600 text-base">กรอกข้อมูลร่างกายปัจจุบันของคุณ</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-base font-medium text-gray-700 mb-3 block">น้ำหนัก</label>
                <div className="max-w-sm mx-auto">
                  <Input
                    type="number"
                    placeholder="-"
                    value={personalData.member_health_weight}
                    onChange={(e) => setPersonalData({
                      ...personalData,
                      member_health_weight: e.target.value,
                    })}
                    className="text-3xl font-bold h-20 text-center border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                  />
                  <p className="text-center text-gray-500 text-sm mt-2">กิโลกรัม</p>
                </div>
              </div>

              <div>
                <label className="text-base font-medium text-gray-700 mb-3 block">ส่วนสูง</label>
                <div className="max-w-sm mx-auto">
                  <Input
                    type="number"
                    placeholder="-"
                    value={personalData.member_health_height}
                    onChange={(e) => setPersonalData({
                      ...personalData,
                      member_health_height: e.target.value,
                    })}
                    className="text-3xl font-bold h-20 text-center border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                  />
                  <p className="text-center text-gray-500 text-sm mt-2">เซนติเมตร</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "body-fat":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3 text-gray-800">เปอร์เซ็นต์ไขมัน</h1>
              <p className="text-gray-600 text-base">เลือกช่วงที่ใกล้เคียงกับตัวคุณมากที่สุด</p>
            </div>

            <div className="space-y-3">
              {BODY_FAT_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setPersonalData({
                    ...personalData,
                    member_health_bodyfat: range.value,
                  })}
                  className={`w-full p-6 text-left border-2 rounded-xl transition-all ${
                    personalData.member_health_bodyfat === range.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{range.label}</div>
                    </div>
                    <div
                      className={`w-6 h-6 border-2 rounded ${
                        personalData.member_health_bodyfat === range.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {personalData.member_health_bodyfat === range.value && (
                        <div className="w-2 h-2 bg-white rounded-full m-1"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "experience-level":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3 text-gray-800">ประสบการณ์การออกกำลังกาย</h1>
              <p className="text-gray-600 text-base">คุณมีประสบการณ์การออกกำลังกายมานานแค่ไหน</p>
            </div>

            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setLifestyleData({
                    ...lifestyleData,
                    fitness_experience_level: level.value,
                  })}
                  className={`w-full p-6 text-left border-2 rounded-xl transition-all ${
                    lifestyleData.fitness_experience_level === level.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{level.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{level.description}</div>
                    </div>
                    <div
                      className={`w-6 h-6 border-2 rounded ${
                        lifestyleData.fitness_experience_level === level.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {lifestyleData.fitness_experience_level === level.value && (
                        <div className="w-2 h-2 bg-white rounded-full m-1"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "training-frequency":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3 text-gray-800">ความถี่การออกกำลังกาย</h1>
              <p className="text-gray-600 text-base">คุณออกกำลังกายกี่วันต่อสัปดาห์</p>
            </div>

            <div className="space-y-3">
              {TRAINING_FREQUENCIES.map((freq) => (
                <button
                  key={freq.value}
                  onClick={() => setLifestyleData({
                    ...lifestyleData,
                    fitness_training_frequency: freq.value,
                  })}
                  className={`w-full p-6 text-left border-2 rounded-xl transition-all ${
                    lifestyleData.fitness_training_frequency === freq.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{freq.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{freq.description}</div>
                    </div>
                    <div
                      className={`w-6 h-6 border-2 rounded ${
                        lifestyleData.fitness_training_frequency === freq.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {lifestyleData.fitness_training_frequency === freq.value && (
                        <div className="w-2 h-2 bg-white rounded-full m-1"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "activity-level":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3 text-gray-800">ระดับกิจกรรมประจำวัน</h1>
              <p className="text-gray-600 text-base">นอกจากการออกกำลังกาย คุณเคลื่อนไหวมากแค่ไหน</p>
            </div>

            <div className="space-y-3">
              {ACTIVITY_LEVELS.map((activity) => (
                <button
                  key={activity.value}
                  onClick={() => setLifestyleData({
                    ...lifestyleData,
                    member_activity_level: activity.value,
                  })}
                  className={`w-full p-6 text-left border-2 rounded-xl transition-all ${
                    lifestyleData.member_activity_level === activity.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{activity.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{activity.description}</div>
                    </div>
                    <div
                      className={`w-6 h-6 border-2 rounded ${
                        lifestyleData.member_activity_level === activity.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {lifestyleData.member_activity_level === activity.value && (
                        <div className="w-2 h-2 bg-white rounded-full m-1"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "training-time":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3 text-gray-800">เวลาออกกำลังกาย</h1>
              <p className="text-gray-600 text-base">คุณมักออกกำลังกายช่วงเวลาไหน</p>
            </div>

            <div className="space-y-3">
              {TRAINING_TIMES.map((time) => (
                <button
                  key={time.value}
                  onClick={() => setLifestyleData({
                    ...lifestyleData,
                    fitness_training_time: time.value,
                  })}
                  className={`w-full p-6 text-left border-2 rounded-xl transition-all ${
                    lifestyleData.fitness_training_time === time.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{time.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{time.description}</div>
                    </div>
                    <div
                      className={`w-6 h-6 border-2 rounded ${
                        lifestyleData.fitness_training_time === time.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {lifestyleData.fitness_training_time === time.value && (
                        <div className="w-2 h-2 bg-white rounded-full m-1"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "summary":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3 text-gray-800">สรุปข้อมูลของคุณ</h1>
              <p className="text-gray-600 text-base">ตรวจสอบข้อมูลก่อนสร้างแผนโภชนาการ</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* ข้อมูลส่วนตัว */}
              <div className="p-6 border-2 border-gray-200 rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  ข้อมูลส่วนตัว
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>น้ำหนัก:</span>
                    <span>{personalData.member_health_weight} กก.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ส่วนสูง:</span>
                    <span>{personalData.member_health_height} ซม.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>เปอร์เซ็นต์ไขมัน:</span>
                    <span>{personalData.member_health_bodyfat}%</span>
                  </div>
                </div>
              </div>

              {/* ไลฟ์สไตล์ */}
              <div className="p-6 border-2 border-gray-200 rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  ไลฟ์สไตล์
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>ประสบการณ์:</span>
                    <span>
                      {
                        EXPERIENCE_LEVELS.find(
                          (e) => e.value === lifestyleData.fitness_experience_level
                        )?.label
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ความถี่:</span>
                    <span>
                      {
                        TRAINING_FREQUENCIES.find(
                          (f) => f.value === lifestyleData.fitness_training_frequency
                        )?.label
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ระดับกิจกรรม:</span>
                    <span>
                      {
                        ACTIVITY_LEVELS.find(
                          (a) => a.value === lifestyleData.member_activity_level
                        )?.label
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>เวลาออกกำลังกาย:</span>
                    <span>
                      {
                        TRAINING_TIMES.find(
                          (t) => t.value === lifestyleData.fitness_training_time
                        )?.label
                      }
                    </span>
                  </div>
                  {calculatedTDEE && (
                    <div className="flex justify-between font-medium">
                      <span>TDEE:</span>
                      <span>{calculatedTDEE.tdee} แคล/วัน</span>
                    </div>
                  )}
                </div>
              </div>

              {/* เป้าหมาย */}
              <div className="p-6 border-2 border-gray-200 rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  เป้าหมาย
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>เป้าหมาย:</span>
                    <span>{goalsData.fitness_goal_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>น้ำหนักเป้าหมาย:</span>
                    <span>{goalsData.fitness_goal_targetweight} กก.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>กรอบเวลา:</span>
                    <span>
                      {
                        DESIRED_TIMELINE.find(
                          (t) => t.value === goalsData.fitness_desired_time
                        )?.label
                      }
                    </span>
                  </div>
                  {goalsData.muscle_goal_type && (
                    <div className="flex justify-between">
                      <span>แนวทาง:</span>
                      <span>
                        {goalsData.muscle_goal_type === "increase_weight" 
                          ? "เพิ่มน้ำหนัก" 
                          : "Body Recomposition"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Macro Suggestion Result */}
            {macroSuggestion && (
              <div className="p-6 bg-green-50 border-green-200 border-2 rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center text-green-800">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  แผนโภชนาการเบื้องต้น
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-2">แคลอรี่ที่แนะนำ:</p>
                    <p className="text-lg font-bold text-green-700">
                      {macroSuggestion.adjusted_calories} แคล/วัน
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">สัดส่วนแมโคร:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>โปรตีน:</span>
                        <span>
                          {macroSuggestion.suggested.macro_grams.protein}g (
                          {macroSuggestion.suggested.protein_ratio}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>คาร์โบไฮเดรต:</span>
                        <span>
                          {macroSuggestion.suggested.macro_grams.carb}g (
                          {macroSuggestion.suggested.carb_ratio}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>ไขมัน:</span>
                        <span>
                          {macroSuggestion.suggested.macro_grams.fat}g (
                          {macroSuggestion.suggested.fat_ratio}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
                  <p className="font-medium">หมายเหตุ:</p>
                  <p>
                    นี่เป็นแผนเบื้องต้น
                    เทรนเนอร์ของคุณจะปรับแต่งให้เหมาะสมกับความต้องการเฉพาะของคุณ
                  </p>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {loading && !macroSuggestion && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">กำลังสร้างแผนโภชนาการของคุณ...</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                {getCurrentSubStep()}
              </h2>
              <p className="text-gray-600">
                Step content will be defined here
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-[100vh] flex flex-col bg-white overflow-hidden">
      {/* Top Status Bar Spacer for mobile */}
      <div className="h-[env(safe-area-inset-top)] bg-white" />
      
      {/* Progress Bar */}
      <div className="px-6 py-4 bg-white">
        <div className="mb-4">
          <Progress value={progressPercentage} className="h-2 bg-gray-200 [&>div]:bg-green-500" />
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {renderSubStepContent()}
        
      </div>
      
      {/* Fixed Bottom Navigation */}
      <div className="bg-white border-t border-gray-100 px-6 py-4">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 && currentSubStepIndex === 0}
            className="p-3 rounded-full"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Button>

          {currentStepIndex === STEPS.length - 1 &&
          currentSubStepIndex === getCurrentStep().subSteps.length - 1 ? (
            <Button
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 ml-4 h-14 bg-green-500 hover:bg-green-600 text-white text-lg font-medium rounded-full disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  กำลังสร้างแผน...
                </>
              ) : (
                "สร้างแผนโภชนาการ"
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={loading}
              className="flex-1 ml-4 h-14 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-full disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "ถัดไป"
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Bottom Safe Area */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </div>
  );
}