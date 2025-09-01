"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ProgramExerciseCard from "./ProgramExerciseCard";

// เปลี่ยนเป็น Presentational Component รับข้อมูลและ callback จาก props โดยตรง
export default function ProgramExerciseList({
  exercises = [],
  onDelete,
  onReorder,
  onUpdateExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}) {
  const [isDragging, setIsDragging] = useState(false);

  // แสดงข้อความเมื่อยังไม่มีท่า
  if (exercises.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          ยังไม่มีท่าออกกำลังกายในโปรแกรมนี้
        </p>
        <p className="text-muted-foreground text-sm mb-4">
          กรุณาเลือกท่าออกกำลังกายจากรายการทางด้านขวา
        </p>
      </div>
    );
  }

  // จัดการกับการลาก (Drag) และวาง (Drop)
  const handleDragEnd = (result) => {
    setIsDragging(false);

    // ถ้าไม่มีจุดหมายปลายทาง หรือวางที่เดิม ไม่ต้องทำอะไร
    if (!result.destination) return;

    // ถ้าตำแหน่งปลายทางเป็นตำแหน่งเดิม ไม่ต้องทำอะไร
    if (result.destination.index === result.source.index) return;

    // เรียก callback เพื่อจัดเรียงลำดับใหม่
    onReorder(result.source.index, result.destination.index);
  };

  // เริ่มต้นการลาก
  const handleDragStart = () => {
    setIsDragging(true);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <Droppable droppableId="exercises">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-3 ${isDragging ? "opacity-75" : ""}`}
          >
            {exercises.map((exercise, index) => (
              <Draggable
                key={exercise.id || `exercise-${index}`}
                draggableId={exercise.id || `exercise-${index}`}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={snapshot.isDragging ? "opacity-60" : ""}
                  >
                    <ProgramExerciseCard
                      exercise={exercise}
                      onDelete={() => onDelete(index)}
                      onUpdateExercise={(field, value) =>
                        onUpdateExercise(index, field, value)
                      }
                      onAddSet={(copyFromSet) => onAddSet(index, copyFromSet)}
                      onRemoveSet={(setIndex) => onRemoveSet(index, setIndex)}
                      onUpdateSet={(setIndex, field, value) =>
                        onUpdateSet(index, setIndex, field, value)
                      }
                      dragHandleProps={provided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
