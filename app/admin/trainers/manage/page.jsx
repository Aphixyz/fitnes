"use client";

import { useEffect, useState } from "react";
import { getTrainerData } from "@/actions/admin/getTrainer";
import TrainerTable from "@/app/admin/_components/TrainerTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SearchFilter from "@/app/admin/_components/common/SearchFilter";

export const dynamic = "force-dynamic";

export default function Page() {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);

  useEffect(() => {
    const fetchTrainers = async () => {
      const data = await getTrainerData(); // โหลดข้อมูลจาก Database
      setTrainers(data);
      setFilteredTrainers(data); // ตั้งค่า trainers ที่กรองแล้วด้วยข้อมูลเดิม
    };

    fetchTrainers();
  }, []); // Empty dependency array means this effect runs once when the component mounts

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="ml-4 w-1/3">
          <SearchFilter
            trainers={trainers}
            setFilteredTrainers={setFilteredTrainers}
          />
        </div>
        <Button variant="default">
          <Link href="/admin/trainers/create">เพิ่มผู้ฝึกสอน</Link>
        </Button>
      </div>

      <h1 className="text-center text-2xl font-bold mb-4">
        รายชื่อผู้ฝึกสอนทั้งหมด
      </h1>
      <TrainerTable trainers={filteredTrainers} showActions />
    </div>
  );
}
