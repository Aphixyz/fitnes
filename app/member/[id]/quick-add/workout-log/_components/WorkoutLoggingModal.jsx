"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import exercisesData from "@/data/exercises.json";
import ExerciseSetForm, { ExerciseSetTable } from "./ExerciseSetForm";
import { insertProgramExerciseSet } from "@/actions/member/my-workout-plans/insertProgramExerciseSet";
import { formatTimeThai, convertForDatabase } from "@/utils/utils";
import { useToast } from "@/hooks/use-toast";

// Shadcn Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Custom hook สำหรับตรวจสอบ screen size
 */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

/**
 * WorkoutLoggingModal - Responsive Modal Component
 * ใช้ Dialog บน desktop และ Drawer บน mobile
 */
const WorkoutLoggingModal = ({ isOpen, onClose, program, workoutPlan }) => {
  const params = useParams();
  const { toast } = useToast();
  const [loggedSets, setLoggedSets] = useState({}); // เก็บข้อมูลการ log ของแต่ละเซต
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ตรวจสอบ screen size สำหรับ responsive
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isOpen) return null;

  const exercises = program?.exercises || [];


  const handleCloseModal = () => {
    setLoggedSets({}); // Reset logged data เมื่อปิด modal
    setIsSaving(false);
    setSaveError(null);
    onClose();
  };

  // บันทึกข้อมูล Workout Log ลงฐานข้อมูล
  const handleSaveWorkout = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      const memberId = parseInt(params.id);
      const todayDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

      // Validate basic data
      if (!memberId || isNaN(memberId)) {
        setSaveError("ไม่พบข้อมูล Member ID");
        return;
      }

      if (!workoutPlan?.workout_plan_id) {
        setSaveError("ไม่พบข้อมูล Workout Plan ID");
        return;
      }

      if (!program?.workout_program_id) {
        setSaveError("ไม่พบข้อมูล Program ID");
        return;
      }

      // วนลูปข้อมูลใน loggedSets ที่ completed = true
      const completedSets = Object.entries(loggedSets).filter(
        ([, setData]) => setData.completed
      );

      if (completedSets.length === 0) {
        setSaveError("กรุณาบันทึกข้อมูลอย่างน้อย 1 เซต");
        return;
      }

      // บันทึกข้อมูลทีละเซต
      for (const [setKey, setData] of completedSets) {
        // แยก program_exercise_id และ program_exercise_set_id จาก key
        const [programExerciseId, programExerciseSetId] = setKey
          .split("_")
          .map(Number);

        // หา set ข้อมูลจาก exercises เพื่อได้ set_order
        const exercise = exercises.find(
          (ex) => ex.program_exercise_id === programExerciseId
        );
        const set = exercise?.sets?.find(
          (s) => s.program_exercise_set_id === programExerciseSetId
        );

        if (!set) {
          console.error("Set not found for key:", setKey);
          continue;
        }

        // แปลงข้อมูลจาก input fields เป็นค่าที่เหมาะสมสำหรับฐานข้อมูล
        const convertFieldValue = (value, fieldKey) => {
          return convertForDatabase(value, fieldKey);
        };

        const setDataToSave = {
          member_id: memberId,
          workout_plan_id: workoutPlan.workout_plan_id,
          workout_program_id: program.workout_program_id,
          program_exercise_set_id: programExerciseSetId,
          set_order: set.set_order,
          weight: convertFieldValue(setData.weight, "weight"),
          reps: convertFieldValue(setData.reps, "reps"),
          time: convertFieldValue(setData.time, "time"),
          distance: convertFieldValue(setData.distance, "distance"),
          log_date: todayDate,
        };

        // Validate before send
        if (
          !setDataToSave.member_id ||
          !setDataToSave.workout_plan_id ||
          !setDataToSave.workout_program_id ||
          !setDataToSave.program_exercise_set_id ||
          !setDataToSave.set_order ||
          !setDataToSave.log_date
        ) {
          console.error("Invalid set data:", setDataToSave);
          setSaveError(`ข้อมูลเซตไม่ครบถ้วน: Set ${set.set_order}`);
          return;
        }

        await insertProgramExerciseSet(setDataToSave);
      }

      // บันทึกสำเร็จ - ปิด modal และแสดงข้อความ
      handleCloseModal();

      // แสดง toast notification สำหรับ mobile
      toast({
        title: "บันทึกสำเร็จ! 🎉",
        description: `บันทึกข้อมูลการออกกำลังกายเรียบร้อยแล้ว (${completedSets.length} เซต)`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error("Error saving workout:", error);
      setSaveError(error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  // ฟังก์ชันหาชื่อ exercise จาก ID
  const getExerciseName = (exerciseId) => {
    const exerciseFound = exercisesData.find((ex) => ex.id === exerciseId);
    return exerciseFound ? exerciseFound.name : exerciseId;
  };

  // คำนวณสถิติการ logging สำหรับ exercise
  const getExerciseStats = (exercise) => {
    const exerciseLoggedSets = Object.keys(loggedSets).filter((key) =>
      key.startsWith(`${exercise.program_exercise_id}_`)
    );

    const completedSets = exerciseLoggedSets.length;
    const totalSets = exercise.sets?.length || 0;

    // คำนวณน้ำหนักรวม (weight × reps สำหรับทุก logged sets)
    const totalWeight = exerciseLoggedSets.reduce((sum, setKey) => {
      const setData = loggedSets[setKey];
      if (setData && setData.weight && setData.reps) {
        // แปลงข้อมูลก่อนคำนวณ
        const weight = convertForDatabase(setData.weight, "weight") || 0;
        const reps = convertForDatabase(setData.reps, "reps") || 0;
        return sum + weight * reps;
      }
      return sum;
    }, 0);

    return {
      completedSets,
      totalSets,
      totalWeight,
    };
  };

  // ฟังก์ชันสำหรับแสดงหน่วยของระยะทาง
  const getDistanceUnit = (value) => {
    if (value === null || value === undefined) return "";
    if (value >= 1000) return "กิโลเมตร";
    if (value >= 100) return "เมตร";
    return "เมตร";
  };

  // Render Exercise Content
  const renderExercises = () => {
    return (
      <div className="space-y-6">
        {exercises.map((exercise, exerciseIndex) => {

          // คำนวณ active fields จากทุก sets ในแต่ละ exercise
          const getAllActiveFields = () => {
            const fieldsSet = new Set();
            exercise.sets?.forEach((set) => {
              if (set.weight !== null) fieldsSet.add("weight");
              if (set.reps !== null) fieldsSet.add("reps");
              if (set.time !== null) fieldsSet.add("time");
              if (set.distance !== null) fieldsSet.add("distance");
            });

            const fieldOrder = ["weight", "reps", "time", "distance"];
            return fieldOrder
              .filter((field) => fieldsSet.has(field))
              .map((key) => ({
                key,
                label:
                  key === "distance"
                    ? getDistanceUnit(exercise.sets?.[0]?.[key] || 0)
                    : undefined,
              }));
          };

          const exerciseActiveFields = getAllActiveFields();

          return (
            <div key={exercise.program_exercise_id} className="space-y-4">
              {/* Exercise Header - Modern Design */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-slate-200 shadow-sm mt-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {exerciseIndex + 1}
                      </Badge>
                      <h3 className="text-lg font-semibold text-slate-900 leading-tight">
                        {getExerciseName(exercise.exercise_id)}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Exercise Details - Compact Design */}
                {(exercise.exercise_rest || exercise.exercise_notes) && (
                  <div className=" p-3 mb-4">
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      {exercise.exercise_rest && (
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-slate-600">พัก: </span>
                          <span className="font-medium text-slate-900">
                            {formatTimeThai(exercise.exercise_rest)}
                          </span>
                        </div>
                      )}
                    </div>
                    {exercise.exercise_notes && (
                      <div className="mt-2 text-sm">
                        <span className="text-slate-600">หมายเหตุ: </span>
                        <span className="text-slate-700">
                          {exercise.exercise_notes}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Exercise Sets Table */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <ExerciseSetTable
                    exerciseName={getExerciseName(exercise.exercise_id)}
                    activeFields={exerciseActiveFields}
                  >
                    {exercise.sets?.map((set) => (
                      <ExerciseSetForm
                        key={set.program_exercise_set_id}
                        set={set}
                        exercise={exercise}
                        loggedSets={loggedSets}
                        setLoggedSets={setLoggedSets}
                      />
                    ))}
                  </ExerciseSetTable>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Content
  const renderContent = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pb-4">{renderExercises()}</div>
    </div>
  );

  // Render Footer
  const renderFooter = () => (
    <div className="space-y-4 p-4 border-t border-slate-200 bg-white">
      {/* Error Display */}
      {saveError && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {saveError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={handleCloseModal}
          disabled={isSaving}
          className="flex-1"
        >
          ยกเลิก
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isSaving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isSaving && (
                <svg
                  className="w-4 h-4 animate-spin mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              )}
              {isSaving ? "กำลังบันทึก..." : "สำเร็จ"}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการบันทึกข้อมูล</AlertDialogTitle>
              <AlertDialogDescription>
                คุณแน่ใจในการบันทึกการออกกำลังกายวันนี้ใช่ไหม?
                ข้อมูลที่บันทึกแล้วจะไม่สามารถแก้ไขได้
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSaveWorkout}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                บันทึกข้อมูล
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  // Desktop Dialog
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {program?.program_name || "บันทึกการออกกำลังกาย"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 overflow-y-auto max-h-[60vh]">
            {renderExercises()}
          </div>

          <DialogFooter className="border-t border-slate-200 bg-white">
            {renderFooter()}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile Drawer
  return (
    <Drawer open={isOpen} onOpenChange={handleCloseModal}>
      <DrawerContent className="h-[95vh] max-h-[95vh]">
        <DrawerHeader className="border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-semibold text-slate-900">
                {program?.program_name || "บันทึกการออกกำลังกาย"}
              </DrawerTitle>
              <DrawerDescription className="text-slate-600 "></DrawerDescription>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseModal}
              className="h-8 w-8 p-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </DrawerHeader>

        {renderContent()}

        <DrawerFooter className="border-t-0 p-0">{renderFooter()}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default WorkoutLoggingModal;
