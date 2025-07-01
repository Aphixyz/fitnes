"use client";

import { fetchWorkoutProgramId } from "@/lib/db/fetchWorkoutProgramId";
import { fetchProgramExercises } from "@/lib/db/fetchProgramExercises";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WorkoutProgramEditor from "../_components/WorkoutProgramEditor";
import Link from "next/link";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as React from "react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Client Component สำหรับแสดงหน้ารายละเอียดโปรแกรม
 */
export default function ProgramPage({ params, searchParams }) {
  const { trainerId, memberId, planId, programId } = React.use(params);
  const { isNewProgram } = React.use(searchParams);
  const isNew = isNewProgram === "true";
  const router = useRouter();
  const { toast } = useToast();

  // สถานะสำหรับการแสดงปุ่มบันทึก
  const [isFormDirty, setIsFormDirty] = useState(false); //มีการแก้ไขหรือยัง
  const [isSubmitting, setIsSubmitting] = useState(false); //กำลังบันทึกหรือยัง
  const [editorRef, setEditorRef] = useState(null); //อ้างอิงถึงฟังก์ชันบันทึก handleSubmit

  // ฟังก์ชันสำหรับรับ props จาก WorkoutProgramEditor
  const handleEditorState = (dirty, submitting, submitFn) => {
    setIsFormDirty(dirty);
    setIsSubmitting(submitting);
    setEditorRef(() => submitFn);
  };

  // ฟังก์ชันสำหรับบันทึกข้อมูลและ Redirect
  const handleSaveClick = async () => {
    if (editorRef) {
      try {
        // รอให้ save/update เสร็จสมบูรณ์
        await editorRef();
        // แสดง Toast แจ้งเตือนว่าบันทึกสำเร็จแล้วและกำลังเปลี่ยนหน้า
        toast({
          title: "บันทึกและเปลี่ยนหน้า",
          description: "กำลังกลับไปยังหน้ารายการโปรแกรม...",
        });

        // ล่าช้าเล็กน้อยเพื่อให้ toast แสดงก่อนเปลี่ยนหน้า
        setTimeout(() => {
          // Redirect ไปยังหน้าแผนออกกำลังกาย
          router.push(
            `/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}`
          );
        }, 1000);
      } catch (error) {
        console.error("Error during save and redirect:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถบันทึกและเปลี่ยนหน้าได้ กรุณาลองอีกครั้ง",
          variant: "destructive",
        });
      }
    }
  };

  // ดึงข้อมูลโปรแกรมและท่าออกกำลังกาย (เรียกผ่าน Server Component)
  const [programData, setProgramData] = useState({
    workoutProgram: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูลโปรแกรม
        const programResult = await fetchWorkoutProgramId(programId, trainerId);

        if (!programResult.success) {
          throw new Error(programResult.message);
        }

        // ดึงข้อมูลท่าออกกำลังกาย
        const exercisesResult = await fetchProgramExercises(
          programId,
          trainerId
        );
        const programExercises = exercisesResult.success
          ? exercisesResult.data
          : [];

        // จัดเตรียมข้อมูลโปรแกรม
        const workoutProgram = {
          ...programResult.program,
          exercises: programExercises.map((exercise) => {
            return {
              ...exercise,
              sets: exercise.sets.map((set) => ({
                ...set,
                program_exercise_set_id: set.program_exercise_set_id,
                set: set.set_order || set.set,
                weight: set.weight,
                reps: set.reps,
                time: set.time,
                distance: set.distance,
              })),
            };
          }),
        };

        setProgramData({
          workoutProgram,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setProgramData({
          workoutProgram: null,
          isLoading: false,
          error: error.message,
        });
      }
    };

    fetchData();
  }, [programId, trainerId]);

  // ถ้ากำลังโหลดข้อมูล
  if (programData.isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ถ้ามีข้อผิดพลาด
  if (programData.error) {
    notFound();
  }

  const { workoutProgram } = programData;

  // หัวข้อโปรแกรม
  const programTitle = isNew ? "โปรแกรมใหม่" : workoutProgram.program_name;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{programTitle}</h2>
          <p className="text-muted-foreground">
            สร้างและปรับแต่งโปรแกรมออกกำลังกายสำหรับสมาชิก
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}`}
          >
            <Button variant="outline" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" />
              กลับไปหน้าโปรแกรมทั้งหมด
            </Button>
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Main Content */}
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <WorkoutProgramEditor
            workoutProgram={workoutProgram}
            workoutProgramId={parseInt(programId)}
            workoutPlanId={parseInt(planId)}
            trainerId={parseInt(trainerId)}
            memberId={parseInt(memberId)}
            onStateChange={handleEditorState}
          />
        </CardContent>
      </Card>

      {/* Sticky Save Button */}
      {isFormDirty && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-10 shadow-md">
          <div className="container max-w-7xl mx-auto">
            <Button
              onClick={handleSaveClick}
              disabled={isSubmitting}
              className="w-full md:w-auto md:float-right"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  บันทึกการเปลี่ยนแปลง
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
