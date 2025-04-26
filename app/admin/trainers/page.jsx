"use client";

import { useState, useEffect } from "react";
import { getTrainerData } from "@/actions/admin/getTrainer";
import { getTrainerByStatus } from "@/actions/admin/getTrainerByStatus";
import TrainerTable from "@/app/admin/_components/TrainerTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SearchFilter from "../_components/common/SearchFilter";
import ManageUser from "@/components/button/ManageUser";
import BackButton from "@/components/button/Back";

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
    setLoading(true); // Set loading state to true when filtering starts

    const result =
      value === "" ? await getTrainerData() : await getTrainerByStatus(value);

    setFilteredTrainers(result);
    setLoading(false); // Set loading state to false after filtering is done
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 items-center mb-4">
        {/* ซ้าย: ช่องค้นหา */}
        <div>
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
        <div className="text-center">
          <h1 className="text-2xl font-bold">รายชื่อผู้ฝึกสอนทั้งหมด</h1>
        </div>

        {/* ขวา: ปุ่มการจัดการ */}
        <div className="flex justify-end">
          <ManageUser route="/admin/trainers/manage" />
        </div>
      </div>

      <div className="grid grid-cols-3 items-center mb-4 w-full">
        {/* ซ้าย: ปุ่ม Back */}
        <div>
          <BackButton />
        </div>

        {/* กลาง: เว้นว่างไว้ให้บาลานซ์ */}
        <div></div>

        {/* ขวา: ตัวกรองสถานะ */}
        <div className="flex justify-end">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <span>กรองตามสถานะ :</span>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="p-2 border rounded-md"
            >
              <option value="">แสดงทั้งหมด</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ไม่ได้ใช้งาน</option>
              <option value="pending">กำลังรอดำเนินการ</option>
            </select>
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
