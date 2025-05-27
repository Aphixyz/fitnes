"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { saveProgram } from "@/actions/trainer/workout/workout_program/saveProgram";
import DetailForm from "./DetailForm";
import ProgramForm from "./ProgramForm";
import ProgramEditor from "./ProgramEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

export default function WorkoutProgramEditor({
  initialProgram,
  programExercises,
  isNew,
  trainerId,
  memberId,
  planId,
  programId,
}) {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [program, setProgram] = useState({
    workout_program_id: programId,
    trainer_id: trainerId,
    program_name: initialProgram?.program_name || "Untitled Program",
    program_note: initialProgram?.program_note || "",
  });
  const [exercises, setExercises] = useState(programExercises || []);
  const [isSaving, setIsSaving] = useState(false);

  // จัดการการเปลี่ยนแปลงข้อมูลโปรแกรม
  const handleProgramChange = (e) => {
    const { name, value } = e.target;
    setProgram((prev) => ({ ...prev, [name]: value }));
  };

  // จัดการท่าออกกำลังกาย
  const handleAddExercise = (newExercise) => {
    // หาลำดับสูงสุดปัจจุบันและเพิ่มอีก 1
    const maxOrder = exercises.length
      ? Math.max(...exercises.map((e) => e.order_index || 0)) + 1
      : 0;

    // สร้างข้อมูลท่าออกกำลังกายใหม่
    const exerciseToAdd = {
      program_exercise_id: Date.now() * -1, // temp ID
      exercise_id: newExercise.exercise_id,
      name: newExercise.name,
      primaryMuscles: newExercise.primaryMuscles || [],
      category: newExercise.category,
      equipment: newExercise.equipment,
      order_index: maxOrder,
      rest: "00:01:00",
      notes: "",
      sets: [
        { set_order: 1, weight: null, reps: 10, time: null, distance: null },
      ],
    };

    setExercises((prev) => [...prev, exerciseToAdd]);

    toast({
      title: "เพิ่มท่าออกกำลังกาย",
      description: `เพิ่มท่า ${newExercise.name} เข้าโปรแกรมเรียบร้อยแล้ว`,
    });
  };

  const handleRemoveExercise = (index) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSet = (exerciseIndex) => {
    setExercises((prev) => {
      const updated = [...prev];
      const currentSets = updated[exerciseIndex].sets || [];
      const nextSetOrder =
        currentSets.length > 0
          ? Math.max(...currentSets.map((s) => s.set_order)) + 1
          : 1;

      updated[exerciseIndex].sets = [
        ...currentSets,
        {
          set_order: nextSetOrder,
          weight: currentSets[currentSets.length - 1]?.weight || null,
          reps: currentSets[currentSets.length - 1]?.reps || 10,
          time: null,
          distance: null,
        },
      ];

      return updated;
    });
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter(
        (_, i) => i !== setIndex
      );
      return updated;
    });
  };

  const handleUpdateSet = (exerciseIndex, setIndex, field, value) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex].sets[setIndex][field] = value;
      return updated;
    });
  };

  const handleUpdateExercise = (exerciseIndex, field, value) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex][field] = value;
      return updated;
    });
  };

  const handleReorderExercises = (fromIndex, toIndex) => {
    setExercises((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);

      return updated.map((item, index) => ({
        ...item,
        order_index: index,
      }));
    });
  };

  // บันทึกโปรแกรมทั้งหมด
  const handleSaveProgram = async () => {
    try {
      setIsSaving(true);

      const programData = {
        ...program,
        exercises: exercises.map((ex, index) => ({
          exercise_id: ex.exercise_id,
          order_index: index,
          rest: ex.rest,
          notes: ex.notes || "",
          sets: ex.sets || [],
        })),
      };

      const result = await saveProgram(programData);

      if (result.success) {
        toast({
          title: "บันทึกสำเร็จ",
          description: "บันทึกโปรแกรมเรียบร้อยแล้ว",
        });

        if (isNew) {
          router.replace(
            `/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}/programs/${programId}`
          );
        }
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message || "ไม่สามารถบันทึกโปรแกรมได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving program:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกโปรแกรมได้",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    router.push(
      `/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}`
    );
  };

  return (
    <div className="space-y-6">
      {/* หัวข้อและปุ่มกลับ/บันทึก */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isNew ? "สร้างโปรแกรมย่อยใหม่" : "แก้ไขโปรแกรมย่อย"}
          </h1>
          <p className="text-muted-foreground">
            {isNew
              ? "กรอกข้อมูลโปรแกรมย่อยใหม่"
              : "แก้ไขรายละเอียดและท่าออกกำลังกายในโปรแกรมย่อย"}
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
          <Button onClick={handleSaveProgram} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* คอลัมน์ซ้าย - ข้อมูลและท่าออกกำลังกาย */}
        <div className="md:col-span-8 space-y-6">
          {/* DetailForm Component */}
          <DetailForm program={program} onProgramChange={handleProgramChange} />

          {/* ProgramForm Component */}
          <ProgramForm
            exercises={exercises}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
            onUpdateSet={handleUpdateSet}
            onUpdateExercise={handleUpdateExercise}
            onRemoveExercise={handleRemoveExercise}
            onReorderExercises={handleReorderExercises}
          />
        </div>

        {/* คอลัมน์ขวา - ExercisePicker */}
        <div className="md:col-span-4">
          <div className="sticky top-6">
            <ProgramEditor
              workoutProgramId={programId}
              trainerId={trainerId}
              onExerciseAdded={handleAddExercise}
            />
          </div>
        </div>
      </div>
    </div>
  );
}