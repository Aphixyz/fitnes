export const metadata = {
  title: "ลงทะเบียนข้อมูลเบื้องต้น | FitTrack",
  description: "กรอกข้อมูลเบื้องต้นสำหรับการใช้งาน FitTrack",
};

export default function OnboardingLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Full screen layout สำหรับ onboarding - ไม่มี navigation bar */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}