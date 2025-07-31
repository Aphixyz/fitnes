"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Target,
  ArrowLeft,
} from "lucide-react";
import { saveFitnessGoals } from "@/actions/member/onboarding/onboarding";
import { getMemberById } from "@/actions/member/getMemberData";

// กำหนด Steps สำหรับ Goal Setting
const GOAL_STEPS = [
  {
    id: "goal-type",
    title: "เลือกเป้าหมาย",
    icon: Target,
  },
  {
    id: "target-weight",
    title: "น้ำหนักเป้าหมาย",
    icon: Target,
  },
  {
    id: "timeline",
    title: "กรอบเวลา",
    icon: Target,
  },
];

// Goal Types
const GOAL_TYPES = [
  {
    value: "ลดน้ำหนัก",
    label: "ลดน้ำหนัก",
    description: "ลดไขมันและน้ำหนักตัว",
    icon: "📉",
  },
  {
    value: "เพิ่มกล้ามเนื้อ",
    label: "เพิ่มกล้ามเนื้อ",
    description: "เพิ่มมวลกล้ามเนื้อและความแข็งแรง",
    icon: "💪",
  },
  {
    value: "รักษาหุ่น",
    label: "รักษาหุ่น",
    description: "รักษาน้ำหนักและรูปร่างปัจจุบัน",
    icon: "⚖️",
  },
];

// Desired Timeline
const DESIRED_TIMELINE = [
  {
    value: 0,
    label: "4 สัปดาห์",
    description: "เป้าหมายระยะสั้น",
  },
  {
    value: 1,
    label: "8 สัปดาห์",
    description: "เป้าหมายระยะกลาง",
  },
  {
    value: 2,
    label: "12 สัปดาห์",
    description: "เป้าหมายระยะยาว",
  },
  {
    value: 3,
    label: "16 สัปดาห์",
    description: "เป้าหมายระยะยาวมาก",
  },
];

