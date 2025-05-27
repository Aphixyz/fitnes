import { fetchWorkoutProgramId } from "@/lib/db/fetchWorkoutProgramId";
import { fetchProgramExercises } from "@/lib/db/fetchProgramExercises";
import { notFound } from "next/navigation";
import WorkoutProgramEditor from "../_components/WorkoutProgramEditor";

/**
 * Server Component สำหรับแสดงหน้ารายละเอียดโปรแกรม
 */
export default async function ProgramPage({ params, searchParams }) {
  const { trainerId, memberId, planId, programId } = await params;
  const isNew = (await searchParams).isNewProgram === "true";

  // ดึงข้อมูลโปรแกรม
  const programResult = await fetchWorkoutProgramId(programId, trainerId);

  // หากไม่พบข้อมูลโปรแกรม ให้แสดงหน้า 404
  if (!programResult.success) {
    console.error("Program not found:", programResult.message);
    notFound();
  }

  // ดึงข้อมูลท่าออกกำลังกายในโปรแกรม
  const exercisesResult = await fetchProgramExercises(programId, trainerId);
  const programExercises = exercisesResult.success ? exercisesResult.data : [];

  // ส่ง props ไปยัง WorkoutProgramEditor client component
  return (
    <WorkoutProgramEditor
      initialProgram={programResult.program}
      programExercises={programExercises}
      isNew={isNew}
      trainerId={trainerId}
      memberId={memberId}
      planId={planId}
      programId={programId}
    />
  );
}
