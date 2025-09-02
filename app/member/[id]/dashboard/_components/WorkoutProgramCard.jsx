"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, ChevronRight } from "lucide-react";
import Link from "next/link";
import ProgramDialog from "../../program/_components/ProgramDialog";

/**
 * WorkoutProgramCard Component - แสดงโปรแกรมการออกกำลังกาย
 * @param {Object} workoutProgramData - ข้อมูลโปรแกรมการออกกำลังกาย
 * @param {number} memberId - รหัสสมาชิก
 */
export default function WorkoutProgramCard({ workoutProgramData, memberId }) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProgramClick = (program, index) => {
    setSelectedProgram({
      ...program,
      programIndex: index + 1,
      exercises: program.exercises || [], // ProgramDialog ต้องการ exercises array
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProgram(null);
  };

  if (!workoutProgramData?.success || !workoutProgramData?.data) {
    return (
      <Card className="w-full min-h-[120px]">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-4xl mb-2">💪</div>
            <p className="text-gray-500 text-sm">ไม่มีโปรแกรมการออกกำลังกาย</p>
            <Button size="sm" className="mt-4" asChild>
              <Link href={`/member/${memberId}/workout`}>ดูโปรแกรมทั้งหมด</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // เรียงลำดับโปรแกรมตาม order_index
  const sortedPrograms =
    workoutProgramData.data.availablePrograms?.sort(
      (a, b) => (a.order_index || 0) - (b.order_index || 0)
    ) || [];

  // ถ้าไม่มีโปรแกรม
  if (sortedPrograms.length === 0) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-2">🫩</div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-0">
          ไม่มีแผนออกกำลังกาย
        </h3>
        <p className="text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed">
          เทรนเนอร์ยังไม่ได้สร้างแผนออกกำลังกายให้คุณ
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sortedPrograms.map((program, index) => (
          <Card
            key={program.workout_program_id}
            className="w-full hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200"
            onClick={() => handleProgramClick(program, index)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Left Side - Icon and Content */}
                <div className="flex items-center space-x-4 flex-1">
                  {/* Dumbbell Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>

                  {/* Program Info */}
                  <div className="flex-1 min-w-0">
                    {/* Program Name (Title) */}
                    <h3 className="text-base md:text-lg font-bold text-gray-900 truncate mb-1">
                      {program.program_name || "โปรแกรมการออกกำลังกาย"}
                    </h3>

                    {/* Program Note (Subtitle) */}
                    <p className="text-sm text-gray-600 truncate">
                      {program.program_note || "โปรแกรมการออกกำลังกาย"}
                    </p>
                  </div>
                </div>

                {/* Right Side - Arrow */}
                <div className="flex-shrink-0 ml-4">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Program Dialog Modal */}
      {selectedProgram && (
        <ProgramDialog
          program={selectedProgram}
          programIndex={selectedProgram.programIndex}
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}
