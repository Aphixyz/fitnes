import { getTrainerData } from "@/actions/admin/getTrainer";
import TrainerTable from "@/app/admin/_components/TrainerTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page() {
  const trainers = await getTrainerData(); // โหลดข้อมูลจาก Database

  return (
    <div className="p-6">
      <div className="p-6 text-right">
        <Button variant="default">
          <Link href={'/admin/trainers/create'}>จัดการ</Link>
        </Button>
      </div>

      <h1 className="text-center text-2xl font-bold mb-4">
        รายชื่อผู้ฝึกสอนทั้งหมด
      </h1>
      <TrainerTable trainers={trainers} />
      {/* ส่งข้อมูลไปยัง Client Component */}
    </div>
  );
}
