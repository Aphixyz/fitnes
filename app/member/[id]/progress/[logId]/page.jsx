import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { formatDuration } from "@/utils/utils"; // Assuming you have a utility function for formatting duration

// Server Actions
import { getProgressMemberData } from "@/actions/member/progression/getProgressMemberData";
import { isActiveSubscription } from "@/actions/member/isActiveSubscription";
import exercisesData from "@/data/exercises.json";

// ฟังก์ชันสำหรับการหา exercise metadata จาก exercise_id
const getExerciseMeta = (exerciseId) => {
  return exercisesData.find((ex) => ex.id === exerciseId) || null;
};

// ฟังก์ชันสำหรับแสดงผล Training Variables ตามประเภทการฝึก
const formatTrainingVariables = (sets, exerciseMeta) => {
  // ตรวจสอบว่ามีข้อมูลประเภทใดบ้าง
  const hasWeight = sets.some((set) => set.actualWeight);
  const hasReps = sets.some((set) => set.actualReps);
  const hasTime = sets.some((set) => set.actualTime);
  const hasDistance = sets.some((set) => set.actualDistance);

  // กำหนดคอลัมน์ที่จะแสดงตามประเภทการฝึก
  let columns = [];
  let columnHeaders = [];

  switch (exerciseMeta.category) {
    case "weight":
      // Weight Training: Sets x (Weight x Reps)
      if (hasWeight && hasReps) {
        columns = ["set", "weight_reps"];
        columnHeaders = ["SET", "WEIGHT x REPS"];
      } else if (hasWeight) {
        columns = ["set", "weight"];
        columnHeaders = ["SET", "WEIGHT"];
      } else if (hasReps) {
        columns = ["set", "reps"];
        columnHeaders = ["SET", "REPS"];
      }
      break;

    case "bodyweight":
      // Bodyweight/Isometric: Sets x Time หรือ Sets x Reps
      if (hasTime) {
        columns = ["set", "time"];
        columnHeaders = ["SET", "TIME"];
      } else if (hasReps) {
        columns = ["set", "reps"];
        columnHeaders = ["SET", "REPS"];
      }
      break;

    case "cardio":
      // Cardio: Distance, Time, Pace
      if (hasDistance && hasTime) {
        columns = ["set", "distance_time"];
        columnHeaders = ["SET", "DISTANCE & TIME"];
      } else if (hasDistance) {
        columns = ["set", "distance"];
        columnHeaders = ["SET", "DISTANCE"];
      } else if (hasTime) {
        columns = ["set", "time"];
        columnHeaders = ["SET", "TIME"];
      }
      break;

    case "hiit":
      // HIIT/Circuit: Time per movement, Rounds
      if (hasTime && hasReps) {
        columns = ["set", "time_reps"];
        columnHeaders = ["SET", "TIME x ROUNDS"];
      } else if (hasTime) {
        columns = ["set", "time"];
        columnHeaders = ["SET", "TIME"];
      } else if (hasReps) {
        columns = ["set", "reps"];
        columnHeaders = ["SET", "ROUNDS"];
      }
      break;

    case "speed":
      // Speed Training: Distance x Time
      if (hasDistance && hasTime) {
        columns = ["set", "distance_time"];
        columnHeaders = ["SET", "DISTANCE x TIME"];
      } else if (hasDistance) {
        columns = ["set", "distance"];
        columnHeaders = ["SET", "DISTANCE"];
      } else if (hasTime) {
        columns = ["set", "time"];
        columnHeaders = ["SET", "TIME"];
      }
      break;

    default:
      // Fallback: แสดงทุกอย่างที่มี
      columns = ["set"];
      columnHeaders = ["SET"];
      if (hasWeight && hasReps) {
        columns.push("weight_reps");
        columnHeaders.push("WEIGHT x REPS");
      } else {
        if (hasWeight) {
          columns.push("weight");
          columnHeaders.push("WEIGHT");
        }
        if (hasReps) {
          columns.push("reps");
          columnHeaders.push("REPS");
        }
      }
      if (hasTime) {
        columns.push("time");
        columnHeaders.push("TIME");
      }
      if (hasDistance) {
        columns.push("distance");
        columnHeaders.push("DISTANCE");
      }
  }

  return { columns, columnHeaders };
};

