"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import ExerciseList from "@/app/member/components/workout/ExerciseList";
import exercisesData from "@/data/exercises.json";

/**
 * ProgramDialog - Client Component
 * แสดงรายละเอียด program และ exercise list ในรูปแบบ drawer สำหรับ mobile
 */
const ProgramDialog = ({ program, programIndex, isOpen, onClose }) => {
  // ฟังก์ชันหา meta จาก exercises.json
  const getMeta = (exerciseId) => {
    return exercisesData.find((ex) => ex.id === exerciseId) || {};
  };
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] overflow-hidden">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
              {programIndex}
            </span>
            <span className="text-lg font-semibold text-gray-900">
              {program.program_name}
            </span>
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Program Note */}
          {program.program_note && (
            <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <p className="text-gray-700 text-sm leading-relaxed">
                {program.program_note}
              </p>
            </div>
          )}

          {/* Exercises List as Cards */}
          {program.exercises.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">
                ยังไม่มี exercises ใน program นี้
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Exercise Cards */}
              <div className="space-y-3">
                {program.exercises.map((exercise, index) => {
                  const meta = getMeta(exercise.exercise_id);
                  return (
                    <div key={exercise.exercise_id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        {/* Exercise Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={`/exercises/${meta.images?.[0] || "default-exercise.jpg"}`}
                            alt={meta.name || exercise.exercise_id}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            onError={(e) => {
                              e.target.src = "/default-avatar.png"; // fallback image
                            }}
                          />
                        </div>
                        
                        {/* Exercise Info */}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-semibold text-gray-900 mb-1">
                            {meta.name || exercise.exercise_id}
                          </h5>
                        
                          {/* Exercise Details */}
                          <div className="space-y-1">
                            {exercise.sets && Array.isArray(exercise.sets) ? (
                              <div className="mt-2 space-y-1">
                                {exercise.sets.map((set, idx) => (
                                  <p key={set.program_exercise_set_id || idx} className="text-xs text-gray-600">
                                    <span className="font-medium">เซต {set.set_order}:</span>{" "}
                                    {set.weight && `${set.weight} กก.`}{" "}
                                    {set.reps && `x ${set.reps} ครั้ง`}{" "}
                                    {set.time && `${set.time} วินาที`}{" "}
                                    {set.distance && `${set.distance} เมตร`}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <>
                                {exercise.sets && (
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">เซต:</span> {exercise.sets}
                                  </p>
                                )}
                                {exercise.reps && (
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">รอบ:</span> {exercise.reps}
                                  </p>
                                )}
                                {exercise.weight && (
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">น้ำหนัก:</span> {exercise.weight} กก.
                                  </p>
                                )}
                                {exercise.duration && (
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">ระยะเวลา:</span> {exercise.duration}
                                  </p>
                                )}
                                {exercise.rest_time && (
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">พัก:</span> {exercise.rest_time}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                          
                          {/* Exercise Notes */}
                          {exercise.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                              <span className="font-medium">หมายเหตุ:</span> {exercise.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ProgramDialog;
