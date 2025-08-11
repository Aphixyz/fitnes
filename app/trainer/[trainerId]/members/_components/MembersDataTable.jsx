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
import { ArrowUpDown, Search, Users } from "lucide-react";
import { createMemberColumns } from "./data-table-columns";

const MembersDataTable = ({ initialData, trainerId, onRefresh, hideSearch = false, externalSearchTerm = "" }) => {
  const router = useRouter();
  const [data, setData] = useState(initialData.members || []);
  const [globalFilter, setGlobalFilter] = useState("");

  // Use external search term if provided
  const effectiveSearchTerm = externalSearchTerm || globalFilter;
  const [sorting, setSorting] = useState([
    { id: "customer", desc: false }, // Default sort by customer name ascending
  ]);

  // จัดการการลบสมาชิก
  const handleMemberDeleted = (memberId) => {
    setData((prevData) =>
      prevData.filter((member) => member.member_id !== memberId)
    );
    if (onRefresh) {
      onRefresh();
    }
  };

  // สร้าง columns ด้วย trainerId และ callback
  const columns = useMemo(
    () => createMemberColumns(trainerId, handleMemberDeleted),
    [trainerId, handleMemberDeleted]
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
      globalFilter: effectiveSearchTerm,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    // กำหนด filtering function สำหรับ global search
    globalFilterFn: (row, columnId, value) => {
      const searchValue = String(value).toLowerCase();
      const fullName = row.original.full_name?.toLowerCase() || "";
      const email = row.original.member_email?.toLowerCase() || "";
      const goalType = row.original.fitness_goal_type?.toLowerCase() || "";
      const planName = row.original.plan_name?.toLowerCase() || "";

      return (
        fullName.includes(searchValue) ||
        email.includes(searchValue) ||
        goalType.includes(searchValue) ||
        planName.includes(searchValue)
      );
    },
  });

  // จัดการการคลิกแถว
  const handleRowClick = (member) => {
    router.push(`/trainer/${trainerId}/members/${member.member_id}/overview`);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters - Only show if hideSearch is false */}
      {!hideSearch && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ค้นหาชื่อลูกค้า อีเมล เป้าหมาย หรือแผนออกกำลังกาย..."
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
          </div>
        </div>
      )}

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
                    className={`cursor-pointer hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                    onClick={() => handleRowClick(row.original)}
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
                      <Users className="h-8 w-8 mb-2 text-gray-300" />
                      <p className="text-sm font-medium">
                        {globalFilter
                          ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
                          : "ยังไม่มีข้อมูลลูกค้า"}
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

export default MembersDataTable;
