import MemberSidebar from "@/components/navigation/MemberSidebar";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";

export const metadata = {
  title: "สมาชิก | FitTrack",
  description:
    "ระบบจัดการติดตามการออกกำลังกายและโภชนาการส่วนบุคคล - ส่วนสมาชิก",
};

export default function MemberLayout({ children, params }) {
  // params จะมี id ของ member ที่สามารถนำมาใช้ได้
  // params.id คือค่า ID ของสมาชิกที่เข้าถึงหน้านี้

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <MemberSidebar />

      <div className="flex flex-col flex-1">
        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <ThemeProvider>{children}</ThemeProvider>
          </div>
        </main>

        {/* <footer className="bg-emerald-800 text-white py-4">
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
