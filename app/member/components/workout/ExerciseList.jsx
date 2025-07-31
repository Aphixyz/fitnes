"use client";

import exercisesData from "@/data/exercises.json";
import {
  formatTimeThai,
  formatDistanceThai,
  formatWeight,
} from "@/utils/utils.js";

const ExerciseList = ({ exercises }) => {
  // ฟังก์ชันหา meta จาก exercises.json
  const getMeta = (exerciseId) => {
    return exercisesData.find((ex) => ex.id === exerciseId) || {};
  };

  // ฟังก์ชันสร้างข้อความแสดง sets/reps/weight/time/distance แบบยืดหยุ่น
  const getSetInfo = (sets) => {
    if (!sets || sets.length === 0) return "ไม่มีข้อมูล";

    const setCount = sets.length;
    const firstSet = sets[0];

    let info = `${setCount} เซ็ต`;
    const details = [];

    // เพิ่ม reps ถ้ามี
    if (firstSet.reps) {
      details.push(`${firstSet.reps} รอบ`);
    }

    // เพิ่ม weight ถ้ามี (จัดรูปแบบทศนิยม)
    if (firstSet.weight !== undefined && firstSet.weight !== null) {
      const weightDisplay = formatWeight(firstSet.weight);
      details.push(weightDisplay);
    }

    // เพิ่ม time ถ้ามี (แปลงเป็นภาษาไทย)
    if (firstSet.time) {
      const timeDisplay = formatTimeThai(firstSet.time);
      details.push(timeDisplay);
    }

    // เพิ่ม distance ถ้ามี (แปลงเป็นภาษาไทย)
    if (firstSet.distance) {
      const distanceDisplay = formatDistanceThai(firstSet.distance);
      details.push(distanceDisplay);
    }

    // รวมข้อมูลทั้งหมด
    if (details.length > 0) {
      info += ` × ${details.join(" × ")}`;
    }

    return info;
  };

  return (
    <div className="space-y-3">
      {exercises.map((exercise) => {
        const meta = getMeta(exercise.exercise_id);
        const setInfo = getSetInfo(exercise.sets);

        return (
          <div
            key={exercise.program_exercise_id}
            className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
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

            {/* Exercise Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                {meta.name || exercise.exercise_id}
              </h4>
              <p className="text-xs text-gray-500">{setInfo}</p>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default ExerciseList;
