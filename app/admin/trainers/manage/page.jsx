"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTrainerData } from "@/actions/admin/getTrainer";
import { getTrainerByStatus } from "@/actions/admin/getTrainerByStatus";
import TrainerTable from "@/app/admin/_components/TrainerTable";
// import { Button } from "@/components/ui/button";
import Link from "next/link";
import SearchFilter from "@/app/admin/_components/common/SearchFilter";
import BackButton from "@/components/button/Back";
import ManageUser from "@/components/button/ManageUser";
import LoadingSpinner from "../../_components/common/loadingSpinner";
import AddButton from "@/components/button/Add";

export const dynamic = "force-dynamic";

export default function Page() {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // ฟังก์ชันโหลดข้อมูลตามสถานะและหน้า
  const loadTrainers = async (status = "", page = 1) => {
    setLoading(true);
    try {
      // ใช้ฟังก์ชันที่รองรับการแบ่งหน้าและกรอง
      // *** สมมติว่าคุณมีฟังก์ชัน getTrainerPaginated
      const result =
        status === ""
          ? await getTrainerData(page)
          : await getTrainerByStatus(status, page);

      // ตั้งค่าข้อมูลที่ได้รับ
      if (result && Array.isArray(result)) {
        setFilteredTrainers(result);
        // ถ้ามีข้อมูลเพจจิเนชั่น ให้ตั้งค่าตามนั้น
        // setTotalPages(result.pagination?.totalPages || 1);
        // setCurrentPage(result.pagination?.currentPage || 1);
      } else {
        setFilteredTrainers([]);
      }
    } catch (error) {
      console.error("Error loading trainers:", error);
      setFilteredTrainers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // โหลดข้อมูลเริ่มต้น
    const fetchTrainers = async () => {
      setLoading(true);
      const data = await getTrainerData(); // โหลดข้อมูลจาก Database
      setTrainers(data);
      setFilteredTrainers(data); // ตั้งค่า trainers ที่กรองแล้วด้วยข้อมูลเดิม
      setLoading(false);
    };

    fetchTrainers();
  }, []);

  // เมื่อมีการเปลี่ยนสถานะกรอง
  const handleStatusFilter = async (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    setCurrentPage(1); // รีเซ็ตกลับไปหน้าแรก

    // โหลดข้อมูลใหม่ตามสถานะที่เลือก
    await loadTrainers(value, 1);
  };

  // ฟังก์ชันเปลี่ยนหน้า
  const handlePageChange = async (page) => {
    setCurrentPage(page);
    await loadTrainers(statusFilter, page);
  };
  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        {/* ซ้าย: ช่องค้นหา */}
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

        {/* กลาง: หัวข้อ */}
        <div className="w-full md:w-1/3 text-center">
          <h1 className="text-xl md:text-2xl font-bold">
            หน้าการจัดการผู้ฝึกสอน
          </h1>
        </div>

        {/* ขวา: ปุ่มเพิ่มผู้ฝึกสอน */}
        <div className="w-full md:w-1/3 flex justify-center md:justify-end">
          <AddButton
            route="/admin/trainers/create"
            buttonText="เพิ่มผู้ฝึกสอน"
            
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        {/* ปุ่มกลับ */}
        <div className="w-full md:w-auto flex justify-center md:justify-start">
          <BackButton />
        </div>

        {/* ตัวกรองสถานะ */}
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <span>กรองตามสถานะ:</span>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="p-1 border rounded-md"
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
        <LoadingSpinner />
      ) : (
        <>
          <TrainerTable trainers={filteredTrainers} showActions />

          {/* ปุ่มเปลี่ยนหน้า */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  className="mx-1"
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
