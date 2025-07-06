"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Target,
  Activity,
  Users,
  User,
  Dumbbell,
} from "lucide-react";
import {
  savePersonalProfile,
  saveLifestyleProfile,
  saveFitnessGoals,
} from "@/actions/member/onboarding/onboarding";
import { suggestMacroPlan } from "@/actions/macro-engine/suggestMacroPlan";
import {
  calcAge,
  calcBMR,
  calcTDEE,
  translateExperienceLevel,
} from "@/utils/macro-utils";
import { getMemberById } from "@/actions/member/getMemberData";

// กำหนด Steps และ Sub-steps ใหม่
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

export default function OnboardingWizard({ memberId, onboardingStatus }) {
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
    member_health_bodyfat: 15, // default to middle range
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
    muscle_goal_type: "", // สำหรับเพิ่มกล้ามเนื้อ: "increase_weight" หรือ "body_recomposition"
  });

  const [calculatedTDEE, setCalculatedTDEE] = useState(null);
  const [macroSuggestion, setMacroSuggestion] = useState(null);

  // คำนวณ Progress
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

  const handleNext = async () => {
    const currentStep = getCurrentStep();
    const currentSubStep = getCurrentSubStep();

    // Validation
    if (!validateCurrentSubStep()) {
      return;
    }

    // ถ้าเป็น sub-step สุดท้ายของ step หลัก ให้บันทึกข้อมูล
    if (currentSubStepIndex === currentStep.subSteps.length - 1) {
      if (currentStep.id === "personal") {
        setLoading(true);
        const result = await savePersonalProfile(memberId, personalData);
        setLoading(false);

        if (!result.success) {
          setErrors({ submit: result.message });
          return;
        }
      } else if (currentStep.id === "lifestyle") {
        setLoading(true);
        const result = await saveLifestyleProfile(memberId, lifestyleData);
        setLoading(false);

        if (!result.success) {
          setErrors({ submit: result.message });
          return;
        }
      } else if (currentStep.id === "goals") {
        setLoading(true);
        const result = await saveFitnessGoals(memberId, goalsData);
        setLoading(false);

        if (!result.success) {
          setErrors({ submit: result.message });
          return;
        }
      }
    }

    // เลื่อนไป sub-step ถัดไป
    if (currentSubStepIndex < currentStep.subSteps.length - 1) {
      setCurrentSubStepIndex(currentSubStepIndex + 1);
    } else if (currentStepIndex < STEPS.length - 1) {
      // เลื่อนไป step ถัดไป
      setCurrentStepIndex(currentStepIndex + 1);
      setCurrentSubStepIndex(0);
    }

    setErrors({});
  };

  const handlePrevious = () => {
    if (currentSubStepIndex > 0) {
      setCurrentSubStepIndex(currentSubStepIndex - 1);
    } else if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setCurrentSubStepIndex(STEPS[currentStepIndex - 1].subSteps.length - 1);
    }
    setErrors({});
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
        }, 7000);
      } else {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      setErrors({ submit: "เกิดข้อผิดพลาดในการสร้าง Macro Plan" });
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentSubStep = () => {
    const currentSubStep = getCurrentSubStep();
    const newErrors = {};

    switch (currentSubStep) {
      case "weight-height":
        if (!personalData.member_health_weight)
          newErrors.weight = "กรุณากรอกน้ำหนัก";
        if (!personalData.member_health_height)
          newErrors.height = "กรุณากรอกส่วนสูง";
        break;
      case "body-fat":
        // Body fat is optional, no validation needed
        break;
      case "experience-level":
        if (!lifestyleData.fitness_experience_level)
          newErrors.experience = "กรุณาเลือกระดับประสบการณ์";
        break;
      case "training-frequency":
        if (lifestyleData.fitness_training_frequency === null)
          newErrors.frequency = "กรุณาเลือกความถี่การออกกำลังกาย";
        break;
      case "activity-level":
        if (lifestyleData.member_activity_level === null)
          newErrors.activity = "กรุณาเลือกระดับกิจกรรม";
        break;
      case "training-time":
        if (!lifestyleData.fitness_training_time)
          newErrors.trainingTime = "กรุณาเลือกเวลาออกกำลังกาย";
        break;
      case "goal-type":
        if (!goalsData.fitness_goal_type)
          newErrors.goalType = "กรุณาเลือกเป้าหมาย";
        break;
      case "target-weight":
        if (
          goalsData.fitness_goal_type !== "รักษาหุ่น" &&
          !goalsData.fitness_goal_targetweight
        ) {
          newErrors.targetWeight = "กรุณาระบุน้ำหนักเป้าหมาย";
        }
        break;
      case "timeline":
        if (goalsData.fitness_desired_time === null)
          newErrors.timeline = "กรุณาเลือกกรอบเวลา";
        break;
      case "summary":
        // No validation needed for summary
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function for body fat range selection
  const getBodyFatRangeLabel = (value) => {
    const range = BODY_FAT_RANGES.find((r) => value >= r.min && value <= r.max);
    return range ? range.label : `${value}%`;
  };

  const getTargetWeightValidation = () => {
    if (!personalData.member_health_weight || !goalsData.fitness_goal_type)
      return {};

    const currentWeight = parseFloat(personalData.member_health_weight);
    const targetWeight = parseFloat(goalsData.fitness_goal_targetweight);

    if (!targetWeight) return {};

    switch (goalsData.fitness_goal_type) {
      case "ลดน้ำหนัก":
        if (targetWeight >= currentWeight) {
          return { error: "น้ำหนักเป้าหมายต้องน้อยกว่าน้ำหนักปัจจุบัน" };
        }
        break;
      case "เพิ่มกล้ามเนื้อ":
        if (goalsData.muscle_goal_type === "increase_weight") {
          if (targetWeight <= currentWeight) {
            return { error: "น้ำหนักเป้าหมายต้องมากกว่าน้ำหนักปัจจุบัน" };
          }
        } else if (goalsData.muscle_goal_type === "body_recomposition") {
          const diff = Math.abs(targetWeight - currentWeight);
          if (diff > 2) {
            return {
              error: "สำหรับ Body Recomposition ควรคงน้ำหนักเดิม (±2 กก.)",
            };
          }
        } else {
          return { error: "กรุณาเลือกแนวทางเพิ่มกล้ามเนื้อ" };
        }
        break;
      case "รักษาหุ่น":
        const diff = Math.abs(targetWeight - currentWeight);
        if (diff > 4) {
          return {
            error: "น้ำหนักเป้าหมายควรอยู่ในช่วง ±4 กก. จากน้ำหนักปัจจุบัน",
          };
        }
        break;
    }

    return { success: true };
  };

  // Card Selector Component
  const CardSelector = ({ options, value, onChange, className = "", name }) => (
    <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
      {options.map((option) => (
        <label
          key={option.value}
          htmlFor={`${name}-${option.value}`}
          className="cursor-pointer"
        >
          <Card
            className={`p-4 transition-all duration-200 hover:shadow-md ${
              value === option.value
                ? "border-blue-600 border-2 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            } ${className}`}
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem
                value={option.value.toString()}
                id={`${name}-${option.value}`}
                className="mt-1"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{option.label}</h3>
                <p className="text-gray-600 text-sm">{option.description}</p>
              </div>
            </div>
          </Card>
        </label>
      ))}
    </RadioGroup>
  );

  const renderSubStepContent = () => {
    const currentSubStep = getCurrentSubStep();

    switch (currentSubStep) {
      case "weight-height":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                น้ำหนักและส่วนสูงของคุณ
              </h2>
              <p className="text-gray-600">
                ข้อมูลเหล่านี้จะใช้คำนวณความต้องการแคลอรี่ของคุณ
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="weight">น้ำหนัก (กก.) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={personalData.member_health_weight}
                  onChange={(e) =>
                    setPersonalData({
                      ...personalData,
                      member_health_weight: e.target.value,
                    })
                  }
                  className={errors.weight ? "border-red-500" : ""}
                  placeholder="เช่น 65.5"
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm">{errors.weight}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">ส่วนสูง (ซม.) *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  min="0"
                  value={personalData.member_health_height}
                  onChange={(e) =>
                    setPersonalData({
                      ...personalData,
                      member_health_height: e.target.value,
                    })
                  }
                  className={errors.height ? "border-red-500" : ""}
                  placeholder="เช่น 170"
                />
                {errors.height && (
                  <p className="text-red-500 text-sm">{errors.height}</p>
                )}
              </div>
            </div>
          </div>
        );

      case "body-fat":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                เปอร์เซ็นต์ไขมันของคุณ
              </h2>
              <p className="text-gray-600">
                เลื่อนเพื่อเลือกเปอร์เซ็นต์ไขมันของคุณ
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {personalData.member_health_bodyfat}%
                </div>
                <p className="text-gray-500 text-sm">เปอร์เซ็นต์ไขมัน</p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="bodyfat-slider">
                  เลื่อนเพื่อปรับเปอร์เซ็นต์ไขมัน
                </Label>
                <Slider
                  id="bodyfat-slider"
                  min={4}
                  max={50}
                  step={0.5}
                  value={[personalData.member_health_bodyfat]}
                  onValueChange={(value) =>
                    setPersonalData({
                      ...personalData,
                      member_health_bodyfat: value[0],
                    })
                  }
                  className="w-full"
                />

                {/* แสดงช่วงค่า */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>4%</span>
                  <span>15%</span>
                  <span>25%</span>
                  <span>35%</span>
                  <span>50%</span>
                </div>

                {/* แสดงคำแนะนำตามช่วง */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <p className="font-medium">หมายเหตุ:</p>
                  {personalData.member_health_bodyfat <= 10 && (
                    <p>ช่วงไขมันต่ำมาก - เหมาะสำหรับนักกีฬา</p>
                  )}
                  {personalData.member_health_bodyfat > 10 &&
                    personalData.member_health_bodyfat <= 20 && (
                      <p>ช่วงไขมันปกติ - สุขภาพดี</p>
                    )}
                  {personalData.member_health_bodyfat > 20 &&
                    personalData.member_health_bodyfat <= 30 && (
                      <p>ช่วงไขมันปานกลาง - ควรออกกำลังกาย</p>
                    )}
                  {personalData.member_health_bodyfat > 30 && (
                    <p>ช่วงไขมันสูง - ควรปรึกษาแพทย์</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "experience-level":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                คุณจัดอยู่ในระดับใดสำหรับการออกกำลังกาย
              </h2>
              <p className="text-gray-600">
                เลือกระดับที่ตรงกับประสบการณ์ของคุณ
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <CardSelector
                options={EXPERIENCE_LEVELS}
                value={lifestyleData.fitness_experience_level}
                onChange={(value) =>
                  setLifestyleData({
                    ...lifestyleData,
                    fitness_experience_level: value,
                  })
                }
                name="experience"
              />
              {errors.experience && (
                <p className="text-red-500 text-sm text-center mt-3">
                  {errors.experience}
                </p>
              )}
            </div>
          </div>
        );

      case "training-frequency":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                คุณออกกำลังกายกี่วันต่อสัปดาห์
              </h2>
              <p className="text-gray-600">เลือกความถี่ที่เหมาะสมกับคุณ</p>
            </div>

            <div className="max-w-lg mx-auto">
              <CardSelector
                options={TRAINING_FREQUENCIES}
                value={lifestyleData.fitness_training_frequency}
                onChange={(value) =>
                  setLifestyleData({
                    ...lifestyleData,
                    fitness_training_frequency: parseInt(value),
                  })
                }
                name="frequency"
              />
              {errors.frequency && (
                <p className="text-red-500 text-sm text-center mt-3">
                  {errors.frequency}
                </p>
              )}
            </div>
          </div>
        );

      case "activity-level":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                ภาพรวมกิจกรรมในชีวิตประจำวันของคุณเป็นแบบไหน?
              </h2>
              <p className="text-gray-600">
                เลือกระดับที่ตรงกับกิจกรรมประจำวันของคุณ
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <CardSelector
                options={ACTIVITY_LEVELS}
                value={lifestyleData.member_activity_level}
                onChange={(value) =>
                  setLifestyleData({
                    ...lifestyleData,
                    member_activity_level: parseInt(value),
                  })
                }
                name="activity"
              />
              {errors.activity && (
                <p className="text-red-500 text-sm text-center mt-3">
                  {errors.activity}
                </p>
              )}
            </div>
          </div>
        );

      case "training-time":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                คุณสะดวกออกกำลังกายในช่วงเวลาใด?
              </h2>
              <p className="text-gray-600">เลือกช่วงเวลาที่คุณสะดวกที่สุด</p>
              {calculatedTDEE && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    แคลอรี่ที่แนะนำต่อวัน:{" "}
                    <span className="text-xl">{calculatedTDEE.tdee}</span> แคล
                  </p>
                  <p className="text-blue-600 text-sm">
                    (BMR: {calculatedTDEE.bmr} แคล, อายุ: {calculatedTDEE.age}{" "}
                    ปี)
                  </p>
                </div>
              )}
            </div>

            <div className="max-w-lg mx-auto">
              <CardSelector
                options={TRAINING_TIMES}
                value={lifestyleData.fitness_training_time}
                onChange={(value) =>
                  setLifestyleData({
                    ...lifestyleData,
                    fitness_training_time: value,
                  })
                }
                name="training-time"
              />
              {errors.trainingTime && (
                <p className="text-red-500 text-sm text-center mt-3">
                  {errors.trainingTime}
                </p>
              )}
            </div>
          </div>
        );

      case "goal-type":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                เป้าหมายของคุณคืออะไร?
              </h2>
              <p className="text-gray-600">
                เลือกเป้าหมายหลักที่คุณต้องการบรรลุ
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <CardSelector
                options={GOAL_TYPES}
                value={goalsData.fitness_goal_type}
                onChange={(value) => {
                  const currentWeight =
                    parseFloat(personalData.member_health_weight) || 0;
                  let targetWeight = "";

                  // Auto-fill น้ำหนักเป้าหมายตามประเภทเป้าหมาย
                  if (value === "ลดน้ำหนัก") {
                    targetWeight = Math.max(currentWeight - 5, 0).toString();
                  } else if (value === "รักษาหุ่น") {
                    targetWeight = currentWeight.toString();
                  }
                  // สำหรับเพิ่มกล้ามเนื้อจะ auto-fill ใน muscle_goal_type selection

                  setGoalsData({
                    ...goalsData,
                    fitness_goal_type: value,
                    fitness_goal_targetweight: targetWeight,
                    muscle_goal_type: "", // reset muscle goal type
                  });
                }}
                name="goal-type"
              />
              {errors.goalType && (
                <p className="text-red-500 text-sm text-center mt-3">
                  {errors.goalType}
                </p>
              )}
            </div>
          </div>
        );

      case "target-weight":
        const weightValidation = getTargetWeightValidation();
        const currentWeight =
          parseFloat(personalData.member_health_weight) || 0;

        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">น้ำหนักเป้าหมาย</h2>
              <p className="text-gray-600">
                {goalsData.fitness_goal_type === "รักษาหุ่น"
                  ? "กำหนดน้ำหนักที่ต้องการรักษา (±3-4 กก.)"
                  : `กำหนดน้ำหนักเป้าหมายสำหรับ${goalsData.fitness_goal_type}`}
              </p>
              <div className="mt-2 text-sm text-gray-500">
                น้ำหนักปัจจุบัน: {personalData.member_health_weight} กก.
              </div>
            </div>

            {/* แสดงตัวเลือกสำหรับเพิ่มกล้ามเนื้อ */}
            {goalsData.fitness_goal_type === "เพิ่มกล้ามเนื้อ" && (
              <div className="max-w-lg mx-auto mb-6">
                <Label className="text-base font-medium mb-4 block">
                  เลือกแนวทางเพิ่มกล้ามเนื้อ:
                </Label>
                <div className="space-y-3">
                  <Card
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      goalsData.muscle_goal_type === "increase_weight"
                        ? "border-blue-600 border-2 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setGoalsData({
                        ...goalsData,
                        muscle_goal_type: "increase_weight",
                        fitness_goal_targetweight: (
                          currentWeight + 3
                        ).toString(),
                      });
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center mt-1">
                        {goalsData.muscle_goal_type === "increase_weight" && (
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">เพิ่มน้ำหนัก</h3>
                        <p className="text-sm text-gray-600">
                          เพิ่มทั้งกล้ามเนื้อและน้ำหนัก (แนะนำ: +3-5 กก.)
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      goalsData.muscle_goal_type === "body_recomposition"
                        ? "border-blue-600 border-2 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setGoalsData({
                        ...goalsData,
                        muscle_goal_type: "body_recomposition",
                        fitness_goal_targetweight: currentWeight.toString(),
                      });
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center mt-1">
                        {goalsData.muscle_goal_type ===
                          "body_recomposition" && (
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          เพิ่มกล้ามเนื้อกับลดไขมัน
                        </h3>
                        <p className="text-sm text-gray-600">
                          คงน้ำหนักเดิม แต่เปลี่ยนสัดส่วนไขมัน/กล้ามเนื้อ
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            <div className="max-w-xs mx-auto space-y-2">
              <Label htmlFor="targetWeight">น้ำหนักเป้าหมาย (กก.) *</Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                min="0"
                value={goalsData.fitness_goal_targetweight}
                onChange={(e) =>
                  setGoalsData({
                    ...goalsData,
                    fitness_goal_targetweight: e.target.value,
                  })
                }
                className={
                  errors.targetWeight || weightValidation.error
                    ? "border-red-500"
                    : ""
                }
                placeholder={
                  goalsData.fitness_goal_type === "ลดน้ำหนัก"
                    ? `น้อยกว่า ${currentWeight} กก.`
                    : goalsData.fitness_goal_type === "รักษาหุ่น"
                    ? `${Math.max(currentWeight - 4, 0)}-${
                        currentWeight + 4
                      } กก.`
                    : "เช่น 60.0"
                }
              />
              {errors.targetWeight && (
                <p className="text-red-500 text-sm">{errors.targetWeight}</p>
              )}
              {weightValidation.error && (
                <p className="text-red-500 text-sm">{weightValidation.error}</p>
              )}

              {/* แสดงช่วงแนะนำ */}
              {goalsData.fitness_goal_type === "ลดน้ำหนัก" && (
                <div className="mt-2 p-3 bg-green-50 rounded text-sm text-green-700">
                  <p className="font-medium">แนะนำ:</p>
                  <p>ลดน้ำหนัก 0.5-1 กก./สัปดาห์ เพื่อสุขภาพที่ดี</p>
                </div>
              )}

              {goalsData.fitness_goal_type === "รักษาหุ่น" && (
                <div className="mt-2 p-3 bg-yellow-50 rounded text-sm text-yellow-700">
                  <p className="font-medium">แนะนำ:</p>
                  <p>
                    ช่วงน้ำหนัก: {Math.max(currentWeight - 4, 0).toFixed(1)} -{" "}
                    {(currentWeight + 4).toFixed(1)} กก.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "timeline":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                คุณต้องการบรรลุเป้าหมายภายในกี่สัปดาห์?
              </h2>
              <p className="text-gray-600">เลือกกรอบเวลาที่เหมาะสมกับคุณ</p>
            </div>

            <div className="max-w-lg mx-auto">
              <CardSelector
                options={DESIRED_TIMELINE}
                value={goalsData.fitness_desired_time}
                onChange={(value) =>
                  setGoalsData({
                    ...goalsData,
                    fitness_desired_time: parseInt(value),
                  })
                }
                name="timeline"
              />
              {errors.timeline && (
                <p className="text-red-500 text-sm text-center mt-3">
                  {errors.timeline}
                </p>
              )}
            </div>
          </div>
        );

      case "summary":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">สรุปข้อมูลของคุณ</h2>
              <p className="text-gray-600">ตรวจสอบข้อมูลก่อนสร้างแผนโภชนาการ</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* ข้อมูลส่วนตัว */}
              <Card className="p-6">
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
                    <span>
                      {getBodyFatRangeLabel(personalData.member_health_bodyfat)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* ไลฟ์สไตล์ */}
              <Card className="p-6">
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
                          (e) =>
                            e.value === lifestyleData.fitness_experience_level
                        )?.label
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ความถี่:</span>
                    <span>
                      {
                        TRAINING_FREQUENCIES.find(
                          (f) =>
                            f.value === lifestyleData.fitness_training_frequency
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
              </Card>

              {/* เป้าหมาย */}
              <Card className="p-6">
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
                </div>
              </Card>
            </div>

            {/* Macro Suggestion Result */}
            {macroSuggestion && (
              <Card className="p-6 bg-green-50 border-green-200">
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
              </Card>
            )}
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="p-6 border-b">
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              ขั้นตอน {currentSubStepGlobal + 1} จาก {totalSubSteps}
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          {STEPS.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="relative">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                      transition-all duration-200 border-2
                      ${
                        isActive ? "bg-blue-600 text-white border-blue-600" : ""
                      }
                      ${
                        isCompleted
                          ? "bg-green-500 text-white border-green-500"
                          : ""
                      }
                      ${
                        !isActive && !isCompleted
                          ? "bg-white text-gray-400 border-gray-300"
                          : ""
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>

                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span
                      className={`text-xs ${
                        isActive || isCompleted
                          ? "text-gray-700 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                </div>

                {index < STEPS.length - 1 && (
                  <div className="flex-1 mx-2">
                    <div
                      className={`h-1 rounded transition-all duration-300 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {renderSubStepContent()}

        {/* Error Alert */}
        {errors.submit && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 && currentSubStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            ย้อนกลับ
          </Button>

          {currentStepIndex === STEPS.length - 1 &&
          currentSubStepIndex === getCurrentStep().subSteps.length - 1 ? (
            <Button
              onClick={handleFinish}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังสร้างแผน...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  เสร็จสิ้น
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  ถัดไป
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
