"use client";

import { memo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2 } from "lucide-react";
import ExerciseCard from "./ExerciseCard";

const ExerciseList = memo(
  ({
    exercises,
    isLoading,
    hasMore,
    totalCount,
    isLoadingMore,
    loaderRef,
    onSelectExercise,
    height = "calc(100vh - 200px)",
  }) => {
    const parentRef = useRef(null);

    // ตั้งค่า virtualizer
    const rowVirtualizer = useVirtualizer({
      count: exercises.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 72,
      overscan: 5,
    });

    // กรณีไม่มีข้อมูล
    if (exercises.length === 0 && !isLoading) {
      return (
        <div className="text-center py-8 text-muted-foreground border rounded-md h-full flex items-center justify-center">
          <p>ไม่พบท่าออกกำลังกาย</p>
        </div>
      );
    }

    return (
      <div
        ref={parentRef}
        className="overflow-auto border rounded-md flex-1"
        style={{ height }}
      >
        {isLoading && exercises.length === 0 ? (
          <div className="flex justify-center items-center py-8 h-full">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>กำลังโหลด...</span>
          </div>
        ) : (
          <>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const exercise = exercises[virtualRow.index];
                return (
                  <div
                    key={`${exercise.id}-${virtualRow.index}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <ExerciseCard
                      exercise={exercise}
                      onSelect={() => onSelectExercise(exercise)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Loader for infinite scrolling */}
            {hasMore && (
              <div
                ref={loaderRef}
                className="flex justify-center items-center p-4"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      กำลังโหลดเพิ่มเติม...
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    เลื่อนลงเพื่อโหลดเพิ่มเติม
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

ExerciseList.displayName = "ExerciseList";

export default ExerciseList;
