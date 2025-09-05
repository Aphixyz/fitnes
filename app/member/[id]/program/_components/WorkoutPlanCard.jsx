"use client";

import ProgramCard from "./ProgramCard";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Calendar, Clock } from "lucide-react";

/**
 * WorkoutPlanCard - Client Component
 * แสดงข้อมูล workout plan พร้อม programs และ controls
 */
const WorkoutPlanCard = ({ workoutPlan }) => {
  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = () => {
    const endDate = new Date(workoutPlan.plan_enddate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Plan Header Card - Dashboard Style Design */}
      <Card className="w-full hover:shadow-md transition-all duration-200 border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Icon and Content */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Plan Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-blue-700" />
                </div>
              </div>
              
              {/* Plan Info */}
              <div className="flex-1 min-w-0">
                {/* Plan Name (Title) */}
                <h3 className="text-base md:text-lg font-bold text-gray-900 break-words leading-tight">
                  {workoutPlan.plan_name}
                </h3>
              </div>
            </div>
          </div>

          {/* Plan Note - Dashboard Style */}
          {workoutPlan.plan_note && (
            <div className="mt-3 bg-blue-50/70 border-l-3 sm:border-l-4 border-blue-400 rounded-r-md sm:rounded-r-lg p-2 sm:p-3">
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                {workoutPlan.plan_note}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Programs - Dashboard Style Cards */}
      <div className="space-y-3">
        {workoutPlan.programs.length === 0 ? (
          <Card className="w-full min-h-[120px]">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  ยังไม่มีโปรแกรมฝึก
                </p>
                <p className="text-gray-400 text-xs">
                  กรุณาติดต่อเทรนเนอร์เพื่อเพิ่มโปรแกรม
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {workoutPlan.programs.map((program, index) => (
              <ProgramCard
                key={program.workout_program_id}
                program={program}
                programIndex={index + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlanCard;
