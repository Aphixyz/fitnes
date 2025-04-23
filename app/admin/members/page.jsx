"use client";

import { useState, useEffect } from "react";
import { getMemberWithTrainerPaginated } from "@/actions/admin/member/getMemberWithTrainer";
import MemberTable from "../_components/member/table";

export default function MemberPage() {
  const [members, setMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const fetchMembers = async (page = 1) => {
    const res = await getMemberWithTrainerPaginated(page, 10);
    if (res.success) {
      setMembers(res.data);
      setTotalPages(res.pagination.totalPages);
    } else {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูลสมาชิก");
    }
  };

  useEffect(() => {
    fetchMembers(currentPage);
  }, [currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-center text-2xl font-bold mb-4">
        รายชื่อสมาชิกทั้งหมด
      </h1>

      <MemberTable members={members} />

      <div className="mt-4 flex justify-center items-center space-x-4">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ก่อนหน้า
        </button>
        <span>
          หน้า {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
