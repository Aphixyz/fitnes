"use client";

import { useEffect, useRef } from "react";
import ExerciseCard from "./ExerciseCard";
import { Loader2 } from "lucide-react";

export default function ExerciseList({
  exercises = [],
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  loaderRef,
  totalCount = 0,
  onSelectExercise,
  height,
}) {
  const scrollContainerRef = useRef(null);

  // ตั้งค่า loader สำหรับ infinite scroll
  const loadMoreRef = useRef(null);
  useEffect(() => {
    if (loaderRef) {
      loadMoreRef.current = loaderRef.current;
    }
  }, [loaderRef]);

  // แสดงข้อความเวลาไม่มีข้อมูล
  if (!isLoading && (!exercises || exercises.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-muted-foreground">ไม่พบท่าออกกำลังกาย</p>
        <p className="text-sm text-muted-foreground mt-1">
          ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto pr-1 min-h-0"
      style={{ height: height || "auto" }}
      ref={scrollContainerRef}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </div>
      )}

      {/* Exercise grid */}
      {!isLoading && exercises.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSelectExercise={() => onSelectExercise(exercise)}
            />
          ))}
        </div>
      )}

      {/* Load more indicator */}
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center items-center py-4">
          {isLoadingMore ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <span className="text-xs text-muted-foreground">
              เลื่อนลงเพื่อโหลดเพิ่ม
            </span>
          )}
        </div>
      )}
    </div>
  );
}
