"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Target,
  Save,
  RotateCcw,
  AlertTriangle,
  Flame,
  Calculator,
  Settings,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  updateRatioMacro,
  getCurrentMacroPlan,
} from "@/actions/trainer/macro/manual/updateRatioMacro";
import {
  updateGramsMacro,
  getCurrentMacroPlanAsGrams,
} from "@/actions/trainer/macro/manual/updateGramsMacro";

export default function EditMacroTargetsModal({
  isOpen,
  onClose,
  memberName,
  currentTargets,
  period = "daily",
  planId,
  trainerId,
  onSave,
}) {
  const [formData, setFormData] = useState({
    calories: 2000,
    proteinPercent: 25,
    carbPercent: 45,
    fatPercent: 30,
    proteinGrams: 0,
    carbGrams: 0,
    fatGrams: 0,
  });
  const [editMode, setEditMode] = useState("percentage"); // "percentage" หรือ "grams"
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // สร้าง percentage options (0%, 5%, 10%, ..., 100%)
  const percentageOptions = [];
  for (let i = 0; i <= 100; i += 5) {
    percentageOptions.push(i);
  }

  // โหลดข้อมูล macro plan ปัจจุบันเมื่อ modal เปิด
  useEffect(() => {
    if (isOpen && planId && trainerId) {
      loadCurrentMacroPlan();
    }
  }, [isOpen, planId, trainerId]);

  // ฟังก์ชันโหลดข้อมูล macro plan ปัจจุบัน
  const loadCurrentMacroPlan = async () => {
    try {
      setIsLoading(true);

      // ดึงข้อมูลแผนปัจจุบันแบบ ratios ก่อน
      const currentPlanResult = await getCurrentMacroPlan(planId, trainerId);

      if (currentPlanResult.success) {
        const plan = currentPlanResult.plan;
        const macros = plan.macros;

        // คำนวณ grams จาก ratios
        const calories = macros.calorie_target;
        const proteinGrams = Math.round(
          (calories * macros.protein_ratio) / 100 / 4
        );
        const carbGrams = Math.round((calories * macros.carb_ratio) / 100 / 4);
        const fatGrams = Math.round((calories * macros.fat_ratio) / 100 / 9);

        setFormData({
          calories: Math.round(calories),
          proteinPercent: Math.round(macros.protein_ratio),
          carbPercent: Math.round(macros.carb_ratio),
          fatPercent: Math.round(macros.fat_ratio),
          proteinGrams,
          carbGrams,
          fatGrams,
        });
        setErrors({});
      } else {
        // ถ้าไม่มีข้อมูล ใช้ค่า default
        if (currentTargets) {
          const calories = currentTargets.kcal || 2000;
          const protein = currentTargets.protein_g || 0;
          const carb = currentTargets.carb_g || 0;
          const fat = currentTargets.fat_g || 0;

          // คำนวณ percentage จาก grams
          const proteinPercent =
            calories > 0 ? Math.round(((protein * 4) / calories) * 100) : 25;
          const carbPercent =
            calories > 0 ? Math.round(((carb * 4) / calories) * 100) : 45;
          const fatPercent =
            calories > 0 ? Math.round(((fat * 9) / calories) * 100) : 30;

          setFormData({
            calories: Math.round(calories),
            proteinPercent: Math.min(100, Math.max(0, proteinPercent)),
            carbPercent: Math.min(100, Math.max(0, carbPercent)),
            fatPercent: Math.min(100, Math.max(0, fatPercent)),
            proteinGrams: Math.round(protein),
            carbGrams: Math.round(carb),
            fatGrams: Math.round(fat),
          });
          setErrors({});
        }
      }
    } catch (error) {
      console.error("Error loading current macro plan:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลแผนปัจจุบันได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // คำนวณ calories จาก macro grams
  const calculateCaloriesFromMacros = (protein, carb, fat) => {
    return protein * 4 + carb * 4 + fat * 9;
  };

  // คำนวณ grams จาก calories และ percentage
  const calculateGramsFromPercentage = (calories, percent, macroType) => {
    const caloriesFromMacro = (calories * percent) / 100;
    if (macroType === "fat") {
      return Math.round(caloriesFromMacro / 9);
    }
    return Math.round(caloriesFromMacro / 4); // protein และ carb
  };

  // คำนวณ percentage จาก grams และ calories
  const calculatePercentageFromGrams = (grams, macroType, totalCalories) => {
    if (totalCalories <= 0) return 0;
    const caloriesFromMacro = macroType === "fat" ? grams * 9 : grams * 4;
    return Math.round((caloriesFromMacro / totalCalories) * 100);
  };

  // Handle mode switch
  const handleModeSwitch = (newMode) => {
    if (newMode === editMode) return;

    setFormData((prev) => {
      if (newMode === "grams") {
        // จาก % → g: ใช้ calories เดิมคำนวณ grams
        const proteinGrams = calculateGramsFromPercentage(
          prev.calories,
          prev.proteinPercent,
          "protein"
        );
        const carbGrams = calculateGramsFromPercentage(
          prev.calories,
          prev.carbPercent,
          "carb"
        );
        const fatGrams = calculateGramsFromPercentage(
          prev.calories,
          prev.fatPercent,
          "fat"
        );

        return {
          ...prev,
          proteinGrams,
          carbGrams,
          fatGrams,
        };
      } else {
        // จาก g → %: ใช้ grams คำนวณ calories ใหม่และ %
        const newCalories = calculateCaloriesFromMacros(
          prev.proteinGrams,
          prev.carbGrams,
          prev.fatGrams
        );
        const proteinPercent = calculatePercentageFromGrams(
          prev.proteinGrams,
          "protein",
          newCalories
        );
        const carbPercent = calculatePercentageFromGrams(
          prev.carbGrams,
          "carb",
          newCalories
        );
        const fatPercent = calculatePercentageFromGrams(
          prev.fatGrams,
          "fat",
          newCalories
        );

        return {
          ...prev,
          calories: Math.round(newCalories),
          proteinPercent,
          carbPercent,
          fatPercent,
        };
      }
    });

    setEditMode(newMode);
    setErrors({}); // ล้าง errors เมื่อเปลี่ยนโหมด
  };

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    if (editMode === "percentage") {
      // Validate calories ในโหมด percentage
      if (
        !formData.calories ||
        formData.calories < 800 ||
        formData.calories > 5000
      ) {
        newErrors.calories = "แคลอรี่ควรอยู่ระหว่าง 800-5000";
      }

      // Check total percentage (บังคับให้เท่ากับ 100%)
      const totalPercent =
        formData.proteinPercent + formData.carbPercent + formData.fatPercent;
      if (totalPercent !== 100) {
        newErrors.totalPercent = `รวม percentage ต้องเท่ากับ 100% (ปัจจุบัน: ${totalPercent}%)`;
      }
    } else {
      // Validate grams ในโหมด grams
      if (formData.proteinGrams < 0 || formData.proteinGrams > 500) {
        newErrors.proteinGrams = "โปรตีน ควรอยู่ระหว่าง 0-500g";
      }
      if (formData.carbGrams < 0 || formData.carbGrams > 1000) {
        newErrors.carbGrams = "คาร์โบไฮเดรต ควรอยู่ระหว่าง 0-1000g";
      }
      if (formData.fatGrams < 0 || formData.fatGrams > 300) {
        newErrors.fatGrams = "ไขมัน ควรอยู่ระหว่าง 0-300g";
      }

      // ตรวจสอบ calculated calories
      const calculatedCalories = calculateCaloriesFromMacros(
        formData.proteinGrams,
        formData.carbGrams,
        formData.fatGrams
      );
      if (calculatedCalories < 800 || calculatedCalories > 5000) {
        newErrors.calculatedCalories = `แคลอรี่ที่คำนวณได้ (${Math.round(
          calculatedCalories
        )}) ควรอยู่ระหว่าง 800-5000`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change for percentage mode
  const handleCalorieChange = (value) => {
    const calories = parseInt(value) || 0;
    setFormData((prev) => {
      // อัปเดต grams ตาม percentage
      const proteinGrams = calculateGramsFromPercentage(
        calories,
        prev.proteinPercent,
        "protein"
      );
      const carbGrams = calculateGramsFromPercentage(
        calories,
        prev.carbPercent,
        "carb"
      );
      const fatGrams = calculateGramsFromPercentage(
        calories,
        prev.fatPercent,
        "fat"
      );

      return {
        ...prev,
        calories,
        proteinGrams,
        carbGrams,
        fatGrams,
      };
    });

    if (errors.calories) {
      setErrors((prev) => ({ ...prev, calories: null }));
    }
  };

  // Handle percentage change (percentage mode only)
  const handlePercentageChange = (field, value) => {
    const percent = parseInt(value);
    setFormData((prev) => {
      const updated = { ...prev, [field]: percent };

      // อัปเดต grams ตาม percentage ใหม่
      if (field === "proteinPercent") {
        updated.proteinGrams = calculateGramsFromPercentage(
          prev.calories,
          percent,
          "protein"
        );
      } else if (field === "carbPercent") {
        updated.carbGrams = calculateGramsFromPercentage(
          prev.calories,
          percent,
          "carb"
        );
      } else if (field === "fatPercent") {
        updated.fatGrams = calculateGramsFromPercentage(
          prev.calories,
          percent,
          "fat"
        );
      }

      return updated;
    });

    if (errors.totalPercent) {
      setErrors((prev) => ({ ...prev, totalPercent: null }));
    }
  };

  // Handle grams change (grams mode only)
  const handleGramsChange = (field, value) => {
    const grams = parseInt(value) || 0;
    setFormData((prev) => {
      const updated = { ...prev, [field]: grams };

      // คำนวณ calories และ percentage ใหม่
      const newCalories = calculateCaloriesFromMacros(
        field === "proteinGrams" ? grams : prev.proteinGrams,
        field === "carbGrams" ? grams : prev.carbGrams,
        field === "fatGrams" ? grams : prev.fatGrams
      );

      updated.calories = Math.round(newCalories);
      updated.proteinPercent = calculatePercentageFromGrams(
        field === "proteinGrams" ? grams : prev.proteinGrams,
        "protein",
        newCalories
      );
      updated.carbPercent = calculatePercentageFromGrams(
        field === "carbGrams" ? grams : prev.carbGrams,
        "carb",
        newCalories
      );
      updated.fatPercent = calculatePercentageFromGrams(
        field === "fatGrams" ? grams : prev.fatGrams,
        "fat",
        newCalories
      );

      return updated;
    });

    // ล้าง error ของ field ที่แก้ไข
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Reset to original values
  const handleReset = () => {
    if (currentTargets) {
      const calories = currentTargets.kcal || 2000;
      const protein = currentTargets.protein_g || 0;
      const carb = currentTargets.carb_g || 0;
      const fat = currentTargets.fat_g || 0;

      const proteinPercent =
        calories > 0 ? Math.round(((protein * 4) / calories) * 100) : 25;
      const carbPercent =
        calories > 0 ? Math.round(((carb * 4) / calories) * 100) : 45;
      const fatPercent =
        calories > 0 ? Math.round(((fat * 9) / calories) * 100) : 30;

      setFormData({
        calories: Math.round(calories),
        proteinPercent: Math.min(100, Math.max(0, proteinPercent)),
        carbPercent: Math.min(100, Math.max(0, carbPercent)),
        fatPercent: Math.min(100, Math.max(0, fatPercent)),
        proteinGrams: Math.round(protein),
        carbGrams: Math.round(carb),
        fatGrams: Math.round(fat),
      });
      setErrors({});

      toast({
        title: "รีเซ็ตเสร็จสิ้น",
        description: "กลับไปใช้ค่าเดิม",
      });
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "กรุณาตรวจสอบข้อมูล",
        description: "มีข้อมูลที่ไม่ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!planId || !trainerId) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่พบข้อมูลแผนหรือเทรนเนอร์",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let result;

      if (editMode === "percentage") {
        // แก้ไขแบบสัดส่วน - ใช้ updateRatioMacro
        result = await updateRatioMacro(
          planId,
          trainerId,
          formData.calories,
          formData.proteinPercent,
          formData.carbPercent,
          formData.fatPercent
        );
      } else {
        // แก้ไขแบบกรัม - ใช้ updateGramsMacro
        result = await updateGramsMacro(
          planId,
          trainerId,
          formData.proteinGrams,
          formData.carbGrams,
          formData.fatGrams
        );
      }

      if (result.success) {
        toast({
          title: "บันทึกเสร็จสิ้น",
          description: `อัปเดตเป้าหมายแมโคร${
            editMode === "percentage" ? " (แบบสัดส่วน)" : " (แบบกรัม)"
          }เรียบร้อยแล้ว`,
          variant: "default",
        });

        // เรียก onSave เพื่อ refresh ข้อมูลในหน้าหลัก (ถ้ามี)
        if (onSave) {
          const newTargets = {
            calories: formData.calories,
            protein: formData.proteinGrams,
            carb: formData.carbGrams,
            fat: formData.fatGrams,
            proteinPercent: formData.proteinPercent,
            carbPercent: formData.carbPercent,
            fatPercent: formData.fatPercent,
          };
          onSave(newTargets, period);
        }

        onClose();

        // Refresh หน้าเว็บเพื่อโหลดข้อมูลใหม่
        router.refresh();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message || "ไม่สามารถอัปเดตเป้าหมายแมโครได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating macro targets:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // คำนวณ total percentage
  const totalPercent =
    formData.proteinPercent + formData.carbPercent + formData.fatPercent;

  // คำนวณ calculated calories สำหรับ grams mode
  const calculatedCalories = calculateCaloriesFromMacros(
    formData.proteinGrams,
    formData.carbGrams,
    formData.fatGrams
  );

  const periodLabels = {
    daily: "รายวัน",
    weekly: "รายสัปดาห์",
    monthly: "รายเดือน",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header - Modern Design */}
        <DialogHeader className="p-2">
          <div className="flex items-center justify-center gap-3">
            <div className="text-center text-gray-600">
              <DialogTitle className="text-2xl font-semibold">
                แก้ไขเป้าหมายแมโคร {periodLabels[period]}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 space-y-6 min-h-2 overflow-y-auto p-2">
          {/* Mode Switcher - Modern Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl max-w-md mx-auto">
            <Button
              type="button"
              onClick={() => handleModeSwitch("percentage")}
              className={`flex-1 h-12 text-sm font-medium transition-all rounded-lg ${
                editMode === "percentage"
                  ? "bg-white text-slate-800 shadow-md border border-gray-200"
                  : "bg-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              <Flame className="w-4 h-4 mr-2" />
              สัดส่วน %
            </Button>
            <Button
              type="button"
              onClick={() => handleModeSwitch("grams")}
              className={`flex-1 h-12 text-sm font-medium transition-all rounded-lg ${
                editMode === "grams"
                  ? "bg-white text-slate-800 shadow-md border border-gray-200"
                  : "bg-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              <Target className="w-4 h-4 mr-2" />
              กรัม (g)
            </Button>
          </div>

          {/* Content Layout - Consistent Structure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Calories */}
            <div className="lg:col-span-2">
              {editMode === "percentage" ? (
                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl text-orange-800 flex items-center gap-2 justify-center">
                      <Flame className="w-5 h-5" />
                      เป้าหมายแคลอรี่
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-3 justify-center">
                      <Input
                        type="number"
                        value={formData.calories}
                        onChange={(e) => handleCalorieChange(e.target.value)}
                        className={`text-xl font-bold h-16 text-center bg-white/80 backdrop-blur-sm ${
                          errors.calories
                            ? "border-red-500 focus:border-red-500"
                            : "border-orange-300 focus:border-orange-500"
                        }`}
                        placeholder="2000"
                      />
                      <span className="text-xl font-semibold text-orange-700 min-w-fit">
                        kcal
                      </span>
                    </div>
                    {errors.calories && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.calories}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card
                  className={`border-2 ${
                    errors.calculatedCalories
                      ? "border-red-200 bg-gradient-to-br from-red-50 to-red-100/50"
                      : "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle
                      className={`text-lg flex items-center gap-2 ${
                        errors.calculatedCalories
                          ? "text-red-800"
                          : "text-purple-800"
                      }`}
                    >
                      <Calculator className="w-5 h-5" />
                      แคลอรี่ที่คำนวณได้
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center">
                      <div
                        className={`text-xl font-bold mb-2 ${
                          errors.calculatedCalories
                            ? "text-red-600"
                            : "text-purple-600"
                        }`}
                      >
                        {Math.round(calculatedCalories)} kcal
                      </div>
                    </div>
                    {errors.calculatedCalories && (
                      <p className="text-red-500 text-sm mt-3 flex items-center gap-1 justify-center">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.calculatedCalories}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Macros Grid - Consistent Layout */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Carbohydrates */}
                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-green-800 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      คาร์โบไฮเดรต
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {editMode === "percentage" ? (
                      <>
                        <Select
                          value={formData.carbPercent.toString()}
                          onValueChange={(value) =>
                            handlePercentageChange("carbPercent", value)
                          }
                        >
                          <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-green-300 focus:border-green-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {percentageOptions.map((percent) => (
                              <SelectItem
                                key={percent}
                                value={percent.toString()}
                              >
                                {percent}%
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-center py-3 bg-white/60 rounded-lg border border-green-200">
                          <span className="text-base font-bold text-green-600">
                            {formData.carbGrams}g
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Input
                          type="number"
                          value={formData.carbGrams}
                          onChange={(e) =>
                            handleGramsChange("carbGrams", e.target.value)
                          }
                          className={`h-12 text-center text-base font-semibold bg-white/80 backdrop-blur-sm ${
                            errors.carbGrams
                              ? "border-red-500 focus:border-red-500"
                              : "border-green-300 focus:border-green-500"
                          }`}
                          placeholder="กรัม"
                        />
                        <div className="text-center py-3 bg-white/60 rounded-lg border border-green-200">
                          <span className="text-base font-bold text-green-600">
                            {formData.carbPercent}%
                          </span>
                        </div>
                      </>
                    )}
                    {errors.carbGrams && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.carbGrams}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Protein */}
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      โปรตีน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {editMode === "percentage" ? (
                      <>
                        <Select
                          value={formData.proteinPercent.toString()}
                          onValueChange={(value) =>
                            handlePercentageChange("proteinPercent", value)
                          }
                        >
                          <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-blue-300 focus:border-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {percentageOptions.map((percent) => (
                              <SelectItem
                                key={percent}
                                value={percent.toString()}
                              >
                                {percent}%
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-center py-3 bg-white/60 rounded-lg border border-blue-200">
                          <span className="text-base font-bold text-blue-600">
                            {formData.proteinGrams}g
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Input
                          type="number"
                          value={formData.proteinGrams}
                          onChange={(e) =>
                            handleGramsChange("proteinGrams", e.target.value)
                          }
                          className={`h-12 text-center text-base font-semibold bg-white/80 backdrop-blur-sm ${
                            errors.proteinGrams
                              ? "border-red-500 focus:border-red-500"
                              : "border-blue-300 focus:border-blue-500"
                          }`}
                          placeholder="กรัม"
                        />
                        <div className="text-center py-3 bg-white/60 rounded-lg border border-blue-200">
                          <span className="text-base font-bold text-blue-600">
                            {formData.proteinPercent}%
                          </span>
                        </div>
                      </>
                    )}
                    {errors.proteinGrams && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.proteinGrams}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Fat */}
                <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100/50 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-yellow-800 flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      ไขมัน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {editMode === "percentage" ? (
                      <>
                        <Select
                          value={formData.fatPercent.toString()}
                          onValueChange={(value) =>
                            handlePercentageChange("fatPercent", value)
                          }
                        >
                          <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-yellow-300 focus:border-yellow-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {percentageOptions.map((percent) => (
                              <SelectItem
                                key={percent}
                                value={percent.toString()}
                              >
                                {percent}%
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-center py-3 bg-white/60 rounded-lg border border-yellow-200">
                          <span className="text-base font-bold text-yellow-600">
                            {formData.fatGrams}g
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Input
                          type="number"
                          value={formData.fatGrams}
                          onChange={(e) =>
                            handleGramsChange("fatGrams", e.target.value)
                          }
                          className={`h-12 text-center text-base font-semibold bg-white/80 backdrop-blur-sm ${
                            errors.fatGrams
                              ? "border-red-500 focus:border-red-500"
                              : "border-yellow-300 focus:border-yellow-500"
                          }`}
                          placeholder="กรัม"
                        />
                        <div className="text-center py-3 bg-white/60 rounded-lg border border-yellow-200">
                          <span className="text-base font-bold text-yellow-600">
                            {formData.fatPercent}%
                          </span>
                        </div>
                      </>
                    )}
                    {errors.fatGrams && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.fatGrams}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Total Percentage Display - Only in Percentage Mode */}
            {editMode === "percentage" && (
              <div className="lg:col-span-2">
                <Card
                  className={`border-2 ${
                    totalPercent === 100
                      ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50"
                      : "border-red-200 bg-gradient-to-br from-red-50 to-red-100/50"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-700">
                        รวมทั้งหมด:
                      </span>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xl font-bold ${
                            totalPercent === 100
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {totalPercent}%
                        </span>
                        <div
                          className={`p-2 rounded-full ${
                            totalPercent === 100
                              ? "bg-emerald-100"
                              : "bg-red-100"
                          }`}
                        >
                          {totalPercent === 100 ? (
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                    {errors.totalPercent && (
                      <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.totalPercent}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Modern Design */}
        <DialogFooter className="flex justify-between p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            รีเซ็ต
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSave}
              className="border-2 border-gray-300 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-gray-600 shadow-lg transition-all transform hover:scale-105"
              disabled={Object.keys(errors).length > 0 || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