// ฟังก์ชันสำหรับแสดงค่าในแต่ละคอลัมน์
const renderCellValue = (set, columnType) => {
  switch (columnType) {
    case "set":
      return set.setOrder;

    case "weight":
      const weight = set.actualWeight || 0;
      // แสดงทศนิยมเฉพาะตำแหน่งที่มีค่า
      const weightStr = parseFloat(weight).toString();
      return `${weightStr} กก.`;

    case "reps":
      return `${set.actualReps || 0} ครั้ง`;

    case "time":
      const minutes = Math.floor((set.actualTime || 0) / 60);
      const seconds = (set.actualTime || 0) % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")} นาที`;

    case "distance":
      const km = Math.floor((set.actualDistance || 0) / 1000);
      const m = (set.actualDistance || 0) % 1000;
      if (km > 0) {
        // แสดงทศนิยมเฉพาะตำแหน่งที่มีค่า
        const decimalPart = m.toString().padStart(3, "0");
        const trimmedDecimal = decimalPart.replace(/0+$/, ""); // ลบ 0 ต่อท้าย
        const displayDecimal = trimmedDecimal ? `.${trimmedDecimal}` : "";
        return `${km}${displayDecimal} กิโลเมตร`;
      }
      return `${m} เมตร`;

    case "weight_reps":
      const weightForReps = set.actualWeight || 0;
      // แสดงทศนิยมเฉพาะตำแหน่งที่มีค่า
      const weightStrForReps = parseFloat(weightForReps).toString();
      return `${weightStrForReps} กก. × ${set.actualReps || 0} ครั้ง`;

    case "distance_time":
      const distKm = Math.floor((set.actualDistance || 0) / 1000);
      const distM = (set.actualDistance || 0) % 1000;
      const timeMin = Math.floor((set.actualTime || 0) / 60);
      const timeSec = (set.actualTime || 0) % 60;

      // แสดงทศนิยมเฉพาะตำแหน่งที่มีค่า
      let distanceStr;
      if (distKm > 0) {
        const decimalPart = distM.toString().padStart(3, "0");
        const trimmedDecimal = decimalPart.replace(/0+$/, ""); // ลบ 0 ต่อท้าย
        const displayDecimal = trimmedDecimal ? `.${trimmedDecimal}` : "";
        distanceStr = `${distKm}${displayDecimal} กิโลเมตร`;
      } else {
        distanceStr = `${distM} เมตร`;
      }

      const timeStr = `${timeMin}:${timeSec.toString().padStart(2, "0")}`;
      return `${distanceStr} × ${timeStr} นาที`;

    case "time_reps":
      const tMin = Math.floor((set.actualTime || 0) / 60);
      const tSec = (set.actualTime || 0) % 60;
      return `${tMin}:${tSec.toString().padStart(2, "0")} นาที × ${
        set.actualReps || 0
      } รอบ`;

    default:
      return "-";
  }
};

