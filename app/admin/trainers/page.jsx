"use client";

import { useState, useEffect } from "react";
import { getTrainerData } from "@/actions/admin/getTrainer";
import { getTrainerByStatus } from "@/actions/admin/getTrainerByStatus";
import TrainerTable from "@/app/admin/_components/TrainerTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SearchFilter from "../_components/common/SearchFilter";

export const dynamic = "force-dynamic";

export default function Page() {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch data only once when the component mounts
  useEffect(() => {
    const fetchTrainers = async () => {
      const data = await getTrainerData();
      setTrainers(data);
      setFilteredTrainers(data); // Set initial filtered trainers data
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
      <div className="flex justify-between items-center mb-4">
        <div className="ml-4 w-1/3">
          <SearchFilter
            trainers={trainers}
            setFilteredTrainers={setFilteredTrainers}
          />
        </div>
        <Button variant="default">
          <Link href="/admin/trainers/manage">การจัดการ</Link>
        </Button>
      </div>

      <div className="w-full flex justify-end mb-4">
        <div className="w-auto">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            กรองตามสถานะ
          </label>
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="p-2 border rounded-md w-auto"
          >
            <option value="">แสดงทั้งหมด</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <h1 className="text-center text-2xl font-bold mb-4">
        รายชื่อผู้ฝึกสอนทั้งหมด
      </h1>
      <TrainerTable trainers={filteredTrainers} />
    </div>
  );
}
