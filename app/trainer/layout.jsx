import TrainerSidebar from "@/components/navigation/TrainerSidebar";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";

export const metadata = {
  title: "ผู้ฝึกสอน | FitTrack",
  description:
    "ระบบจัดการติดตามการออกกำลังกายและโภชนาการส่วนบุคคล - ส่วนผู้ฝึกสอน",
};

export default function TrainerLayout({ children, params }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <TrainerSidebar />

      <div className="flex flex-col flex-1">
        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <ThemeProvider>{children}</ThemeProvider>
          </div>
        </main>

        {/* <footer className="bg-indigo-800 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm">
              &copy; {new Date().getFullYear()} FitTrack -
              ระบบติดตามการออกกำลังกายและโภชนาการส่วนบุคคล
            </div>
          </div>
        </footer> */}
      </div>
    </div>
  );
}
