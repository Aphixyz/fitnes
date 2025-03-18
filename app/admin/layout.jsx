import AdminNavbar from "@/components/navigation/AdminNavbar";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";

export const metadata = {
  title: "ผู้ดูแลระบบ | FitTrack",
  description:
    "ระบบจัดการติดตามการออกกำลังกายและโภชนาการส่วนบุคคล - ส่วนผู้ดูแลระบบ",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />

      <main className="flex-1 ">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <ThemeProvider>{children}</ThemeProvider>
        </div>
      </main>

      <footer className="bg-blue-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm">
            &copy; {new Date().getFullYear()} FitTrack -
            ระบบติดตามการออกกำลังกายและโภชนาการส่วนบุคคล
          </div>
        </div>
      </footer>
    </div>
  );
}
