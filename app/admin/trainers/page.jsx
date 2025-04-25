"use client";

import { useState, useEffect } from "react";
import { getTrainerData } from "@/actions/admin/getTrainer";
import { getTrainerByStatus } from "@/actions/admin/getTrainerByStatus";
import TrainerTable from "@/app/admin/_components/TrainerTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SearchFilter from "../_components/common/SearchFilter";
import ManageUser from "@/components/button/ManageUser";

export const dynamic = "force-dynamic";

export default function Page() {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch data only once when the component mounts
  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      const data = await getTrainerData();
      setTrainers(data);
      setFilteredTrainers(data); // Set initial filtered trainers data
      setLoading(false);
    };

    fetchTrainers();
  }, []); // Empty dependency array means this effect runs only once

  const handleStatusFilter = async (e) => {
    const value = e.target.value;
    setStatusFilter(value);

    const result =
      value === "" ? await getTrainerData() : await getTrainerByStatus(value);

    setFilteredTrainers(result);
  };

  // const statuses = ["active", "inactive", "pending"];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        {/* ซ้าย: ช่องค้นหา */}
        <div className="w-1/3">
          <SearchFilter
            data={trainers}
            onFilter={setFilteredTrainers}
            placeholder="ค้นหาผู้ฝึกสอน"
            searchFields={[
              "trainer_firstname",
              "trainer_lastname",
              "trainer_id",
            ]}
          />
        </div>

        {/* กลาง: หัวข้อ */}
        <div className="text-center w-1/3">
          <h1 className="text-2xl font-bold">รายชื่อผู้ฝึกสอนทั้งหมด</h1>
        </div>

        {/* ขวา: ปุ่มการจัดการ */}
        <div className="w-1/3 flex justify-end">
          <Link href="/admin/trainers/manage">
            <Button variant="default" className="flex items-center gap-2">
              <ManageUser className="w-4 h-4" />
              การจัดการ
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full flex justify-end mb-4">
        <div className="w-auto">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            กรองตามสถานะ :
            <span className="">
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="p-2 border rounded-md w-auto"
              >
                <option value="">แสดงทั้งหมด</option>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ได้ใช้งาน</option>
                <option value="pending">กำลังรอดำเนินการ</option>
              </select>
            </span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">
          กำลังโหลดข้อมูลผู้ฝึก...
        </div>
      ) : (
        <TrainerTable trainers={filteredTrainers} />
      )}
    </div>
  );
}
