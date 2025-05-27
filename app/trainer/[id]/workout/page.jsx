import { getWorkoutPlanByTrainerId } from "@/actions/trainer/workout/workout_plan/getWorkoutPlanByTrainerId";
import WorkoutPlanTable from "@/app/trainer/[id]/workout/_components/WorkoutPlanTable";
import CreateWorkoutButton from "@/app/trainer/[id]/workout/_components/CreateWorkoutButton";

export default async function WorkoutPlansPage({ params }) {
  const trainerId = Number(params.id);
  const response = await getWorkoutPlanByTrainerId(trainerId);
  const plans = response.success ? response.plans : [];

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Workout Programs</h1>
        {/* Use the client component wrapper instead */}
        <CreateWorkoutButton trainerId={trainerId} />
      </header>

      {/* ตารางรายการ Plan */}
      <WorkoutPlanTable plans={plans} />
    </div>
  );
}