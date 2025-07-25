"use client";

import React from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function PastWorkoutLogs({ workoutSummary, memberId }) {
  const router = useRouter();

  // Handle workout card click
  const handleWorkoutClick = (logId) => {
    router.push(`/member/${memberId}/profile/workout/${logId}`);
  };
  // Helper function to format time in seconds to readable format
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return "0 นาที";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours} ชม. ${minutes} นาที`;
    } else if (minutes > 0) {
      return `${minutes} นาที`;
    } else {
      return `${remainingSeconds} วินาที`;
    }
  };

  // Helper function to format volume
  const formatVolume = (volume) => {
    if (!volume || volume === 0) return "0 kg";
    return `${volume.toLocaleString()} kg`;
  };

  // Helper function to format distance
  const formatDistance = (distance) => {
    if (!distance || distance === 0) return "0 km";
    return `${distance.toLocaleString()} km`;
  };

  // Group workouts by date
  const groupedWorkouts =
    workoutSummary?.reduce((acc, workout) => {
      const date = workout.log_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(workout);
      return acc;
    }, {}) || {};

  if (!workoutSummary || workoutSummary.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          ประวัติการออกกำลังกาย
        </h2>
        <div className="text-center py-8 text-gray-500">
          <p>ยังไม่มีประวัติการออกกำลังกาย</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        ประวัติการออกกำลังกาย
      </h2>

      <div className="space-y-6">
        {Object.entries(groupedWorkouts)
          .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
          .map(([date, workouts]) => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-700">
                  {format(new Date(date), "EEEE, dd MMMM", { locale: th })}
                </h3>
                <div className="text-sm text-gray-500">
                  {format(new Date(date), "HH:mm")}
                </div>
              </div>

              {/* Workout Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workouts.map((workout, index) => (
                  <div
                    key={`${workout.exercise_log_id}-${index}`}
                    onClick={() => handleWorkoutClick(workout.exercise_log_id)}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    {/* Workout Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gray-700 rounded-lg p-3">
                        {/* Upper body icon representation */}
                        <svg
                          className="w-8 h-8 text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {workout.totalExercises || 0}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                          EXERCISES
                        </div>
                      </div>
                    </div>

                    {/* Program Name */}
                    <h4 className="text-lg font-bold mb-2 text-white">
                      {workout.ProgramName || "ไม่ระบุโปรแกรม"}
                    </h4>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {/* Volume */}
                      <div>
                        <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-1">
                          VOLUME
                        </div>
                        <div className="text-lg font-bold">
                          {formatVolume(workout.totalVolume)}
                        </div>
                      </div>

                      {/* Distance */}
                      {workout.totalDistance > 0 && (
                        <div>
                          <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-1">
                            DISTANCE
                          </div>
                          <div className="text-lg font-bold">
                            {formatDistance(workout.totalDistance)}
                          </div>
                        </div>
                      )}

                      {/* Time */}
                      <div>
                        <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-1">
                          TIME
                        </div>
                        <div className="text-lg font-bold">
                          {formatTime(workout.totalTimeSeconds)}
                        </div>
                      </div>
                    </div>

                    {/* Summary Description */}
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <p className="text-sm text-gray-300">
                        {workout.totalExercises} แบบฝึกหัด |{" "}
                        {formatVolume(workout.totalVolume)}
                        {workout.totalDistance > 0 &&
                          `, ${formatDistance(workout.totalDistance)}`}
                        , {formatTime(workout.totalTimeSeconds)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