export default async function WorkoutDetailPage({ params }) {
  const { id, logId } = await params;
  const memberId = parseInt(id);
  const exerciseLogId = parseInt(logId);

  // Check subscription access
  const subscriptionCheck = await isActiveSubscription(memberId);

  if (!subscriptionCheck.success || !subscriptionCheck.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้</p>
          </div>
        </div>
      </div>
    );
  }

  // Get workout data for this logId
  const progressData = await getProgressMemberData(memberId, exerciseLogId);
  const workoutDetails = progressData.data.workoutLogDetail;
  if (!progressData.success || !workoutDetails || workoutDetails.length === 0) {
    return notFound();
  }

  // Group exercises by exercise_id and calculate totals
  const exerciseGroups = {};
  let totalVolume = 0;
  let totalDistance = 0;
  let totalTime = 0;

  workoutDetails.forEach((detail) => {
    const exerciseId = detail.exerciseName; // exerciseName ในที่นี้คือ exercise_id จาก database

    if (!exerciseGroups[exerciseId]) {
      exerciseGroups[exerciseId] = {
        exerciseId,
        programName: detail.programName,
        sets: [],
      };
    }

    exerciseGroups[exerciseId].sets.push({
      setOrder: detail.set_order,
      plannedWeight: detail.planned_weight,
      plannedReps: detail.planned_reps,
      plannedTime: detail.planned_time,
      plannedDistance: detail.planned_distance,
      actualWeight: detail.actual_weight,
      actualReps: detail.actual_reps,
      actualTime: detail.actual_time,
      actualDistance: detail.actual_distance,
    });

    // Calculate totals
    if (detail.actual_weight && detail.actual_reps) {
      totalVolume += detail.actual_weight * detail.actual_reps;
    }
    if (detail.actual_distance) {
      totalDistance += detail.actual_distance;
    }
    if (detail.actual_time) {
      totalTime += detail.actual_time;
    }
  });
  console.log(workoutDetails, "workoutDetails");

  const workoutDetail = workoutDetails[0]; // For basic info like date and program name
  const exerciseCount = Object.keys(exerciseGroups).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <Link
            href={`/member/${memberId}/progress`}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            กลับ
          </Link>
        </div>

        {/* Workout Summary */}
        <div>
          <div className="flex justify-center mb-2 ">
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-2 ">
                {workoutDetail.programName || "ไม่ระบุโปรแกรม"}
              </p>
            </div>
          </div>
          <p className="flex justify-center text-base mb-2">
            {(() => {
              const summaryParts = [];

              // เพิ่มน้ำหนักรวมถ้ามีค่า
              if (totalVolume > 0) {
                summaryParts.push(
                  `น้ำหนักรวม ${parseFloat(totalVolume).toString()} กก.`
                );
              }

              // เพิ่มระยะทางรวมถ้ามีค่า
              if (totalDistance > 0) {
                const distKm = Math.floor(totalDistance / 1000);
                const distM = totalDistance % 1000;
                if (distKm > 0) {
                  const decimalPart = distM.toString().padStart(3, "0");
                  const trimmedDecimal = decimalPart.replace(/0+$/, "");
                  const displayDecimal = trimmedDecimal
                    ? `.${trimmedDecimal}`
                    : "";
                  summaryParts.push(
                    `ระยะทางรวม ${distKm}${displayDecimal} กิโลเมตร`
                  );
                } else {
                  summaryParts.push(`ระยะทางรวม ${distM} เมตร`);
                }
              }

              // เพิ่มเวลารวมถ้ามีค่า
              if (totalTime > 0) {
                const hours = Math.floor(totalTime / 3600);
                const minutes = Math.floor((totalTime % 3600) / 60);
                const seconds = totalTime % 60;

                let timeStr = "";
                if (hours > 0) {
                  timeStr = `${hours}:${minutes
                    .toString()
                    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
                } else {
                  timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
                }
                summaryParts.push(`เวลารวม ${timeStr} นาที`);
              }

              return summaryParts.length > 0
                ? summaryParts.join(" | ")
                : "ไม่มีข้อมูลสรุป";
            })()}
          </p>
        </div>

        {/* Exercise Breakdown */}
        <div>
          <div
            style={{ height: "2px", backgroundColor: "#333", margin: "20px 0" }}
          ></div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            การออกกำลังกายทั้งหมด {exerciseCount} รายการ
          </h2>
          <div className="space-y-6">
            {Object.values(exerciseGroups).map((exercise, index) => {
              const exerciseMeta = getExerciseMeta(exercise.exerciseId);
              const exerciseName = exerciseMeta?.name || exercise.exerciseId;
              const exerciseImage = exerciseMeta?.images?.[0]
                ? `/exercises/${exerciseMeta.images[0]}`
                : "/default-avatar.png";

              const { columns, columnHeaders } = formatTrainingVariables(
                exercise.sets,
                exerciseMeta
              );

              return (
                <div key={index}>
                  <div className="flex items-center gap-4 mb-3">
                    {/* Exercise Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={exerciseImage}
                        alt={exerciseName}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                      />
                    </div>
                    {/* Exercise Name */}
                    <h4 className="font-semibold text-blue-600 text-lg">
                      {exerciseName}
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr className="bg-gray-50">
                          {columnHeaders.map((header, headerIndex) => (
                            <th
                              key={headerIndex}
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {exercise.sets.map((set, setIndex) => (
                          <tr key={setIndex} className="hover:bg-gray-50">
                            {columns.map((columnType, columnIndex) => (
                              <td
                                key={columnIndex}
                                className="px-3 py-2 whitespace-nowrap text-sm text-gray-900"
                              >
                                {renderCellValue(set, columnType)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
