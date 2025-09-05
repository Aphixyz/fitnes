"use client";

import { useState, useEffect } from "react";
import { getTrainerPaginated, getTrainerData } from "@/actions/admin/getTrainer";
import TrainerTable from "@/app/admin/_components/TrainerTable";
import SearchFilter from "../_components/common/SearchFilter";
import Pagination from "../_components/common/Paginate";
import LoadingSpinner from "@/app/admin/_components/common/loadingSpinner";
import ManageUser from "@/components/button/ManageUser";

export default function TrainerPage() {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [allTrainers, setAllTrainers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("trainer_id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // โหลดข้อมูลทั้งหมด (สำหรับ search)
  useEffect(() => {
    const fetchAllTrainers = async () => {
      try {
        const data = await getTrainerData();
        setAllTrainers(data);
      } catch (err) {
        console.error("โหลดข้อมูลทั้งหมดล้มเหลว", err);
      }
    };
    fetchAllTrainers();
  }, []);

  // โหลดข้อมูลแบบ pagination
  useEffect(() => {
    if (isSearchActive) return;

    const fetchPaginatedTrainers = async () => {
      setLoading(true);
      try {
        const res = await getTrainerPaginated(currentPage, 10, statusFilter, sortField, sortOrder);
        if (res.success) {
          setTrainers(res.data);
          setTotalPages(res.pagination.totalPages);
        } else {
          setError("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ฝึกสอน");
        }
      } catch (err) {
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
      setLoading(false);
    };
    fetchPaginatedTrainers();
  }, [currentPage, statusFilter, sortField, sortOrder, isSearchActive]);

  // ฟังก์ชัน search
  const handleSearchTermChange = (term) => {
    setIsSearchActive(term.length > 0);
    if (term.length === 0) {
      setFilteredTrainers([]);
      setCurrentPage(1);
      return;
    }

    const lowercasedTerm = term.toLowerCase();
    const filtered = allTrainers.filter(trainer =>
      ["trainer_firstname", "trainer_lastname", "trainer_id"].some(field => {
        const value = trainer[field];
        if (!value) return false;
        return value.toString().toLowerCase().includes(lowercasedTerm);
      })
    );
    setFilteredTrainers(filtered);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
    setIsSearchActive(false);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSortChange = (field) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else setSortField(field);
    setCurrentPage(1);
  };

  return (
    <div className="py-4 px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <SearchFilter
            data={allTrainers}
            onFilter={setFilteredTrainers}
            searchFields={["trainer_firstname", "trainer_lastname", "trainer_id"]}
            placeholder="ค้นหาผู้ฝึกสอน"
            onSearchTermChange={handleSearchTermChange}
          />
        </div>

        <div className="w-full md:w-1/3 text-center">
          <h1 className="text-xl md:text-2xl font-bold">หน้าการจัดการผู้ฝึกสอน</h1>
        </div>

        <ManageUser route="/admin/trainers/manage" />
      </div>

      <div className="w-full md:w-auto flex justify-center md:justify-end mb-4">
        <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
          <span>กรองตามสถานะ:</span>
          <select value={statusFilter} onChange={handleStatusFilter} className="p-1 border rounded-md">
            <option value="">แสดงทั้งหมด</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">หมดอายุ</option>
            <option value="pending">กำลังรอดำเนินการ</option>
          </select>
        </label>
      </div>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {loading ? (
        <LoadingSpinner message="กำลังโหลดข้อมูลผู้ฝึกสอน" />
      ) : (
        <>
          <TrainerTable
            trainers={isSearchActive ? filteredTrainers : trainers}
            sortField={sortField}
            sortOrder={sortOrder}
            handleSortChange={handleSortChange}
            showActions={true} // ปุ่ม delete/แก้ไข
          />
          {!isSearchActive && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disableNavigation={false}
              disableNextOnly={(trainers || []).length === 0}
            />
          )}
        </>
      )}
    </div>
  );
}
