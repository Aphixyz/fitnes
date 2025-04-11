import { getMemberWithTrainer } from "@/actions/admin/member/getMemberWithTrainer";
import MemberTable from "../_components/member/table";

export default async function MemberPage() {
  const res = await getMemberWithTrainer();

  // console.log("API Response:", res);

  if (!res.success) {
    return (
      <div className="p-4 text-red-600">
        เกิดข้อผิดพลาดในการโหลดข้อมูลสมาชิก
      </div>
    );
  }

  // console.log("Members data:", res.data);
  return (
    
    <div className="p-6">
      <h1 className="text-center text-2xl font-bold mb-4">
        รายชื่อสมาชิกทั้งหมด
      </h1>
      <MemberTable members={res.data} />
    </div>
  );
}
