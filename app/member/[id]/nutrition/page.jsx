import React from "react";
import { getActiveNutritionPlan } from "@/actions/member/plans/nutritionPlan";
import EmptyState from "../../_components/EmptyState";
import MacroBar from "../../_components/MacroBar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Format date function to display in Thai format
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Component แสดงรายการอาหาร
 */
const FoodItem = ({ food }) => {
  const totalCalories = Math.round(food.calories * food.serving_quantity);

  return (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <div className="flex-1">
        <p className="font-medium">{food.food_name}</p>
        <p className="text-sm text-gray-500">
          {food.serving_quantity} {food.serving_size}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold">{totalCalories} kcal</p>
        <p className="text-xs text-gray-500">
          P: {Math.round(food.protein * food.serving_quantity)}g &bull; C:{" "}
          {Math.round(food.carbs * food.serving_quantity)}g &bull; F:{" "}
          {Math.round(food.fat * food.serving_quantity)}g
        </p>
      </div>
    </div>
  );
};

/**
 * Component สำหรับแสดงมื้ออาหาร
 */
const MealCard = ({ meal }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{meal.meal_name}</CardTitle>
          <Badge variant="outline">{meal.totalCalories} kcal</Badge>
        </div>
        {meal.meal_time && <CardDescription>{meal.meal_time}</CardDescription>}
      </CardHeader>
      <CardContent>
        {meal.foods.length > 0 ? (
          <div className="space-y-1">
            {meal.foods.map((food) => (
              <FoodItem key={food.meal_food_id} food={food} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-3">ยังไม่มีรายการอาหาร</p>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Component สรุปสารอาหารรวมต่อวัน
 */
const NutritionSummary = ({ dailyTotals }) => {
  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle>สรุปสารอาหารต่อวัน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="font-semibold text-xl">{dailyTotals.calories} kcal</p>
            <p className="text-gray-500">แคลอรี่</p>
          </div>
          <div>
            <p className="font-semibold text-xl">
              {Math.round(dailyTotals.protein)}g
            </p>
            <p className="text-gray-500">โปรตีน</p>
          </div>
          <div>
            <p className="font-semibold text-xl">
              {Math.round(dailyTotals.carbs)}g
            </p>
            <p className="text-gray-500">คาร์โบไฮเดรต</p>
          </div>
          <div>
            <p className="font-semibold text-xl">
              {Math.round(dailyTotals.fat)}g
            </p>
            <p className="text-gray-500">ไขมัน</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Component หน้าแผนโภชนาการสำหรับสมาชิก
 */
async function NutritionPlanPage({ params }) {
  const memberId = parseInt(params.id, 10);
  const nutritionPlanData = await getActiveNutritionPlan(memberId);

  // ถ้าไม่มีแผนโภชนาการ แสดง EmptyState
  if (!nutritionPlanData) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">แผนโภชนาการ</h1>
        <EmptyState
          title="ยังไม่มีแผนโภชนาการ"
          description="กรุณาติดต่อผู้ฝึกสอน"
        />
      </div>
    );
  }

  const { plan, meals, dailyTotals, macroPercentages } = nutritionPlanData;

  // จัดรูปแบบวันที่
  const startDate = formatDate(plan.plan_startdate);
  const endDate = plan.plan_enddate ? formatDate(plan.plan_enddate) : null;
  const dateRange = endDate
    ? `${startDate} - ${endDate}`
    : `เริ่ม ${startDate}`;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">แผนโภชนาการ</h1>

      {/* Header Card with Plan Information */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{plan.plan_name}</CardTitle>
            <Badge
              className={
                plan.plan_status === "active"
                  ? "bg-green-100 text-green-800"
                  : ""
              }
            >
              {plan.plan_status === "active" ? "กำลังใช้งาน" : plan.plan_status}
            </Badge>
          </div>
          <CardDescription>{dateRange}</CardDescription>
        </CardHeader>
        {plan.plan_description && (
          <CardContent>
            <p>{plan.plan_description}</p>
          </CardContent>
        )}
      </Card>

      {/* MacroBar Component */}
      <MacroBar
        dailyCalories={plan.daily_calories}
        caloriesPercentage={macroPercentages.calories}
        macros={{
          protein: plan.protein_target,
          carbs: plan.carbs_target,
          fat: plan.fat_target,
        }}
        percentages={macroPercentages}
      />

      {/* Meal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {meals.map((meal) => (
          <MealCard key={meal.meal_plan_id} meal={meal} />
        ))}
      </div>

      {/* Nutrition Summary */}
      <NutritionSummary dailyTotals={dailyTotals} />
    </div>
  );
}

export default NutritionPlanPage;
