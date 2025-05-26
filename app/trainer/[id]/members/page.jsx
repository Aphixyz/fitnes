"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTrainerMembers,
  getMemberSummaryByStatus,
} from "@/actions/trainer/getTrainerMembers";
import { formatDate } from "@/utils/utils";
import MemberActionMenu from "@/app/trainer/_components/member/memberActionMenu";

export default function TrainerMembersPage({ params }) {
  // Unwrap params ซึ่งเป็น Promise ก่อนใช้งาน (ตามข้อกำหนดใหม่ของ Next.js 15)
  const { id: trainerId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // สถานะและการตั้งค่า
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    pending: 0,
    expired: 0,
    rejected: 0,
  });

  // การตั้งค่า pagination และการค้นหา
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ดึงค่าจาก URL parameters
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    setCurrentPage(page);
    setPageSize(size);
    setStatusFilter(status);
    setSearchTerm(search);
  }, [searchParams]);

  // ดึงข้อมูลสมาชิก
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const result = await getTrainerMembers({
        trainerId,
        page: currentPage,
        pageSize,
        searchTerm,
        status: statusFilter,
      });

      if (result.success) {
        setMembers(result.members);
        setTotalPages(result.pagination.totalPages);
      } else {
        setError(result.message || "ไม่สามารถดึงข้อมูลสมาชิกได้");
        setMembers([]);
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      console.error(err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลสรุปจำนวนสมาชิก
  const fetchSummary = async () => {
    try {
      const result = await getMemberSummaryByStatus(trainerId);
      if (result.success) {
        setSummary(result.summary);
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  // ดึงข้อมูลเมื่อมีการเปลี่ยนแปลงตัวกรอง
  useEffect(() => {
    fetchMembers();
    fetchSummary();
  }, [trainerId, currentPage, pageSize, searchTerm, statusFilter]);

  // อัปเดต URL parameters
  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(newParams)) {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.push(`/trainer/${trainerId}/members?${params.toString()}`);
  };

  // จัดการการค้นหา
  const handleSearch = (e) => {
    e.preventDefault();
    updateUrlParams({ search: searchTerm, page: 1 });
  };

  // จัดการการเปลี่ยนแปลงสถานะ
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    updateUrlParams({ status, page: 1 });
  };

  // จัดการการเปลี่ยนหน้า
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateUrlParams({ page: newPage });
  };

  // ดูรายละเอียดสมาชิก
  const viewMemberDetails = (memberId) => {
    router.push(`/trainer/${trainerId}/members/${memberId}`);
  };

  // แสดง Badge สำหรับสถานะ
  const getStatusBadge = (status) => {
    if (!status) return null;

    switch (status) {
      case "active":
        return <Badge className="bg-green-500">ใช้งาน</Badge>;
      case "expired":
        return <Badge className="bg-red-400">หมดอายุ</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">จัดการสมาชิก</h1>
        <p className="text-muted-foreground">
          รายชื่อสมาชิกทั้งหมดที่อยู่ภายใต้การดูแลของคุณ
        </p>
      </div>

      {/* การ์ดสรุปข้อมูล */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                ใช้งาน
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.active || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-2"></span>
                หมดอายุ
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.expired || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* เครื่องมือค้นหาและตัวกรอง */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
          <Input
            placeholder="ค้นหาตามชื่อ อีเมล หรือเบอร์โทร"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit">ค้นหา</Button>
        </form>

        <div className="flex items-center space-x-2">
          <div>กรองตามสถานะ:</div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="ทั้งหมด" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-md">
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="active">ใช้งาน</SelectItem>
              <SelectItem value="expired">หมดอายุ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* แสดงข้อความเมื่อมีการค้นหา */}
      {searchTerm && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            ผลการค้นหาสำหรับ:{" "}
            <span className="font-medium">"{searchTerm}"</span>
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm("");
              updateUrlParams({ search: "", page: 1 });
            }}
            className="h-auto p-0 text-sm text-muted-foreground"
          >
            ล้างการค้นหา
          </Button>
        </div>
      )}

      {/* ตารางแสดงผลข้อมูล */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ลำดับ</TableHead>
                  <TableHead className="w-14">รูปภาพ</TableHead>
                  <TableHead>ชื่อ - นามสกุล</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>เบอร์โทรศัพท์</TableHead>
                  <TableHead>วันเริ่มต้น</TableHead>
                  <TableHead>วันสิ้นสุด</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex justify-center">
                        <svg
                          className="animate-spin h-8 w-8 text-primary"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      {error ? (
                        <div className="text-red-500">{error}</div>
                      ) : (
                        <div>ไม่พบข้อมูลสมาชิก</div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member, index) => (
                    <TableRow key={`${member.registration_id}_${index}`}>
                      <TableCell className="font-medium">
                        {(currentPage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell>
                        {member.member_profileimage ? (
                          <img
                            src={member.member_profileimage}
                            alt={member.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium text-lg">
                            {member.member_firstname.charAt(0)}
                            {member.member_lastname.charAt(0)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{member.full_name}</TableCell>
                      <TableCell>{member.member_email}</TableCell>
                      <TableCell>{member.member_phone || "-"}</TableCell>
                      <TableCell>
                        {member.registration_startdate
                          ? formatDate(member.registration_startdate)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {member.registration_enddate
                          ? formatDate(member.registration_enddate)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(member.registration_status_text)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <MemberActionMenu
                          member={member}
                          trainerId={trainerId}
                          onMemberChanged={fetchMembers}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {members.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            แสดง {members.length} รายการ จากทั้งหมด {summary.total} รายการ
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              ก่อนหน้า
            </Button>
            <div className="flex items-center">
              <span className="text-sm px-3">
                หน้า {currentPage} จาก {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              ถัดไป
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
