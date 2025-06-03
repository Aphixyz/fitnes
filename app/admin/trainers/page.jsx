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
import LoadingSpinner from "@/app/admin/_components/common/loadingSpinner";
import ViewButton from "@/components/button/Look";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

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
    <div className="p-4 sm:p-6">
      {/* หัวข้อใหญ่ */}
      <div className="text-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">
          รายชื่อผู้ฝึกสอนทั้งหมด
        </h1>
      </div>

      {/* ปุ่มจัดการผู้ใช้ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <ViewButton
          route="/admin/packages"
          buttonText="แพ็คเกจ"
          icon={AcademicCapIcon}
        />
        <ManageUser route="/admin/trainers/manage" />
      </div>

      <div className="flex flex-col items-center gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
          <span>กรองตามสถานะ:</span>
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

        <div className="w-full md:w-auto flex justify-center md:justify-end">
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
      </div>

      {/* ตาราง */}
      {loading ? (
        <LoadingSpinner message="กำลังโหลดข้อมูลผู้ฝึกสอน" />
      ) : (
        <div className="overflow-x-auto">
          <TrainerTable trainers={filteredTrainers} />
        </div>
      )}
    </div>
  );
}