// CardSelector Component
const CardSelector = ({ options, value, onChange, className = "", name }) => (
  <div className={`grid gap-3 ${className}`}>
    {options.map((option) => (
      <Card
        key={option.value}
        className={`p-4 cursor-pointer transition-all duration-200 ${
          value === option.value
            ? "border-blue-600 border-2 bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => onChange(option.value)}
      >
        <div className="flex items-start space-x-3">
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center mt-1">
            {value === option.value && (
              <div className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {option.icon && <span className="text-xl">{option.icon}</span>}
              <h3 className="font-semibold">{option.label}</h3>
            </div>
            {option.description && (
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
            )}
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export default function NewGoalWizard({ memberId }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [errors, setErrors] = useState({});

  // ข้อมูลเป้าหมาย
  const [goalData, setGoalData] = useState({
    fitness_goal_type: "",
    fitness_goal_targetweight: "",
    fitness_desired_time: null,
  });

  // โหลดข้อมูล member เพื่อดึงน้ำหนักปัจจุบัน
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const result = await getMemberById(memberId);
        if (result.success) {
          setMemberData(result.data);
        }
      } catch (error) {
        console.error("Error fetching member data:", error);
      }
    };

    if (memberId) {
      fetchMemberData();
    }
  }, [memberId]);

  // คำนวณ progress
  const progress = ((currentStep + 1) / GOAL_STEPS.length) * 100;

  // ตรวจสอบ validation ของแต่ละ step
  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 0: // goal-type
        if (!goalData.fitness_goal_type) {
          newErrors.goalType = "กรุณาเลือกเป้าหมาย";
        }
        break;
      case 1: // target-weight
        if (!goalData.fitness_goal_targetweight) {
          newErrors.targetWeight = "กรุณากรอกน้ำหนักเป้าหมาย";
        } else {
          const targetWeight = parseFloat(goalData.fitness_goal_targetweight);
          const currentWeight =
            parseFloat(memberData?.member_health_weight) || 0;

          if (isNaN(targetWeight) || targetWeight <= 0) {
            newErrors.targetWeight =
              "น้ำหนักเป้าหมายต้องเป็นตัวเลขที่มากกว่า 0";
          } else if (
            goalData.fitness_goal_type === "ลดน้ำหนัก" &&
            targetWeight >= currentWeight
          ) {
            newErrors.targetWeight =
              "น้ำหนักเป้าหมายควรน้อยกว่าน้ำหนักปัจจุบัน";
          } else if (
            goalData.fitness_goal_type === "เพิ่มกล้ามเนื้อ" &&
            targetWeight <= currentWeight
          ) {
            newErrors.targetWeight = "น้ำหนักเป้าหมายควรมากกว่าน้ำหนักปัจจุบัน";
          }
        }
        break;
      case 2: // timeline
        if (goalData.fitness_desired_time === null) {
          newErrors.timeline = "กรุณาเลือกกรอบเวลา";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ไป step ถัดไป
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < GOAL_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleFinish();
      }
    }
  };

  // กลับไป step ก่อนหน้า
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // กลับไปหน้าเป้าหมาย
  const handleBack = () => {
    router.push(`/member/${memberId}/profile/goal`);
  };

  // บันทึกเป้าหมาย
  const handleFinish = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      const result = await saveFitnessGoals(memberId, goalData);

      if (result.success) {
        // Redirect กลับไปหน้าเป้าหมาย
        router.push(`/member/${memberId}/profile/goal`);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      setErrors({ general: "เกิดข้อผิดพลาดในการบันทึกเป้าหมาย" });
    } finally {
      setLoading(false);
    }
  };

  // แสดงเนื้อหาของแต่ละ step
  const renderStepContent = () => {
    const currentStepData = GOAL_STEPS[currentStep];
    const currentWeight = parseFloat(memberData?.member_health_weight) || 0;

    switch (currentStepData.id) {
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
                value={goalData.fitness_goal_type}
                onChange={(value) => {
                  let targetWeight = "";

                  // Auto-fill น้ำหนักเป้าหมายตามประเภทเป้าหมาย
                  if (value === "ลดน้ำหนัก") {
                    targetWeight = Math.max(currentWeight - 5, 0).toString();
                  } else if (value === "รักษาหุ่น") {
                    targetWeight = currentWeight.toString();
                  } else if (value === "เพิ่มกล้ามเนื้อ") {
                    targetWeight = (currentWeight + 3).toString();
                  }

                  setGoalData({
                    ...goalData,
                    fitness_goal_type: value,
                    fitness_goal_targetweight: targetWeight,
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
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">น้ำหนักเป้าหมาย</h2>
              <p className="text-gray-600">
                {goalData.fitness_goal_type === "รักษาหุ่น"
                  ? "กำหนดน้ำหนักที่ต้องการรักษา (±3-4 กก.)"
                  : `กำหนดน้ำหนักเป้าหมายสำหรับ${goalData.fitness_goal_type}`}
              </p>
              <div className="mt-2 text-sm text-gray-500">
                น้ำหนักปัจจุบัน: {memberData?.member_health_weight || 0} กก.
              </div>
            </div>

            <div className="max-w-xs mx-auto space-y-2">
              <Label htmlFor="targetWeight">น้ำหนักเป้าหมาย (กก.) *</Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                min="0"
                value={goalData.fitness_goal_targetweight}
                onChange={(e) =>
                  setGoalData({
                    ...goalData,
                    fitness_goal_targetweight: e.target.value,
                  })
                }
                className={errors.targetWeight ? "border-red-500" : ""}
                placeholder={
                  goalData.fitness_goal_type === "ลดน้ำหนัก"
                    ? `น้อยกว่า ${currentWeight} กก.`
                    : goalData.fitness_goal_type === "รักษาหุ่น"
                    ? `${Math.max(currentWeight - 4, 0)}-${
                        currentWeight + 4
                      } กก.`
                    : "เช่น 60.0"
                }
              />
              {errors.targetWeight && (
                <p className="text-red-500 text-sm">{errors.targetWeight}</p>
              )}

              {/* แสดงช่วงแนะนำ */}
              {goalData.fitness_goal_type === "ลดน้ำหนัก" && (
                <div className="mt-2 p-3 bg-green-50 rounded text-sm text-green-700">
                  <p className="font-medium">แนะนำ:</p>
                  <p>ลดน้ำหนัก 0.5-1 กก./สัปดาห์ เพื่อสุขภาพที่ดี</p>
                </div>
              )}

              {goalData.fitness_goal_type === "รักษาหุ่น" && (
                <div className="mt-2 p-3 bg-yellow-50 rounded text-sm text-yellow-700">
                  <p className="font-medium">แนะนำ:</p>
                  <p>
                    ช่วงน้ำหนัก: {Math.max(currentWeight - 4, 0).toFixed(1)} -{" "}
                    {(currentWeight + 4).toFixed(1)} กก.
                  </p>
                </div>
              )}

              {goalData.fitness_goal_type === "เพิ่มกล้ามเนื้อ" && (
                <div className="mt-2 p-3 bg-blue-50 rounded text-sm text-blue-700">
                  <p className="font-medium">แนะนำ:</p>
                  <p>เพิ่มน้ำหนัก 0.5-1 กก./สัปดาห์ เพื่อเพิ่มกล้ามเนื้อ</p>
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
                value={goalData.fitness_desired_time}
                onChange={(value) =>
                  setGoalData({
                    ...goalData,
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={loading}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">กำหนดเป้าหมายใหม่</h1>
                <p className="text-sm text-gray-600">
                  ขั้นตอน {currentStep + 1} จาก {GOAL_STEPS.length}
                </p>
              </div>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">ความคืบหน้า</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {GOAL_STEPS[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {currentStep === 0 && "เลือกเป้าหมายหลักที่คุณต้องการบรรลุ"}
              {currentStep === 1 && "กำหนดน้ำหนักเป้าหมายที่เหมาะสม"}
              {currentStep === 2 && "เลือกกรอบเวลาที่เหมาะสมกับคุณ"}
            </p>
          </div>

          {/* Content */}
          <Card className="p-8">
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {errors.general}
              </div>
            )}

            {renderStepContent()}
          </Card>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              ก่อนหน้า
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < GOAL_STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={loading}>
                  ถัดไป
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      บันทึกเป้าหมาย
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
