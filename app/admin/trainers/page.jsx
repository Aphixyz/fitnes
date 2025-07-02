"use client";

import { useState, useEffect } from "react";
import { getTrainerPaginated } from "@/actions/admin/getTrainer";
import { getTrainerData } from "@/actions/admin/getTrainer";
import TrainerTable from "@/app/admin/_components/TrainerTable";
import SearchFilter from "../_components/common/SearchFilter";
import Pagination from "../_components/common/Paginate";
import LoadingSpinner from "@/app/admin/_components/common/loadingSpinner";
import ViewButton from "@/components/button/Look";
import ManageUser from "@/components/button/ManageUser";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  // โหลดข้อมูลทั้งหมด (ใช้สำหรับค้นหา)
  useEffect(() => {
    const fetchAllTrainers = async () => {
      try {
        const data = await getTrainerData();
        setAllTrainers(data);
      } catch (err) {
        console.error("โหลดข้อมูลทั้งหมดล้มเหลว");
      }
    };

    fetchAllTrainers();
  }, []);

  // โหลดข้อมูลแบบแบ่งหน้า
  useEffect(() => {
    if (isSearchActive) return;

    const fetchPaginatedTrainers = async () => {
      setLoading(true);
      try {
        const res = await getTrainerPaginated(
          currentPage,
          10,
          statusFilter,
          sortField,
          sortOrder
        );
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

  const handleFilter = (filtered) => {
    setFilteredTrainers(filtered);
  };

  const handleSearchTermChange = (term) => {
    setSearchTerm(term);
    setIsSearchActive(term.length > 0);
    if (term.length > 0 && !isSearchActive) {
      setCurrentPage(1);
    }
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
    setSearchTerm("");
    setIsSearchActive(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
    setSearchTerm("");
    setIsSearchActive(false);
  };

  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex flex-col items-center justify-center md:hidden w-full h-20">
          <SearchFilter
            data={allTrainers}
            onFilter={handleFilter}
            onSearchTermChange={handleSearchTermChange}
            placeholder="ค้นหาผู้ฝึกสอน"
            searchFields={[
              "trainer_firstname",
              "trainer_lastname",
              "trainer_id",
            ]}
          />
        </div>

        <div className="hidden md:flex md:w-1/3 md:justify-start">
          <SearchFilter
            data={allTrainers}
            onFilter={handleFilter}
            onSearchTermChange={handleSearchTermChange}
            placeholder="ค้นหาผู้ฝึกสอน"
            searchFields={[
              "trainer_firstname",
              "trainer_lastname",
              "trainer_id",
            ]}
          />
        </div>

        <div className="w-full md:w-1/3 text-center">
          <h1 className="text-xl md:text-2xl font-bold">
            รายชื่อผู้ฝึกสอนทั้งหมด
          </h1>
        </div>
        <ManageUser route="/admin/trainers/manage" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <ViewButton
          route="/admin/packages"
          buttonText="แพ็คเกจ"
          icon={AcademicCapIcon}
        />

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            กรองตามสถานะ:
          </label>
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="p-1 border rounded-md"
          >
            <option value="">แสดงทั้งหมด</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">ไม่ได้ใช้งาน</option>
            <option value="expired">หมดอายุ</option>
          </select>
        </div>
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
            showActions={false}
          />
          {!isSearchActive && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disableNavigation={false}
              disableNextOnly={trainers.length === 0}
            />
          )}
        </>
      )}
    </div>
  );
}
