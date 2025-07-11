"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import exercisesData from "@/data/exercises.json";
import ExerciseSetForm, { ExerciseSetTable } from "./ExerciseSetForm";
import WorkoutSummary from "./WorkoutSummary";
import { insertProgramExerciseSet } from "@/actions/member/my-workout-plans/insertProgramExerciseSet";

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
 * WorkoutLoggingModal - Responsive Dialog/Drawer Component
 * ใช้ Dialog บน desktop และ Drawer บน mobile
 */
const WorkoutLoggingModal = ({ isOpen, onClose, program, workoutPlan }) => {
  const params = useParams();
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

      if (!workoutPlan?.workout_plan_id || !program?.workout_program_id) {
        setSaveError("ไม่พบข้อมูล Workout Plan หรือ Program");
        return;
      }

      // วนลูปข้อมูลใน loggedSets ที่ completed = true
      const completedSets = Object.entries(loggedSets).filter(
        ([key, setData]) => setData.completed
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

        const setDataToSave = {
          member_id: memberId,
          workout_plan_id: workoutPlan.workout_plan_id,
          workout_program_id: program.workout_program_id,
          program_exercise_set_id: programExerciseSetId,
          set_order: set.set_order,
          weight: setData.weight || null,
          reps: setData.reps || null,
          time: setData.time || null,
          distance: setData.distance || null,
          log_date: todayDate,
        };

        // Debug logging สำหรับแต่ละเซต
        console.log("Saving set data:", setDataToSave);

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

      // อาจจะเพิ่ม toast notification ในอนาคต
      alert(`บันทึกข้อมูลการออกกำลังกายสำเร็จ! (${completedSets.length} เซต)`);
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
        return sum + setData.weight * setData.reps;
      }
      return sum;
    }, 0);

    return {
      completedSets,
      totalSets,
      totalWeight,
    };
  };

  // Render Exercise Content
  const renderExercises = () => {
    return (
      <div className="space-y-8">
        {exercises.map((exercise, exerciseIndex) => {
          const stats = getExerciseStats(exercise);

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
              .map((key) => ({ key }));
          };

          const exerciseActiveFields = getAllActiveFields();

          return (
            <div key={exercise.program_exercise_id} className="space-y-4 mb-4">
              {/* Exercise Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {exerciseIndex + 1}. {getExerciseName(exercise.exercise_id)}
                </h3>

                {/* Exercise Details */}
                <div className="bg-white rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    {exercise.exercise_rest && (
                      <div>
                        <span className="text-gray-600">พักระหว่างเซต: </span>
                        <span className="font-medium text-gray-900">
                          {exercise.exercise_rest} วิ
                        </span>
                      </div>
                    )}
                  </div>
                  {exercise.exercise_notes && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">หมายเหตุ: </span>
                      <span className="text-gray-700">
                        {exercise.exercise_notes}
                      </span>
                    </div>
                  )}
                </div>

                {/* Exercise Sets Table */}
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
          );
        })}
      </div>
    );
  };

  // คำนวณสถิติรวม
  const getTotalStats = () => {
    const completedSets = Object.values(loggedSets).filter(
      (setData) => setData.completed
    );
    const totalSets = exercises.reduce(
      (sum, exercise) => sum + (exercise.sets?.length || 0),
      0
    );

    return {
      completedSets: completedSets.length,
      totalSets,
      completion: totalSets > 0 ? (completedSets.length / totalSets) * 100 : 0,
    };
  };

  const totalStats = getTotalStats();

  // Render Content
  const renderContent = () => (
    <>
      {/* Exercises Content */}
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {renderExercises()}
      </div>
    </>
  );

  // Render Footer
  const renderFooter = () => (
    <div className="flex items-center justify-between gap-4">
      {saveError && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200 flex-1">
          {saveError}
        </div>
      )}

      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={handleCloseModal}
          disabled={isSaving}
          className="px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ยกเลิก
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={isSaving || totalStats.completedSets === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && (
                <svg
                  className="w-4 h-4 animate-spin"
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
              {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
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
                className="bg-green-600 hover:bg-green-700"
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
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {program?.program_name || "บันทึกการออกกำลังกาย"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">{renderContent()}</div>

          <DialogFooter>{renderFooter()}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile Drawer
  return (
    <Drawer open={isOpen} onOpenChange={handleCloseModal}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold text-gray-900">
            {program?.program_name || "บันทึกการออกกำลังกาย"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4">{renderContent()}</div>

        <DrawerFooter>{renderFooter()}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default WorkoutLoggingModal;
