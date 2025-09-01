"use client";

import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import ProgramExerciseList from "./ProgramExerciseList";

export default function ProgramExercisesForm() {
  const { control, getValues, setValue } = useFormContext();
  const { toast } = useToast();

  // Field array สำหรับจัดการรายการท่าออกกำลังกาย
  const { fields, remove, move } = useFieldArray({
    control,
    name: "exercises",
  });

  // Subscribe nested form state เพื่อรับค่า exercises แบบ reactive
  const exercisesValues = useWatch({ control, name: "exercises" });

  // จัดการ Drag-drop exercises
  const handleReorder = useCallback(
    (sourceIndex, destinationIndex) => {
      // เรียก move ของ useFieldArray เพื่อย้ายตำแหน่ง
      move(sourceIndex, destinationIndex);

      // อัพเดต order_index ของทุกท่าให้ตรงกับลำดับใหม่
      const exercises = getValues("exercises");
      exercises.forEach((_, idx) => {
        setValue(`exercises.${idx}.order_index`, idx, { shouldDirty: true });
      });

      toast({
        title: "จัดลำดับท่าสำเร็จ",
        description: "ลำดับท่าออกกำลังกายถูกปรับเปลี่ยนแล้ว",
      });
    },
    [move, getValues, setValue, toast]
  );

  // จัดการการลบท่า
  const handleDelete = useCallback(
    (index) => {
      const exercise = getValues(`exercises.${index}`);
      const exerciseName = exercise ? exercise.name : "ท่าออกกำลังกาย";

      remove(index);

      toast({
        title: "ลบท่าออกกำลังกายสำเร็จ",
        description: `ลบท่า ${exerciseName} ออกจากโปรแกรมเรียบร้อยแล้ว`,
      });
    },
    [remove, getValues, toast]
  );

  // จัดการการอัพเดตท่า
  const handleUpdateExercise = useCallback(
    (index, field, value) => {
      setValue(`exercises.${index}.${field}`, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue]
  );

  // จัดการการเพิ่ม set
  const handleAddSet = useCallback(
    (exerciseIndex, copyFromSet = null) => {
      const sets = getValues(`exercises.${exerciseIndex}.sets`) || [];

      // ถ้าไม่ระบุ set ที่จะ copy ให้ใช้ set ล่าสุดเสมอ
      const sourceSet =
        copyFromSet || (sets.length > 0 ? sets[sets.length - 1] : null);

      // สร้าง set ใหม่
      let newSet;
      if (sourceSet) {
        // ถ้ามี source set ให้ copy ค่า
        newSet = {
          program_exercise_set_id: `temp_set_${Date.now()}`,
          set_order: sets.length + 1,
          weight: sourceSet.weight,
          reps: sourceSet.reps,
          time: sourceSet.time,
          distance: sourceSet.distance,
        };
      } else {
        // ถ้าไม่มี source set ให้สร้างค่าเริ่มต้น
        newSet = {
          program_exercise_set_id: `temp_set_${Date.now()}`,
          set_order: 1,
          weight: 10,
          reps: 10,
          time: null,
          distance: null,
        };
      }

      // เพิ่ม set ใหม่โดยใช้ setValue แทน useFieldArray append
      setValue(`exercises.${exerciseIndex}.sets`, [...sets, newSet], {
        shouldDirty: true,
      });

      const exercise = getValues(`exercises.${exerciseIndex}`);
      toast({
        title: "เพิ่ม Set สำเร็จ",
        description: `เพิ่ม Set ใหม่ให้กับท่า ${exercise.name} เรียบร้อยแล้ว`,
      });
    },
    [getValues, setValue, toast]
  );

  // จัดการการลบ set
  const handleRemoveSet = useCallback(
    (exerciseIndex, setIndex) => {
      const sets = getValues(`exercises.${exerciseIndex}.sets`) || [];

      // ตรวจสอบว่ามีอย่างน้อย 1 set
      if (sets.length <= 1) {
        toast({
          title: "ไม่สามารถลบ Set ได้",
          description: "ต้องมีอย่างน้อย 1 Set ในแต่ละท่า",
          variant: "destructive",
        });
        return;
      }

      // ลบ set ที่ตำแหน่ง setIndex
      const newSets = [...sets];
      newSets.splice(setIndex, 1);

      // อัพเดต set_order ใหม่
      newSets.forEach((set, idx) => {
        set.set_order = idx + 1;
      });

      // อัพเดต sets
      setValue(`exercises.${exerciseIndex}.sets`, newSets, {
        shouldDirty: true,
      });

      const exercise = getValues(`exercises.${exerciseIndex}`);
      toast({
        title: "ลบ Set สำเร็จ",
        description: `ลบ Set ออกจากท่า ${exercise.name} เรียบร้อยแล้ว`,
      });
    },
    [getValues, setValue, toast]
  );

  // จัดการการอัพเดต set
  const handleUpdateSet = useCallback(
    (exerciseIndex, setIndex, field, value) => {
      setValue(`exercises.${exerciseIndex}.sets.${setIndex}.${field}`, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue]
  );

  return (
    <ProgramExerciseList
      // ใช้ exercisesValues จาก useWatch เพื่อให้ interactive form render ทันที
      exercises={exercisesValues}
      onDelete={handleDelete}
      onReorder={handleReorder}
      onUpdateExercise={handleUpdateExercise}
      onAddSet={handleAddSet}
      onRemoveSet={handleRemoveSet}
      onUpdateSet={handleUpdateSet}
    />
  );
}
