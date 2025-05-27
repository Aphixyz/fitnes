"use client";

import WorkoutDayItem from "./WorkoutDayItem";

export default function WorkoutDayList({ days, onUpdateDay, onDeleteDay }) {
  if (!days || days.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-md">
        <p className="text-muted-foreground">
          ยังไม่มีวันฝึกในโปรแกรมนี้ กรุณาเพิ่มวันฝึก
        </p>
      </div>
    );
  }

  return (
    <div>
      {days.map((day, index) => (
        <WorkoutDayItem
          key={day.id}
          day={day}
          index={index}
          onUpdate={onUpdateDay}
          onDelete={onDeleteDay}
        />
      ))}
    </div>
  );
}
