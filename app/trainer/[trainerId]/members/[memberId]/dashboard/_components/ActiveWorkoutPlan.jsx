"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Edit, MoreVertical, Dumbbell, Trash2 } from "lucide-react";
import Link from "next/link";

/**
 * Loading skeleton for the workout plan card
 */
function WorkoutPlanSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Formats date to Thai format
 */
function formatDateThai(dateString) {
  const date = new Date(dateString);
  const thaiMonths = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // Convert to Buddhist Era

  return `${day} ${month} ${year}`;
}

/**
 * Calculates current week based on start date and duration
 */
function calculateCurrentWeek(startDate, duration) {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const currentWeek = Math.ceil(diffDays / 7);
  const totalWeeks = Math.ceil(duration / 7);

  return {
    current: Math.max(1, Math.min(currentWeek, totalWeeks)),
    total: totalWeeks,
  };
}

/**
 * ActiveWorkoutPlan component - แสดงข้อมูล workout plan ที่กำลังใช้งาน
 */
export function ActiveWorkoutPlan({ trainerId, memberId }) {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchActiveWorkoutPlan() {
      try {
        setLoading(true);
        setError(null);

        // Import and call the server action
        const { getActiveWorkoutPlan } = await import(
          "@/actions/trainer/workout/workout_plan/getActiveWorkoutPlan"
        );

        const result = await getActiveWorkoutPlan(memberId);
        setWorkoutPlan(result);
      } catch (err) {
        console.error("Error fetching active workout plan:", err);
        setError("ไม่สามารถโหลดข้อมูลโปรแกรมได้");
      } finally {
        setLoading(false);
      }
    }

    if (memberId) {
      fetchActiveWorkoutPlan();
    }
  }, [memberId]);

  // Handle delete workout plan
  const handleDeletePlan = async () => {
    try {
      setIsDeleting(true);

      // Import and call the delete server action
      const { deleteWorkoutPlan } = await import(
        "@/actions/trainer/workout/workout_plan/deleteWorkoutPlan"
      );

      const result = await deleteWorkoutPlan({
        plan_id: workoutPlan.workout_plan_id,
      });

      if (result.deleted) {
        // Clear the workout plan data to show the "no program" state
        setWorkoutPlan(null);
        setShowDeleteDialog(false);
      } else {
        setError("ไม่สามารถลบโปรแกรมได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Error deleting workout plan:", err);
      setError("เกิดข้อผิดพลาดในการลบโปรแกรม");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <WorkoutPlanSkeleton />;
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <Dumbbell className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!workoutPlan) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            ไม่มีโปรแกรมการออกกำลังกาย
          </h3>
          <p className="text-gray-500 mb-4">
            สมาชิกยังไม่มีโปรแกรมการออกกำลังกายที่กำลังใช้งาน
          </p>
          <Button asChild>
            <Link
              href={`/trainer/${trainerId}/members/${memberId}/workout-plan/create`}
            >
              สร้างโปรแกรมใหม่
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formattedStartDate = formatDateThai(workoutPlan.plan_startdate);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            แผนการฝึกออกกำลังกาย
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Link
                href={`/trainer/${trainerId}/members/${memberId}/workout-plan/${workoutPlan.workout_plan_id}`}
              >
                <Edit className="w-4 h-4 mr-1" />
                แก้ไขแผนโปรแกรม
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  ลบแผนการฝึกออกกำลังกายนี้
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center space-x-4">
          {/* Workout Plan Icon */}
          <div className="bg-gray-100 rounded-lg p-3 flex-shrink-0">
            <Calendar className="w-6 h-6 text-gray-600" />
          </div>

          {/* Plan Details */}
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-gray-900 truncate">
              {workoutPlan.plan_name}
            </h4>
            <p className="text-sm text-gray-600">
              {workoutPlan.program_count} โปรแกรม · เริ่มวันที่{" "}
              {formattedStartDate}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        {workoutPlan.plan_note && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{workoutPlan.plan_note}</p>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              คุณต้องการลบแผนฝึกออกกำลังกายนี้หรือไม่ ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              แผนการฝึกออกกำลังกายนี้จะถูกลบอออกจากลูกค้าและไม่สามารถกู้คืนได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              {isDeleting ? "กำลังลบแผนการฝึก..." : "ลบแผนการฝึก"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default ActiveWorkoutPlan;
