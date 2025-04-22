import React from "react";
import { getActiveWorkoutPlan } from "@/actions/member/plans/workoutPlan";
import EmptyState from "../../_components/EmptyState";
import { getDayNameThai } from "@/utils/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
 * แปลงวันในรูปแบบต่างๆ เป็นชื่อวันภาษาไทย
 */
const getThaiDayName = (day) => {
  // กรณีเป็นตัวเลข เช่น "3" (พุธ), "5" (ศุกร์)
  if (!isNaN(parseInt(day, 10))) {
    return getDayNameThai(parseInt(day, 10));
  }

  // กรณีเป็น "none" หรือไม่ระบุ
  if (day === "none" || !day) {
    return "ไม่ระบุวัน";
  }

  // กรณีเป็นชื่อวันภาษาอังกฤษ
  const dayMap = {
    monday: "วันจันทร์",
    tuesday: "วันอังคาร",
    wednesday: "วันพุธ",
    thursday: "วันพฤหัสบดี",
    friday: "วันศุกร์",
    saturday: "วันเสาร์",
    sunday: "วันอาทิตย์",
  };

  const normalizedDay = day.toLowerCase().trim();
  return dayMap[normalizedDay] || day;
};

/**
 * Exercise row component for displaying a single exercise in the workout
 */
const ExerciseRow = ({ exercise }) => {
  return (
    <div className="border-b py-3 flex flex-col sm:flex-row sm:items-center justify-between last:border-none">
      <div className="flex-1 mb-2 sm:mb-0">
        <h4 className="font-semibold">{exercise.exercise_name}</h4>
        <p className="text-sm text-gray-500">{exercise.exercise_description}</p>
      </div>
      <div className="flex flex-row items-center gap-3">
        <div className="bg-gray-100 px-2 py-1 rounded text-sm">
          {exercise.sets} เซต × {exercise.repetitions} ครั้ง
        </div>
        {exercise.weight_kg && (
          <div className="bg-gray-100 px-2 py-1 rounded text-sm">
            {exercise.weight_kg} กก.
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Accordion Day component that displays exercises for a specific day
 */
const AccordionDay = ({ dayName, exercises }) => {
  // Don't render days with no exercises
  if (exercises.length === 0) return null;

  // แปลงชื่อวันเป็นภาษาไทย
  const thaiDayName = getThaiDayName(dayName);

  return (
    <AccordionItem value={dayName}>
      <AccordionTrigger className="hover:bg-gray-50 hover:no-underline px-2">
        <div className="flex items-center gap-2">
          <span>{thaiDayName}</span>
          <Badge variant="outline">{exercises.length} ท่า</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="px-1">
          {exercises.map((exercise) => (
            <ExerciseRow
              key={exercise.workout_exercise_id}
              exercise={exercise}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

/**
 * Workout plan page component
 */
async function WorkoutPlanPage({ params }) {
  const memberId = parseInt(params.id, 10);
  const workoutPlanData = await getActiveWorkoutPlan(memberId);

  // If no active plan is found, show the empty state
  if (!workoutPlanData) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">โปรแกรมการฝึก</h1>
        <EmptyState
          title="ยังไม่มีโปรแกรมฝึก"
          description="กรุณาติดต่อผู้ฝึกสอน"
        />
      </div>
    );
  }

  const { plan, groupedByDay } = workoutPlanData;

  // Format date range for display
  const startDate = formatDate(plan.plan_startdate);
  const endDate = plan.plan_enddate ? formatDate(plan.plan_enddate) : null;
  const dateRange = endDate
    ? `${startDate} - ${endDate}`
    : `เริ่ม ${startDate}`;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">โปรแกรมการฝึก</h1>

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

      {/* Workout Days Accordion */}
      <Accordion type="single" collapsible className="w-full">
        {Object.keys(groupedByDay)
          .filter((day) => groupedByDay[day].length > 0) // กรองวันที่ไม่มีท่าออกกำลังกาย
          .map((day) => (
            <AccordionDay
              key={day}
              dayName={day}
              exercises={groupedByDay[day]}
            />
          ))}
      </Accordion>
    </div>
  );
}

export default WorkoutPlanPage;
