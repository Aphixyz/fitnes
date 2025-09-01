import TrainerSidebar from "@/components/navigation/TrainerSidebar";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import { getTrainerById } from "@/actions/trainer/getTrainerData";

export default async function TrainerLayout({ children, params }) {
  // ดึงข้อมูล trainer จาก URL params
  const trainerId = (await params).trainerId;
  let trainerData = null;
  // ดึงข้อมูล trainer จากฐานข้อมูล
  try {
    trainerData = await getTrainerById(trainerId);
  } catch (error) {
    console.error("Error fetching trainer data:", error);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen ">
      <TrainerSidebar user={trainerData} />

      <div className="flex flex-col flex-1">
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <ThemeProvider>{children}</ThemeProvider>
          </div>
        </main>
      </div>
    </div>
  );
}
