"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import ExerciseList from "@/app/member/components/workout/ExerciseList";

/**
 * ProgramDialog - Client Component
 * แสดงรายละเอียด program และ exercise list ในรูปแบบ dialog modal
 */
const WorkoutProgramDialog = ({
  program,
  programIndex,
  isOpen,
  onClose,
  onStartWorkout,
}) => {
  const handleStartWorkout = () => {
    // เรียกใช้ onStartWorkout prop แทน console.log
    if (onStartWorkout) {
      onStartWorkout();
    }
    onClose(); // ปิด dialog หลังจากคลิกปุ่ม
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] sm:max-h-[85vh] md:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-3 sm:space-y-4">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium">
                {programIndex}
              </span>
              <span className="text-lg sm:text-xl font-semibold">
                {program.program_name}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Program Note */}
          {program.program_note && (
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium text-sm sm:text-base">
                หมายเหตุโปรแกรม:{" "}
              </span>
              <span className="text-gray-900 text-sm sm:text-base leading-relaxed">
                {program.program_note}
              </span>
            </div>
          )}

          {/* Exercises List */}
          {program.exercises.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-500 text-sm sm:text-base">
                ยังไม่มี exercises ใน program นี้
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-base sm:text-lg font-semibold">
                รายการท่าออกกำลังกาย
              </h4>
              <ExerciseList exercises={program.exercises} />
            </div>
          )}

          {/* Start Workout Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={handleStartWorkout}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              เริ่มบันทึกการออกกำลังกาย
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutProgramDialog;
