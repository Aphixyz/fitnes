"use client";

import { useState, useEffect } from "react";
import { getMemberByStatus } from "@/actions/admin/member/getMemberByStatus";
import { getMemberWithTrainerPaginated } from "@/actions/admin/member/getMemberWithTrainer";
import MemberTable from "../_components/member/table";
import Pagination from "../_components/common/Paginate";
import SearchFilter from "../_components/common/SearchFilter"; // หากมีฟังก์ชันค้นหาด้วย
import { Button } from "@/components/ui/button"; // หากต้องการปุ่มการจัดการ
import Link from "next/link"; // หากต้องการปุ่มลิงก์

export default function MemberPage() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data only once when the component mounts
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await getMemberWithTrainerPaginated(
          currentPage,
          10,
          statusFilter
        );
        if (res.success) {
          setMembers(res.data);
          setFilteredMembers(res.data);
          setTotalPages(res.pagination.totalPages);
        } else {
          setError("เกิดข้อผิดพลาดในการโหลดข้อมูลสมาชิก");
        }
      } catch (err) {
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
      setLoading(false);
    };

    fetchMembers();
  }, [currentPage, statusFilter]); // เรียก fetch ใหม่เมื่อ currentPage หรือ statusFilter เปลี่ยนแปลง

  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value); // ปล่อยให้ useEffect ทำงาน fetch ใหม่ให้
    setCurrentPage(1);
  };
  

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        {/* ซ้าย: ช่องค้นหาหรือกรอง */}
        <div className="w-1/3">
          <SearchFilter
            data={members}
            onFilter={setFilteredMembers}
            placeholder="ค้นหาสมาชิก"
            searchFields={["member_name", "member_lastname", "member_id"]}
          />
        </div>

        {/* กลาง: หัวข้อ */}
        <div className="text-center w-1/3">
          <h1 className="text-2xl font-bold">รายชื่อสมาชิกทั้งหมด</h1>
        </div>

        <div className="w-auto">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            กรองตามสถานะ :
            <span className="ml-2">
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="text-center p-1 border rounded-md w-auto"
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

      <div className="w-full flex justify-end mb-4">
       
      </div>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {loading ? (
        <div className="text-center text-gray-500 py-10">
          กำลังโหลดข้อมูลสมาชิก...
        </div>
      ) : (
        <>
          <MemberTable members={filteredMembers} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            disableNavigation={false}
          />
        </>
      )}
    </div>
  );
}
