import MemberBottomNav from "@/components/navigation/MemberBottomNav";

export const metadata = {
  title: "สมาชิก | FitTrack",
  description:
    "ระบบจัดการติดตามการออกกำลังกายและโภชนาการส่วนบุคคล - ส่วนสมาชิก",
};

export default function MemberLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">{children}</main>
      <MemberBottomNav />
    </div>
  );
}
