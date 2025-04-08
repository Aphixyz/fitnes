"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDate } from "@/utils/utils";
import { getNutritionPlanById } from "@/actions/trainer/(nutrition)/nutritionPlanAction";
import {
  getMealsByNutritionPlan,
  getMealFoods,
} from "@/actions/trainer/(nutrition)/mealPlanAction";
import {
  getMealFoods as fetchMealFoods,
  addFoodToMeal,
  updateMealFood,
  deleteMealFood,
} from "@/actions/trainer/(nutrition)/mealFoodAction";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Custom implementations will replace the imported components
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Edit,
  Utensils,
  Calendar,
  Info,
  Clock,
  Plus,
  Flame,
} from "lucide-react";
import Link from "next/link";
import MealPlanForm from "@/app/trainer/_components/(nutrition)/MealPlanForm";
import FoodPicker from "@/app/trainer/_components/(nutrition)/FoodPicker";
import FoodCard from "@/app/trainer/_components/(nutrition)/FoodCard";

export default function NutritionPlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id;
  const memberId = params.memberId;
  const planId = params.planId;

  const [plan, setPlan] = useState(null);
  const [meals, setMeals] = useState([]);
  const [activeMeal, setActiveMeal] = useState(null);
  const [mealFoods, setMealFoods] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลแผนโภชนาการและมื้ออาหาร
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลแผนโภชนาการ
        const planResult = await getNutritionPlanById(planId, trainerId);
        if (!planResult.success) {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: planResult.message,
            variant: "destructive",
          });
          router.push(`/trainer/${trainerId}/members/${memberId}/nutrition`);
          return;
        }

        setPlan(planResult.plan);

        // ดึงข้อมูลมื้ออาหาร
        const mealsResult = await getMealsByNutritionPlan(planId);
        if (mealsResult.success) {
          setMeals(mealsResult.meals);

          // ดึงข้อมูลอาหารในแต่ละมื้อ
          const mealFoodsData = {};
          for (const meal of mealsResult.meals) {
            const foodsResult = await fetchMealFoods(meal.meal_plan_id);
            if (foodsResult.success) {
              mealFoodsData[meal.meal_plan_id] = foodsResult.foodItems;
            }
          }

          setMealFoods(mealFoodsData);
        }
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลแผนโภชนาการได้",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trainerId, memberId, planId, router]);

  // คำนวณสรุปโภชนาการทั้งหมด
  const calculateTotalNutrition = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    meals.forEach((meal) => {
      totalCalories += Number(meal.total_calories || 0);
      totalProtein += Number(meal.total_protein || 0);
      totalCarbs += Number(meal.total_carbs || 0);
      totalFat += Number(meal.total_fat || 0);
    });

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    };
  };

  // จัดการการเพิ่มมื้ออาหาร/แก้ไขมื้ออาหาร
  const handleMealSuccess = async () => {
    try {
      // ดึงข้อมูลมื้ออาหารใหม่
      const mealsResult = await getMealsByNutritionPlan(planId);
      if (mealsResult.success) {
        setMeals(mealsResult.meals);
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลมื้ออาหารได้",
        variant: "destructive",
      });
    }
  };

  // จัดการการเพิ่มอาหารในมื้อ
  const handleAddFood = async (mealId, food) => {
    try {
      const result = await addFoodToMeal(
        {
          meal_plan_id: mealId,
          food_id: food.food_id,
          serving_quantity: 1,
        },
        trainerId
      );

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: "เพิ่มอาหารในมื้อสำเร็จ",
        });

        // ดึงข้อมูลอาหารในมื้อใหม่
        const foodsResult = await fetchMealFoods(mealId);
        if (foodsResult.success) {
          setMealFoods((prev) => ({
            ...prev,
            [mealId]: foodsResult.foodItems,
          }));
        }

        // อัพเดตข้อมูลมื้ออาหาร (เพื่อให้ได้ข้อมูลสรุปแคลอรี่ใหม่)
        const mealsResult = await getMealsByNutritionPlan(planId);
        if (mealsResult.success) {
          setMeals(mealsResult.meals);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // จัดการการอัพเดตปริมาณอาหาร
  const handleUpdateQuantity = async (mealId, foodId, quantity) => {
    try {
      const result = await updateMealFood(
        foodId,
        {
          serving_quantity: quantity,
        },
        trainerId
      );

      if (result.success) {
        // อัพเดตแคลอรี่ในหน้าจอสำหรับแสดงผลที่รวดเร็ว (ไม่ต้อง refresh)
        setMealFoods((prev) => ({
          ...prev,
          [mealId]: prev[mealId].map((food) =>
            food.meal_food_id === foodId
              ? { ...food, serving_quantity: quantity }
              : food
          ),
        }));

        // อัพเดตข้อมูลมื้ออาหาร (เพื่อให้ได้ข้อมูลสรุปแคลอรี่ใหม่)
        const mealsResult = await getMealsByNutritionPlan(planId);
        if (mealsResult.success) {
          setMeals(mealsResult.meals);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // จัดการการลบอาหารในมื้อ
  const handleDeleteFood = async (mealId, foodId) => {
    try {
      const result = await deleteMealFood(foodId, trainerId);

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: "ลบอาหารในมื้อสำเร็จ",
        });

        // อัพเดตข้อมูลอาหารในมื้อ
        setMealFoods((prev) => ({
          ...prev,
          [mealId]: prev[mealId].filter((food) => food.meal_food_id !== foodId),
        }));

        // อัพเดตข้อมูลมื้ออาหาร (เพื่อให้ได้ข้อมูลสรุปแคลอรี่ใหม่)
        const mealsResult = await getMealsByNutritionPlan(planId);
        if (mealsResult.success) {
          setMeals(mealsResult.meals);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // แปลงชื่อมื้ออาหารเป็นภาษาไทย
  const getMealNameThai = (mealName) => {
    const mealNames = {
      breakfast: "อาหารเช้า",
      lunch: "อาหารกลางวัน",
      dinner: "อาหารเย็น",
      snack: "อาหารว่าง",
      pre_workout: "ก่อนออกกำลังกาย",
      post_workout: "หลังออกกำลังกาย",
      other: "อื่นๆ",
    };

    return mealNames[mealName] || mealName;
  };

  // แสดงสถานะแผนโภชนาการ
  const getPlanStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">ใช้งาน</Badge>;
      case "inactive":
        return <Badge variant="outline">ไม่ใช้งาน</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">เสร็จสิ้น</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // คำนวณเปอร์เซ็นต์ของเป้าหมายแคลอรี่
  const calculateCaloriesPercentage = () => {
    if (!plan || !plan.daily_calories) return 0;

    const totalNutrition = calculateTotalNutrition();
    return Math.min(
      Math.round((totalNutrition.calories / plan.daily_calories) * 100),
      100
    );
  };

  // ถ้ายังกำลังโหลดข้อมูล
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">
              แผนโภชนาการ
            </h1>
            <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // คำนวณโภชนาการรวม
  const totalNutrition = calculateTotalNutrition();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {plan.plan_name}
          </h1>
          <div className="flex items-center space-x-2">
            {getPlanStatusBadge(plan.plan_status)}
            <p className="text-muted-foreground">สำหรับ {plan.member_name}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/trainer/${trainerId}/members/${memberId}/nutrition`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับ
            </Button>
          </Link>
          <Link
            href={`/trainer/${trainerId}/members/${memberId}/nutrition/${planId}/edit`}
          >
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              แก้ไข
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">
            <Info className="mr-2 h-4 w-4" />
            ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="meals">
            <Utensils className="mr-2 h-4 w-4" />
            มื้ออาหาร
          </TabsTrigger>
        </TabsList>

        {/* แท็บภาพรวม */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>รายละเอียดแผนโภชนาการ</CardTitle>
                <CardDescription>ข้อมูลและเป้าหมายโภชนาการ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">ข้อมูลทั่วไป</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                  <div>
              <p className="text-sm font-medium">ระยะเวลา</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(plan.plan_startdate)} -{" "}
                {plan.plan_enddate
                  ? formatDate(plan.plan_enddate)
                  : "ไม่กำหนด"}
              </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Flame className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                  <div>
              <p className="text-sm font-medium">
                เป้าหมายแคลอรี่ต่อวัน
              </p>
              <p className="text-sm text-muted-foreground">
                {plan.daily_calories
                  ? `${plan.daily_calories} kcal`
                  : "ไม่ได้กำหนด"}
              </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">เป้าหมายสารอาหาร</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">โปรตีน</span>
                  <span className="text-sm font-medium">
              {plan.protein_target ? `${plan.protein_target} g` : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">คาร์โบไฮเดรต</span>
                  <span className="text-sm font-medium">
              {plan.carbs_target ? `${plan.carbs_target} g` : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">ไขมัน</span>
                  <span className="text-sm font-medium">
              {plan.fat_target ? `${plan.fat_target} g` : "-"}
                  </span>
                </div>
              </div>
            </div>
                </div>

                {plan.plan_description && (
            <div>
              <h3 className="text-sm font-medium mb-1">คำอธิบาย</h3>
              <p className="text-sm text-muted-foreground">
                {plan.plan_description}
              </p>
            </div>
                )}

                {plan.notes && (
            <div>
              <h3 className="text-sm font-medium mb-1">บันทึกเพิ่มเติม</h3>
              <p className="text-sm text-muted-foreground">{plan.notes}</p>
            </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>สรุปโภชนาการ</CardTitle>
                <CardDescription>โภชนาการรวมจากทุกมื้ออาหาร</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.daily_calories && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">แคลอรี่</span>
                <span className="text-sm font-medium">
                  {totalNutrition.calories.toFixed(0)} /{" "}
                  {plan.daily_calories} kcal
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {calculateCaloriesPercentage()}% ของเป้าหมายแคลอรี่ต่อวัน
              </span>
            </div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">โปรตีน</p>
              <p className="text-2xl font-bold">
                {totalNutrition.protein.toFixed(1)} g
              </p>
              {plan.protein_target && (
                <p className="text-xs text-muted-foreground">
                  {(
              (totalNutrition.protein / plan.protein_target) *
              100
                  ).toFixed(0)}
                  % ของเป้าหมาย
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">คาร์โบไฮเดรต</p>
              <p className="text-2xl font-bold">
                {totalNutrition.carbs.toFixed(1)} g
              </p>
              {plan.carbs_target && (
                <p className="text-xs text-muted-foreground">
                  {(
              (totalNutrition.carbs / plan.carbs_target) *
              100
                  ).toFixed(0)}
                  % ของเป้าหมาย
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">ไขมัน</p>
              <p className="text-2xl font-bold">
                {totalNutrition.fat.toFixed(1)} g
              </p>
              {plan.fat_target && (
                <p className="text-xs text-muted-foreground">
                  {((totalNutrition.fat / plan.fat_target) * 100).toFixed(
              0
                  )}
                  % ของเป้าหมาย
                </p>
              )}
            </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* แท็บมื้ออาหาร */}
        <TabsContent value="meals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">มื้ออาหาร</h2>
            <MealPlanForm
              mode="create"
              nutritionPlanId={planId}
              trainerId={trainerId}
              onSuccess={handleMealSuccess}
            />
          </div>

          {meals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground mb-4">
                  ยังไม่มีมื้ออาหารในแผนโภชนาการนี้
                </p>
                <MealPlanForm
                  mode="create"
                  nutritionPlanId={planId}
                  trainerId={trainerId}
                  onSuccess={handleMealSuccess}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* รายการมื้ออาหาร */}
              {meals.map((meal) => (
                <Card key={meal.meal_plan_id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <CardTitle>{getMealNameThai(meal.meal_name)}</CardTitle>
                        {meal.meal_time && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {meal.meal_time}
                          </div>
                        )}
                      </div>
                      <MealPlanForm
                        mode="edit"
                        mealData={meal}
                        nutritionPlanId={planId}
                        trainerId={trainerId}
                        onSuccess={handleMealSuccess}
                      />
                    </div>
                    <div className="flex space-x-4 text-sm text-muted-foreground mt-1">
                      <div>
                        แคลอรี่: {meal.total_calories || 0} /{" "}
                        {meal.calories_target || "?"} kcal
                      </div>
                      <div>โปรตีน: {meal.total_protein || 0}g</div>
                      <div>คาร์บ: {meal.total_carbs || 0}g</div>
                      <div>ไขมัน: {meal.total_fat || 0}g</div>
                    </div>
                    {meal.notes && (
                      <div className="text-sm bg-muted/50 p-2 rounded mt-2">
                        {meal.notes}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* รายการอาหารในมื้อ */}
                      {mealFoods[meal.meal_plan_id] &&
                      mealFoods[meal.meal_plan_id].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mealFoods[meal.meal_plan_id].map((food) => (
                            <FoodCard
                              key={food.meal_food_id}
                              food={food}
                              onDelete={(foodId) =>
                                handleDeleteFood(meal.meal_plan_id, foodId)
                              }
                              onUpdateQuantity={(foodId, quantity) =>
                                handleUpdateQuantity(
                                  meal.meal_plan_id,
                                  foodId,
                                  quantity
                                )
                              }
                              editable={true}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          ยังไม่มีอาหารในมื้อนี้
                        </div>
                      )}

                      {/* ปุ่มเพิ่มอาหารในมื้อ */}
                      <div className="mt-4">
                        <FoodPicker
                          onSelect={(food) =>
                            handleAddFood(meal.meal_plan_id, food)
                          }
                          trainerId={trainerId}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
