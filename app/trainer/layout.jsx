import TrainerNavbar from "@/components/navigation/TrainerNavbar";

export const metadata = {
  title: "ผู้ฝึกสอน | FitTrack",
  description: "ระบบจัดการติดตามการออกกำลังกายและโภชนาการส่วนบุคคล - ส่วนผู้ฝึกสอน",
};

export default function TrainerLayout({ children, params }) {
  // params จะมี id ของ trainer ที่สามารถนำมาใช้ได้
  // params.id คือค่า ID ของผู้ฝึกสอนที่เข้าถึงหน้านี้
  
  return (
    <div className="min-h-screen flex flex-col">
      <TrainerNavbar />
      
      <main className="flex-1 ">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <ThemeProvider>{children}</ThemeProvider>
        </div>
      </main>
      
      <footer className="bg-indigo-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm">
            &copy; {new Date().getFullYear()} FitTrack - ระบบติดตามการออกกำลังกายและโภชนาการส่วนบุคคล
          </div>
        </div>
      </footer>
    </div>
  );
}