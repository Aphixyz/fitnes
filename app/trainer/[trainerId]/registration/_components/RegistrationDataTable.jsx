"use client";

import { useState, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpDown, Search, FileText, Plus } from "lucide-react";
import { createRegistrationColumns } from "./registration-data-table-columns";
import PackageSelector from "./PackageSelector";
import RegistrationLinkGenerator from "./RegistrationLinkGenerator";

const RegistrationDataTable = ({ initialData, trainerId, onRefresh }) => {
  const [data] = useState(initialData.registrations || []);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([
    { id: "date_range", desc: true }, // Default sort by date (newest first)
  ]);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [currentStep, setCurrentStep] = useState("select"); // "select" | "generate"

  // จัดการการอัปเดตการลงทะเบียน
  const handleRegistrationUpdated = () => {
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
    // กำหนด filtering function สำหรับ global search - ค้นหาเฉพาะชื่อลูกค้า
    globalFilterFn: (row, _columnId, value) => {
      const searchValue = String(value).toLowerCase();
      const registration = row.original;

      // สร้างชื่อเต็มของลูกค้า
      const customerName = `${registration.member_firstname || ""} ${
        registration.member_lastname || ""
      }`
        .trim()
        .toLowerCase();

      return customerName.includes(searchValue);
    },
  });

  // ใช้ statistics จาก server แทนการคำนวณเอง
  const stats = initialData.statistics || {
    total: 0,
    active: 0,
    expired: 0,
  };

  return (
    <div className="space-y-6 ">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ค้นหาชื่อลูกค้า..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
            {globalFilter && (
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                พบ {table.getFilteredRowModel().rows.length} รายการ
              </div>
            )}
            {globalFilter && (
              <Button
                variant="ghost"
                onClick={() => setGlobalFilter("")}
                className="text-sm text-gray-500 hover:text-gray-700 h-8 px-3"
              >
                ล้างการค้นหา
              </Button>
            )}
            <Dialog
            open={isAddCustomerOpen}
            onOpenChange={(open) => {
              if (!open) handleCloseDialog();
              else setIsAddCustomerOpen(true);
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium ring-1 ring-green-800"
                onClick={() => {
                  setIsAddCustomerOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                เพิ่มลูกค้าใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader >
                <DialogTitle className="text-2xl font-bold">
                  {currentStep === "select"
                    ? "เลือกแพ็คเกจสำหรับลูกค้าใหม่"
                    : "สร้างลิงก์ลงทะเบียน"}
                </DialogTitle>
                <DialogDescription>
                  {currentStep === "select"
                    ? "เลือกแพ็คเกจที่ต้องการให้ลูกค้าลงทะเบียน"
                    : "สร้างลิงก์ลงทะเบียนสำหรับลูกค้า"}
                </DialogDescription>
              </DialogHeader>

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

              <DialogFooter>
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
                <Button variant="outline" onClick={handleCloseDialog}>
                  ยกเลิก
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">ลูกค้าทั้งหมด</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center justify-between">
            <div className="text-2xl font-bold text-green-700">{stats.active}</div>
            <div className="text-sm text-green-600">ใช้งานอยู่</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center justify-between">
            <div className="text-2xl font-bold text-red-700">{stats.expired}</div>
            <div className="text-sm text-red-600">หมดอายุ</div>
          </div>
        </div>

      {/* Data Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-gray-200">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold text-gray-900 py-4 px-6">
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "flex items-center space-x-2 cursor-pointer select-none hover:text-blue-600 transition-colors"
                              : "flex items-center"
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
                            <ArrowUpDown className="h-4 w-4 text-gray-400" />
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
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`py-4 px-6 ${
                          cell.column.id === "actions" ? "cursor-default" : ""
                        }`}
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
                    className="h-32 text-center py-8"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileText className="h-8 w-8 mb-2 text-gray-300" />
                      <p className="text-sm font-medium">
                        {globalFilter
                          ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
                          : "ยังไม่มีลูกค้าลงทะเบียน"}
                      </p>
                      {!globalFilter && (
                        <p className="text-xs text-gray-400 mt-1">
                          เมื่อมีลูกค้าใหม่ จะแสดงที่นี่
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDataTable;
