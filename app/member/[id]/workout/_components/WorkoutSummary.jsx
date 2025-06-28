"use client";

import exercisesData from "@/data/exercises.json";

/**
 * WorkoutSummary - Component สำหรับแสดงสรุปข้อมูลการออกกำลังกาย
 */
const WorkoutSummary = ({ exercises, loggedSets, getExerciseStats }) => {
  // ฟังก์ชันหาชื่อ exercise จาก ID
  const getExerciseName = (exerciseId) => {
    const exerciseFound = exercisesData.find((ex) => ex.id === exerciseId);
    return exerciseFound ? exerciseFound.name : exerciseId;
  };

  return (
    <div className="space-y-4">
      {exercises.map((exercise, index) => {
        const stats = getExerciseStats(exercise);
        return (
          <div
            key={exercise.program_exercise_id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">
                {index + 1}. {getExerciseName(exercise.exercise_id)}
              </h4>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-blue-600 font-medium">
                  {stats.totalWeight} กก.
                </span>
                <span className="text-green-600 font-medium">
                  {stats.completedSets}/{stats.totalSets} เซต
                </span>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-300 p-3">
              <p className="text-sm text-gray-500 text-center">
                [ข้อมูลที่บันทึกจะแสดงที่นี่]
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkoutSummary;
