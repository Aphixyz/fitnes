"use client";

import { useState, useEffect } from "react";
import { getMemberWithTrainerPaginated } from "@/actions/admin/member/getMemberWithTrainer";
import { getMemberWithTrainer } from "@/actions/admin/member/getMemberWithTrainer";
import MemberTable from "../_components/member/table";
import Pagination from "../_components/common/Paginate";
import SearchFilter from "../_components/common/SearchFilter";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LoadingSpinner from "@/app/admin/_components/common/loadingSpinner";

export default function MemberPage() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("member_id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [allMembers, setAllMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Fetch paginated data when currentPage, statusFilter, sortField, or sortOrder changes
  useEffect(() => {
    // ถ้ากำลังค้นหาอยู่ ไม่ต้องดึงข้อมูลใหม่
    if (isSearchActive) return;
    
    const fetchPaginatedMembers = async () => {
      setLoading(true);
      try {
        const res = await getMemberWithTrainerPaginated(
          currentPage,
          10,
          statusFilter,
          sortField,
          sortOrder
        );
        if (res.success) {
          setMembers(res.data);
          setTotalPages(res.pagination.totalPages);
        } else {
          setError("เกิดข้อผิดพลาดในการโหลดข้อมูลสมาชิก");
        }
      } catch (err) {
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
      setLoading(false);
    };

    fetchPaginatedMembers();
  }, [currentPage, statusFilter, sortField, sortOrder, isSearchActive]);

  // Fetch all members for search functionality
  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const res = await getMemberWithTrainer(); // ดึงข้อมูลทั้งหมดสำหรับการค้นหา
        if (res.success) {
          setAllMembers(res.data);
        }
      } catch (err) {
        console.error("โหลดข้อมูลทั้งหมดล้มเหลว");
      }
    };

    fetchAllMembers();
  }, []);

  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    setCurrentPage(1);
    
    // รีเซ็ตการค้นหาเมื่อมีการเปลี่ยนตัวกรอง
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
    
    // รีเซ็ตการค้นหาเมื่อมีการเปลี่ยนการเรียงลำดับ
    if (isSearchActive) {
      setSearchTerm("");
      setIsSearchActive(false);
    }
  };
  
  // จัดการเมื่อมีการค้นหาจาก SearchFilter
  const handleFilter = (filtered) => {
    setFilteredMembers(filtered);
  };
  
  // จัดการเมื่อมีการเปลี่ยนแปลง searchTerm จาก SearchFilter
  const handleSearchTermChange = (term) => {
    setSearchTerm(term);
    setIsSearchActive(term.length > 0);
    
    // รีเซ็ตหน้าเมื่อเริ่มค้นหาใหม่
    if (term.length > 0 && !isSearchActive) {
      setCurrentPage(1);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        {/* ซ้าย: ช่องค้นหา */}
        <div className="flex-1">
          <SearchFilter
            data={allMembers}
            onFilter={handleFilter}
            onSearchTermChange={handleSearchTermChange}
            placeholder="ค้นหาสมาชิก"
            searchFields={["member_firstname", "member_lastname", "member_id"]}
          />
        </div>

        {/* กลาง: หัวข้อ */}
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold">รายชื่อสมาชิกทั้งหมด</h1>
        </div>

        {/* ขวา: กรองตามสถานะ */}
        <div className="flex-1 flex justify-end">
          <label className="block text-sm font-medium text-gray-700">
            กรองตามสถานะ :
            <span className="ml-2">
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="p-1 border rounded-md w-auto"
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

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {loading ? (
        <LoadingSpinner message="กำลังโหลดข้อมูลลูกค้า" />
      ) : (
        <>
          <MemberTable
            members={isSearchActive ? filteredMembers : members}
            sortField={sortField}
            sortOrder={sortOrder}
            handleSortChange={handleSortChange}
          />

          {/* แสดง pagination เฉพาะเมื่อไม่มีการค้นหา */}
          {!isSearchActive && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disableNavigation={false}
              disableNextOnly={members.length === 0}
            />
          )}
        </>
      )}
    </div>
  );
}