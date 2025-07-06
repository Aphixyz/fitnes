import TrainerSidebar from "@/components/navigation/TrainerSidebar";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import { getTrainerById } from "@/actions/trainer/getTrainerData";

export const metadata = {
  title: "ผู้ฝึกสอน | FitTrack",
  description:
    "ระบบจัดการติดตามการออกกำลังกายและโภชนาการส่วนบุคคล - ส่วนผู้ฝึกสอน",
};

export default async function TrainerLayout({ children, params }) {
  // ดึงข้อมูล trainer จาก URL params
  const trainerId = params.trainerId;
  let trainerData = null;

  console.log("Layout params:", params);
  console.log("Trainer ID:", trainerId);

  try {
    if (trainerId) {
      console.log("Fetching trainer data for ID:", trainerId);
      trainerData = await getTrainerById(trainerId);
      console.log("Trainer data loaded:", trainerData);
    } else {
      console.log("No trainer ID found in params");
    }
  } catch (error) {
    console.error("Error fetching trainer data:", error);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
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
