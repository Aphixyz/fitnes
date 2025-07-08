"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, Apple, AlertCircle } from "lucide-react";
import { createRatioMacro } from "@/actions/trainer/macro/manual/createRatioMacro";
import { createGramsMacro } from "@/actions/trainer/macro/manual/createGramsMacro";

// ===== Ratio Form Component =====

const RatioForm = ({ ratioData, onRatioDataChange, validation }) => {
  const handleChange = (field, value) => {
    const numValue =
      field === "calories" ? parseInt(value) || 0 : parseFloat(value) || 0;
    const newData = { ...ratioData, [field]: numValue };
    onRatioDataChange(newData);
  };

  return (
    <div className="space-y-4">
      {/* Calorie Target */}
      <div className="space-y-2">
        <Label htmlFor="calories">เป้าหมายแคลอรี่ต่อวัน</Label>
        <div className="relative">
          <Input
            id="calories"
            type="number"
            min="0"
            max="10000"
            value={ratioData.calories}
            onChange={(e) => handleChange("calories", e.target.value)}
            className="pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="text-orange-600 font-medium text-sm">kcal</span>
          </div>
        </div>
      </div>

      {/* Macro Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="proteinRatio">โปรตีน (%)</Label>
          <div className="relative">
            <Input
              id="proteinRatio"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={ratioData.proteinRatio}
              onChange={(e) => handleChange("proteinRatio", e.target.value)}
              className="pr-8"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <span className="text-red-600 font-medium">P</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="carbRatio">คาร์โบไฮเดรต (%)</Label>
          <div className="relative">
            <Input
              id="carbRatio"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={ratioData.carbRatio}
              onChange={(e) => handleChange("carbRatio", e.target.value)}
              className="pr-8"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <span className="text-green-600 font-medium">C</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fatRatio">ไขมัน (%)</Label>
          <div className="relative">
            <Input
              id="fatRatio"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={ratioData.fatRatio}
              onChange={(e) => handleChange("fatRatio", e.target.value)}
              className="pr-8"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <span className="text-yellow-600 font-medium">F</span>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Alert */}
      {validation && !validation.isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validation.message}</AlertDescription>
        </Alert>
      )}

      {/* Total Display */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <span className="text-sm">รวม:</span>
          <span
            className={`font-semibold ${
              Math.abs(
                ratioData.proteinRatio +
                  ratioData.carbRatio +
                  ratioData.fatRatio -
                  100
              ) < 0.01
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {(
              ratioData.proteinRatio +
              ratioData.carbRatio +
              ratioData.fatRatio
            ).toFixed(1)}
            %
          </span>
        </div>
      </div>
    </div>
  );
};

// ===== Grams Form Component =====

const GramsForm = ({ gramsData, onGramsDataChange }) => {
  const handleChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    const newData = { ...gramsData, [field]: numValue };
    onGramsDataChange(newData);
  };

  // คำนวณแคลอรี่รวม
  const totalCalories =
    gramsData.proteinGrams * 4 +
    gramsData.carbGrams * 4 +
    gramsData.fatGrams * 9;

  // คำนวณสัดส่วน %
  const getPercentage = (grams, multiplier) => {
    if (totalCalories === 0) return 0;
    return (((grams * multiplier) / totalCalories) * 100).toFixed(1);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="proteinGrams">โปรตีน (กรัม)</Label>
          <div className="relative">
            <Input
              id="proteinGrams"
              type="number"
              min="0"
              max="1000"
              step="0.1"
              value={gramsData.proteinGrams}
              onChange={(e) => handleChange("proteinGrams", e.target.value)}
              className="pr-8"
              placeholder="เช่น 125"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <span className="text-red-600 font-medium text-xs">g</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="carbGrams">คาร์โบไฮเดรต (กรัม)</Label>
          <div className="relative">
            <Input
              id="carbGrams"
              type="number"
              min="0"
              max="1000"
              step="0.1"
              value={gramsData.carbGrams}
              onChange={(e) => handleChange("carbGrams", e.target.value)}
              className="pr-8"
              placeholder="เช่น 225"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <span className="text-green-600 font-medium text-xs">g</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fatGrams">ไขมัน (กรัม)</Label>
          <div className="relative">
            <Input
              id="fatGrams"
              type="number"
              min="0"
              max="1000"
              step="0.1"
              value={gramsData.fatGrams}
              onChange={(e) => handleChange("fatGrams", e.target.value)}
              className="pr-8"
              placeholder="เช่น 67"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <span className="text-yellow-600 font-medium text-xs">g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Summary */}
      {totalCalories > 0 && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">สรุปผลการคำนวณ</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(totalCalories)} kcal
              </div>
              <div className="text-xs text-gray-600">แคลอรี่รวมต่อวัน</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-red-600">โปรตีน:</span>
                <span className="font-medium">
                  {getPercentage(gramsData.proteinGrams, 4)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">คาร์บ:</span>
                <span className="font-medium">
                  {getPercentage(gramsData.carbGrams, 4)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">ไขมัน:</span>
                <span className="font-medium">
                  {getPercentage(gramsData.fatGrams, 9)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Main Modal Component =====

const CreateMacroPlanModal = ({
  isOpen,
  onClose,
  memberId,
  trainerId,
  onSuccess,
}) => {
  const [planType, setPlanType] = useState("ratio"); // "ratio" | "grams"

  // Ratio form data
  const [ratioData, setRatioData] = useState({
    calories: 2000,
    proteinRatio: 30,
    carbRatio: 40,
    fatRatio: 30,
  });

  // Grams form data
  const [gramsData, setGramsData] = useState({
    proteinGrams: 125,
    carbGrams: 225,
    fatGrams: 67,
  });

  const [validation, setValidation] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // ตรวจสอบ ratio validation
  useEffect(() => {
    if (planType === "ratio") {
      const total =
        ratioData.proteinRatio + ratioData.carbRatio + ratioData.fatRatio;
      const isValid = Math.abs(total - 100) < 0.01 && ratioData.calories > 0;

      let message = "";
      if (ratioData.calories <= 0) {
        message = "เป้าหมายแคลอรี่ต้องมากกว่า 0";
      } else if (!isValid) {
        message = `อัตราส่วน macro รวมต้องเท่ากับ 100% (ปัจจุบัน: ${total.toFixed(
          1
        )}%)`;
      } else {
        message = "ข้อมูลถูกต้อง";
      }

      setValidation({ isValid, message });
    }
  }, [ratioData, planType]);

  // รีเซ็ตข้อมูลเมื่อเปิด/ปิด modal
  useEffect(() => {
    if (isOpen) {
      setPlanType("ratio");
      setRatioData({
        calories: 2000,
        proteinRatio: 30,
        carbRatio: 40,
        fatRatio: 30,
      });
      setGramsData({ proteinGrams: 125, carbGrams: 225, fatGrams: 67 });
      setErrors({});
    }
  }, [isOpen]);

  // ตรวจสอบข้อมูลก่อนสร้างแผน
  const validateData = () => {
    const newErrors = {};

    if (planType === "ratio" && (!validation || !validation.isValid)) {
      newErrors.ratios = "ข้อมูลแคลอรี่และสัดส่วน Macro ไม่ถูกต้อง";
    }

    if (planType === "grams") {
      const totalCal =
        gramsData.proteinGrams * 4 +
        gramsData.carbGrams * 4 +
        gramsData.fatGrams * 9;
      if (totalCal === 0) {
        newErrors.grams = "ต้องกำหนด macro อย่างน้อย 1 ตัว";
      }
      if (
        gramsData.proteinGrams < 0 ||
        gramsData.carbGrams < 0 ||
        gramsData.fatGrams < 0
      ) {
        newErrors.grams = "ค่ากรัมทั้งหมดต้องเป็นบวก";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // สร้างแผนโภชนาการ
  const handleCreatePlan = async () => {
    if (!validateData()) return;

    setIsLoading(true);
    try {
      let result;

      if (planType === "ratio") {
        result = await createRatioMacro(
          parseInt(trainerId),
          parseInt(memberId),
          ratioData.calories,
          ratioData.proteinRatio,
          ratioData.carbRatio,
          ratioData.fatRatio
        );
      } else if (planType === "grams") {
        result = await createGramsMacro(
          parseInt(trainerId),
          parseInt(memberId),
          gramsData.proteinGrams,
          gramsData.carbGrams,
          gramsData.fatGrams
        );
      }

      if (result.success) {
        onSuccess?.(result.data || result);
        onClose();
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการสร้างแผนโภชนาการ");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการสร้างแผนโภชนาการ");
      console.error("Create plan error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ข้อมูลสำหรับแสดงผล
  const getPreviewData = () => {
    if (planType === "ratio") {
      return {
        type: "แคลอรี่ + สัดส่วน",
        calories: ratioData.calories,
        ratios: {
          protein: ratioData.proteinRatio,
          carb: ratioData.carbRatio,
          fat: ratioData.fatRatio,
        },
        grams: {
          protein: Math.round(
            (ratioData.calories * ratioData.proteinRatio) / 100 / 4
          ),
          carb: Math.round(
            (ratioData.calories * ratioData.carbRatio) / 100 / 4
          ),
          fat: Math.round((ratioData.calories * ratioData.fatRatio) / 100 / 9),
        },
      };
    } else {
      const totalCal =
        gramsData.proteinGrams * 4 +
        gramsData.carbGrams * 4 +
        gramsData.fatGrams * 9;
      const proteinPercent = totalCal
        ? (((gramsData.proteinGrams * 4) / totalCal) * 100).toFixed(1)
        : 0;
      const carbPercent = totalCal
        ? (((gramsData.carbGrams * 4) / totalCal) * 100).toFixed(1)
        : 0;
      const fatPercent = totalCal
        ? (((gramsData.fatGrams * 9) / totalCal) * 100).toFixed(1)
        : 0;

      return {
        type: "กรัม",
        calories: Math.round(totalCal),
        ratios: {
          protein: parseFloat(proteinPercent),
          carb: parseFloat(carbPercent),
          fat: parseFloat(fatPercent),
        },
        grams: {
          protein: gramsData.proteinGrams,
          carb: gramsData.carbGrams,
          fat: gramsData.fatGrams,
        },
      };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            สร้างแผนโภชนาการใหม่
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={planType} onValueChange={setPlanType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ratio">แคลอรี่ + สัดส่วน</TabsTrigger>
              <TabsTrigger value="grams">กรัม</TabsTrigger>
            </TabsList>

            <TabsContent value="ratio" className="mt-6">
              <RatioForm
                ratioData={ratioData}
                onRatioDataChange={setRatioData}
                validation={validation}
              />
              {errors.ratios && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.ratios}</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="grams" className="mt-6">
              <GramsForm
                gramsData={gramsData}
                onGramsDataChange={setGramsData}
              />
              {errors.grams && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.grams}</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full justify-end">
            <Button variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={
                isLoading ||
                (planType === "ratio" &&
                  (!validation || !validation.isValid)) ||
                (planType === "grams" && getPreviewData().calories === 0)
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  สร้างแผน
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMacroPlanModal;
