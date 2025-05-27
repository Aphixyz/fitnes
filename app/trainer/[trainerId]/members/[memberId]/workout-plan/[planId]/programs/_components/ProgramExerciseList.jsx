"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dumbbell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ProgramExerciseCard from "./ProgramExerciseCard";

export default function ProgramExerciseList({
  exercises,
  onUpdate,
  onDelete,
  onReorder,
}) {
  const [deleteId, setDeleteId] = useState(null);
  const { toast } = useToast();

  // แสดงข้อความเมื่อยังไม่มีท่า
  if (!exercises || exercises.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center bg-muted/30">
        <Dumbbell className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">
          ยังไม่มีท่าออกกำลังกายในโปรแกรมนี้
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          เพิ่มท่าออกกำลังกายจากรายการทางด้านขวา
        </p>
      </div>
    );
  }

  // จัดการการลาก-วาง (Drag and Drop)
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // สร้างลำดับใหม่
    const reorderedExercises = Array.from(exercises);
    const [reorderedItem] = reorderedExercises.splice(sourceIndex, 1);
    reorderedExercises.splice(destinationIndex, 0, reorderedItem);

    // อัพเดตลำดับใหม่
    const updatedExercises = reorderedExercises.map((ex, index) => ({
      ...ex,
      order_index: index,
    }));

    // เรียก callback เพื่ออัพเดทลำดับ
    onReorder(updatedExercises);

    toast({
      title: "จัดลำดับท่าสำเร็จ",
      description: "ลำดับท่าออกกำลังกายถูกปรับเปลี่ยนแล้ว",
    });
  };

  // จัดการการลบ
  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    // เรียก callback เพื่อลบท่า
    onDelete(deleteId);

    toast({
      title: "ลบท่าออกกำลังกายสำเร็จ",
      description: "ลบท่าออกกำลังกายออกจากโปรแกรมเรียบร้อยแล้ว",
    });

    setDeleteId(null);
  };

  // การเลื่อนขึ้น/ลง
  const handleMoveUp = (index) => {
    if (index <= 0) return;

    const exercisesArray = [...exercises];
    [exercisesArray[index - 1], exercisesArray[index]] = [
      exercisesArray[index],
      exercisesArray[index - 1],
    ];

    // อัปเดต order_index
    const updatedExercises = exercisesArray.map((ex, i) => ({
      ...ex,
      order_index: i,
    }));

    onReorder(updatedExercises);
  };

  const handleMoveDown = (index) => {
    if (index >= exercises.length - 1) return;

    const exercisesArray = [...exercises];
    [exercisesArray[index], exercisesArray[index + 1]] = [
      exercisesArray[index + 1],
      exercisesArray[index],
    ];

    // อัปเดต order_index
    const updatedExercises = exercisesArray.map((ex, i) => ({
      ...ex,
      order_index: i,
    }));

    onReorder(updatedExercises);
  };

  // Handler สำหรับการอัพเดตข้อมูลท่า
  const handleUpdateExercise = (exerciseId, data) => {
    onUpdate(exerciseId, data);
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="exercises">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {exercises.map((exercise, index) => (
                <Draggable
                  key={exercise.program_exercise_id.toString()}
                  draggableId={exercise.program_exercise_id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}>
                      <ProgramExerciseCard
                        exercise={exercise}
                        onDelete={handleDelete}
                        onUpdate={handleUpdateExercise}
                        isFirst={index === 0}
                        isLast={index === exercises.length - 1}
                        onMoveUp={() => handleMoveUp(index)}
                        onMoveDown={() => handleMoveDown(index)}
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

      {/* Confirmation dialog for deleting exercise */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบท่าออกกำลังกาย</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบท่าออกกำลังกายนี้ออกจากโปรแกรม?
              การกระทำนี้ไม่สามารถเรียกคืนได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบท่าออกกำลังกาย
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
