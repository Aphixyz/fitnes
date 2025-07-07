"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowUpDown, Search, FileText, Plus } from "lucide-react";
import { createRegistrationColumns } from "./registration-data-table-columns";
import PackageSelector from "./PackageSelector";
import RegistrationLinkGenerator from "./RegistrationLinkGenerator";

const RegistrationDataTable = ({ initialData, trainerId, onRefresh }) => {
  const router = useRouter();
  const [data, setData] = useState(initialData.registrations || []);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([
    { id: "customer", desc: false }, // Default sort by customer name
  ]);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [currentStep, setCurrentStep] = useState("select"); // "select" | "generate"

  // Debug logging for state changes
  console.log(
    "RegistrationDataTable render - isAddCustomerOpen:",
    isAddCustomerOpen
  );

  // จัดการการอัปเดตการลงทะเบียน
  const handleRegistrationUpdated = (registrationId, action) => {
    // สำหรับการต่ออายุแพ็คเกจหรือการเปลี่ยนแปลงอื่นๆ
    if (onRefresh) {
      onRefresh();
    }
  };

  // จัดการการเลือกแพ็คเกจ
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setCurrentStep("generate");
  };

  // จัดการเมื่อสร้าง link สำเร็จ
  const handleLinkGenerated = (result) => {
    console.log("Registration link generated:", result);
    // Refresh data if needed
    if (onRefresh) {
      onRefresh();
    }
  };

  // รีเซ็ต state เมื่อปิด dialog
  const handleCloseDialog = () => {
    setIsAddCustomerOpen(false);
    setSelectedPackage(null);
    setCurrentStep("select");
  };

  // สร้าง columns ด้วย trainerId และ callback
  const columns = useMemo(
    () => createRegistrationColumns(trainerId, handleRegistrationUpdated),
    [trainerId]
  );

  // สร้าง table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    // กำหนด filtering function สำหรับ global search
    globalFilterFn: (row, columnId, value) => {
      const searchValue = String(value).toLowerCase();
      const registration = row.original;

      // สร้างชื่อเต็มของลูกค้า
      const customerName = `${registration.member_firstname || ""} ${
        registration.member_lastname || ""
      }`
        .trim()
        .toLowerCase();
      const customerEmail = registration.member_email?.toLowerCase() || "";
      const customerPhone = registration.member_phone?.toLowerCase() || "";
      const packageName = registration.packages_name?.toLowerCase() || "";

      return (
        customerName.includes(searchValue) ||
        customerEmail.includes(searchValue) ||
        customerPhone.includes(searchValue) ||
        packageName.includes(searchValue)
      );
    },
  });

  // ใช้ statistics จาก server แทนการคำนวณเอง
  const stats = initialData.statistics || {
    total: 0,
    active: 0,
    expired: 0,
    filtered: 0,
  };

  // สำหรับแสดงข้อมูลเมื่อมีการ filter
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-4">
      {/* Search Input และ Summary Stats */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ค้นหาชื่อลูกค้า อีเมล เบอร์โทร หรือแพ็คเกจ"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          {globalFilter && (
            <Button
              variant="ghost"
              onClick={() => setGlobalFilter("")}
              className="text-sm text-gray-500"
            >
              ล้างการค้นหา
            </Button>
          )}

          {/* เพิ่มปุ่มเพิ่มลูกค้า */}
          <AlertDialog
            open={isAddCustomerOpen}
            onOpenChange={(open) => {
              console.log("AlertDialog onOpenChange:", open); // Debug
              if (!open) handleCloseDialog();
              else setIsAddCustomerOpen(true);
            }}
          >
            <AlertDialogTrigger
              className="flex items-center space-x-2 bg-green-400 hover:bg-green-200 px-4 py-2 rounded-md text-sm font-medium ring-1 ring-green-800"
              onClick={(e) => {
                console.log("AlertDialogTrigger clicked!"); // Debug
                setIsAddCustomerOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              <span>เพิ่มลูกค้าใหม่</span>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {currentStep === "select"
                    ? "เลือกแพ็คเกจสำหรับลูกค้าใหม่"
                    : "สร้างลิงก์ลงทะเบียน"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {currentStep === "select"
                    ? "เลือกแพ็คเกจที่ต้องการให้ลูกค้าลงทะเบียน"
                    : "สร้างลิงก์ลงทะเบียนสำหรับลูกค้า"}
                </AlertDialogDescription>
              </AlertDialogHeader>

              {/* Content based on current step */}
              <div className="py-4">
                {currentStep === "select" && (
                  <PackageSelector
                    trainerId={trainerId}
                    onPackageSelect={handlePackageSelect}
                    selectedPackage={selectedPackage}
                  />
                )}

                {currentStep === "generate" && selectedPackage && (
                  <RegistrationLinkGenerator
                    trainerId={trainerId}
                    selectedPackage={selectedPackage}
                    onSuccess={handleLinkGenerated}
                    onClose={handleCloseDialog}
                  />
                )}
              </div>

              <AlertDialogFooter>
                {currentStep === "generate" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep("select");
                      setSelectedPackage(null);
                    }}
                  >
                    กลับไปเลือกแพ็คเกจ
                  </Button>
                )}
                <AlertDialogCancel onClick={handleCloseDialog}>
                  ยกเลิก
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Stats Summary - ใช้ข้อมูลจาก server */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">ลูกค้าทั้งหมด</div>
            {globalFilter && (
              <div className="text-xs text-gray-500 mt-1">
                (แสดง {filteredCount} รายการ)
              </div>
            )}
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-green-700">
              {stats.active}
            </div>
            <div className="text-sm text-green-600">แพ็คเกจใช้งานอยู่</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-red-700">
              {stats.expired}
            </div>
            <div className="text-sm text-red-600">แพ็คเกจหมดอายุ</div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {globalFilter && (
        <div className="text-sm text-gray-600">
          พบ {filteredCount} รายการ จาก {data.length} รายการในหน้านี้
          {stats.filtered && stats.filtered !== data.length && (
            <span className="text-gray-500">
              (ทั้งหมด {stats.filtered} รายการตามการค้นหา)
            </span>
          )}
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-medium">
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? "flex items-center space-x-2 cursor-pointer select-none hover:text-gray-900"
                                : ""
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            {header.column.getCanSort() && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                            {header.column.getIsSorted() === "asc" && (
                              <span className="text-blue-600">↑</span>
                            )}
                            {header.column.getIsSorted() === "desc" && (
                              <span className="text-blue-600">↓</span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === "actions" ? "cursor-default" : ""
                          }
                          onClick={
                            cell.column.id === "actions"
                              ? (e) => e.stopPropagation()
                              : undefined
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FileText className="h-8 w-8 mb-2 text-gray-400" />
                        {globalFilter
                          ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
                          : "ยังไม่มีลูกค้าลงทะเบียน"}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationDataTable;
