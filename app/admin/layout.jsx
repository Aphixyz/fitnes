import AdminSidebar from "@/components/navigation/AdminSidebar";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";

export const metadata = {
  title: "ผู้ดูแลระบบ | FitTrack",
  description:
    "ระบบจัดการติดตามการออกกำลังกายและโภชนาการส่วนบุคคล - ส่วนผู้ดูแลระบบ",
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <AdminSidebar />
      
      <div className="flex flex-col flex-1">
        <main className="">
          <div className="max-w-7xl mx-auto">
            <ThemeProvider>{children}</ThemeProvider>
          </div>
        </main>

        {/* <footer className="bg-blue-800 text-white py-4 mt-auto">
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