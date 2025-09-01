"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiRangeSlider } from "@/components/ui/multi-range-slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { updateRatioMacro, getCurrentMacroPlan } from "@/actions/trainer/macro/manual/updateRatioMacro";

// Constants สำหรับการคำนวณ
const MACRO_CALORIES = {
  PROTEIN: 4,
  CARB: 4,
  FAT: 9,
};

const EditMacroPlanSheet = ({
  isOpen,
  onClose,
  planId,
  trainerId,
  onSuccess,
}) => {
  const { toast } = useToast();

  // States - เหมือน CreateMacroPlanSheet
  const [planData, setPlanData] = useState({
    plan_startdate: new Date().toISOString().split("T")[0],
    plan_enddate: "",
    plan_duration: 0,
    member_name: "",
  });
  const [calories, setCalories] = useState("");
  const [proteinPercent, setProteinPercent] = useState([30]);
  const [fatPercent, setFatPercent] = useState([30]);
  const [carbPercent, setCarbPercent] = useState([40]);
  const [isLoading, setIsLoading] = useState(false);

  // คำนวณกรัมของแต่ละ macro - เหมือน CreateMacroPlanSheet
  const calculateGrams = () => {
    const proteinGrams = Math.round(
      (calories * proteinPercent[0]) / 100 / MACRO_CALORIES.PROTEIN
    );
    const fatGrams = Math.round(
      (calories * fatPercent[0]) / 100 / MACRO_CALORIES.FAT
    );
    const carbGrams = Math.round(
      (calories * carbPercent[0]) / 100 / MACRO_CALORIES.CARB
    );

    return {
      protein: proteinGrams,
      fat: fatGrams,
      carb: carbGrams,
    };
  };

  // ตรวจสอบความถูกต้องของข้อมูล - เหมือน CreateMacroPlanSheet
  const validateData = () => {
    const totalPercent = proteinPercent[0] + fatPercent[0] + carbPercent[0];

    if (!calories || calories <= 0) {
      return false;
    }

    if (Math.abs(totalPercent - 100) > 0.1) {
      return false;
    }

    return true;
  };

  // Duration options - เหมือน CreateMacroPlanSheet
  const durationOptions = [
    { value: 0, label: "ไม่กำหนด" },
    { value: 1, label: "1 สัปดาห์" },
    { value: 2, label: "2 สัปดาห์" },
    { value: 3, label: "3 สัปดาห์" },
    { value: 4, label: "4 สัปดาห์" },
    { value: 5, label: "5 สัปดาห์" },
    { value: 6, label: "6 สัปดาห์" },
    { value: 8, label: "8 สัปดาห์" },
    { value: 9, label: "9 สัปดาห์" },
    { value: 10, label: "10 สัปดาห์" },
    { value: 12, label: "12 สัปดาห์" },
  ];

  // คำนวณวันที่สิ้นสุดอัตโนมัติ - เหมือน CreateMacroPlanSheet
  useEffect(() => {
    if (planData.plan_duration === 0) {
      setPlanData((prev) => ({ ...prev, plan_enddate: "" }));
      return;
    }

    if (planData.plan_startdate && planData.plan_duration > 0) {
      const startDate = new Date(planData.plan_startdate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + planData.plan_duration * 7);

      setPlanData((prev) => ({
        ...prev,
        plan_enddate: endDate.toISOString().split("T")[0],
      }));
    }
  }, [planData.plan_duration, planData.plan_startdate]);

  // โหลดข้อมูลเมื่อเปิด Sheet - แก้ไขจาก CreateMacroPlanSheet
  useEffect(() => {
    if (isOpen) {
      if (planId && trainerId) {
        // โหลดข้อมูลจาก database
        loadPlanData();
      } else {
        // รีเซ็ตข้อมูล
        setPlanData({
          plan_startdate: new Date().toISOString().split("T")[0],
          plan_enddate: "",
          plan_duration: 0,
          member_name: "",
        });
        setCalories("");
        setProteinPercent([30]);
        setFatPercent([30]);
        setCarbPercent([40]);
      }
    }
  }, [isOpen]);

  const loadPlanData = async () => {
    try {
      const result = await getCurrentMacroPlan(parseInt(planId), parseInt(trainerId));
      
      if (result.success) {
        const plan = result.plan;
        
        // Format date helper
        const formatDate = (dateValue) => {
          if (!dateValue) return "";
          if (typeof dateValue === 'string') {
            return dateValue.split('T')[0];
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString().split('T')[0];
          }
          return "";
        };
        
        // Set plan data
        setPlanData({
          plan_startdate: formatDate(plan.period.start_date),
          plan_enddate: formatDate(plan.period.end_date),
          plan_duration: 0,
          member_name: plan.member.name,
        });

        // Set macro data
        setCalories(plan.macros.calorie_target || "");
        setProteinPercent([parseFloat(plan.macros.protein_ratio) || 30]);
        setFatPercent([parseFloat(plan.macros.fat_ratio) || 30]);
        setCarbPercent([parseFloat(plan.macros.carb_ratio) || 40]);
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message || "ไม่สามารถดึงข้อมูลแผนโภชนาการได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Load plan data error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการดึงข้อมูลแผนโภชนาการ",
        variant: "destructive",
      });
    }
  };

  // ไม่ต้องมี real-time validation เหมือน CreateMacroPlanSheet

  // จัดการการปรับ multi-range slider - เหมือน CreateMacroPlanSheet
  const handleMultiSliderChange = (values) => {
    const [proteinEnd, fatEnd] = values;

    const proteinPercentage = proteinEnd;
    const fatPercentage = fatEnd - proteinEnd;
    const carbPercentage = 100 - fatEnd;

    setProteinPercent([Math.round(proteinPercentage * 10) / 10]);
    setFatPercent([Math.round(fatPercentage * 10) / 10]);
    setCarbPercent([Math.round(carbPercentage * 10) / 10]);
  };

  // อัปเดตแผนโภชนาการ - แก้ไขจาก CreateMacroPlanSheet
  const handleUpdatePlan = async () => {
    if (!validateData()) return;

    setIsLoading(true);
    try {
      const result = await updateRatioMacro(
        parseInt(planId),
        parseInt(trainerId),
        calories,
        proteinPercent[0],
        carbPercent[0],
        fatPercent[0]
      );

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: "อัปเดตแผนโภชนาการเรียบร้อยแล้ว",
        });
        onSuccess?.(result.data || result);
        onClose();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message || "ไม่สามารถอัปเดตแผนโภชนาการได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการอัปเดตแผนโภชนาการ",
        variant: "destructive",
      });
      console.error("Update plan error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const grams = calculateGrams();
  const totalPercent = proteinPercent[0] + fatPercent[0] + carbPercent[0];
  const isValid =
    Math.abs(totalPercent - 100) < 0.1 && calories && calories > 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="space-y-1 ">
          <SheetTitle className="flex items-center gap-2 ">
            แก้ไขโปรแกรมโภชนาการ
          </SheetTitle>
          {planData.member_name && (
            <SheetDescription>
              สมาชิก: {planData.member_name}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-120px)]">
          <div className="flex-1 space-y-6 py-6 overflow-y-auto ">
            {/* Start Date และ Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="plan_startdate">วันที่เริ่มต้น</Label>
                <Input
                  id="plan_startdate"
                  type="date"
                  value={planData.plan_startdate}
                  onChange={(e) =>
                    setPlanData((prev) => ({
                      ...prev,
                      plan_startdate: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_duration">ระยะเวลา</Label>
                <Select
                  value={planData.plan_duration.toString()}
                  onValueChange={(value) =>
                    setPlanData((prev) => ({
                      ...prev,
                      plan_duration: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger id="plan_duration">
                    <SelectValue placeholder="เลือกระยะเวลา" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* วันสิ้นสุด */}
              {planData.plan_duration > 0 && planData.plan_enddate && (
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="plan_enddate">วันสิ้นสุด</Label>
                  <Input
                    id="plan_enddate"
                    type="date"
                    value={planData.plan_enddate}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    วันสิ้นสุดจะถูกคำนวณอัตโนมัติตามระยะเวลาที่เลือก
                  </p>
                </div>
              )}
            </div>

            {/* Calories Input */}
            <div className="space-y-2">
              <Label htmlFor="calories">
                แคลอรี่ <span className="text-red-500">(จำเป็น)</span>
              </Label>
              <Input
                id="calories"
                type="number"
                min="0"
                max="10000"
                value={calories}
                onChange={(e) => setCalories(parseInt(e.target.value) || "")}
                placeholder="กิโลแคลอรี่ (g)"
                className="text-base"
              />
            </div>

            {/* Macro Multi-Range Slider */}
            <div className="space-y-4">
              {/* Labels */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Label className="text-green-600 font-medium text-base">
                    โปรตีน
                  </Label>
                  <div className="text-sm text-gray-600 mt-1">
                    {proteinPercent[0]}% • {grams.protein}g
                  </div>
                </div>
                <div className="text-center">
                  <Label className="text-orange-600 font-medium text-base">
                    ไขมัน
                  </Label>
                  <div className="text-sm text-gray-600 mt-1">
                    {fatPercent[0]}% • {grams.fat}g
                  </div>
                </div>
                <div className="text-center">
                  <Label className="text-purple-600 font-medium text-base">
                    คาร์โบไฮเดรต
                  </Label>
                  <div className="text-sm text-gray-600 mt-1">
                    {carbPercent[0]}% • {grams.carb}g
                  </div>
                </div>
              </div>

              {/* Enhanced Multi-Range Slider */}
              <div className="px-2 py-8 space-y-6">
                <div className="relative">
                  <MultiRangeSlider
                    value={[
                      proteinPercent[0],
                      proteinPercent[0] + fatPercent[0],
                    ]}
                    onValueChange={handleMultiSliderChange}
                    min={0}
                    max={100}
                    step={1}
                    minStepsBetweenThumbs={5}
                    className="w-full"
                    colors={{
                      protein: "bg-green-500",
                      fat: "bg-orange-500",
                      carb: "bg-purple-500",
                    }}
                    labels={{
                      protein: "Protein",
                      fat: "Fat",
                      carb: "Carbohydrates",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <SheetFooter className="border-t pt-4 flex flex-col gap-2">
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleUpdatePlan}
                disabled={!isValid || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    กำลังอัปเดต...
                  </>
                ) : (
                  "อัปเดตแผน"
                )}
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditMacroPlanSheet;