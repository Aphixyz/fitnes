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
import { ArrowUpDown, Search } from "lucide-react";
import { createMemberColumns } from "./data-table-columns";

const MembersDataTable = ({ initialData, trainerId, onRefresh }) => {
  const router = useRouter();
  const [data, setData] = useState(initialData.members || []);
  const [globalFilter, setGlobalFilter] = useState("");
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
    router.push(`/member/${member.member_id}/dashboard`);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ค้นหาชื่อ อีเมล เป้าหมาย หรือแผนออกกำลังกาย"
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
      </div>

      {/* Results Info */}
      {globalFilter && (
        <div className="text-sm text-gray-600">
          พบ {table.getFilteredRowModel().rows.length} รายการ จาก {data.length}{" "}
          รายการทั้งหมด
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
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleRowClick(row.original)}
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
                      {globalFilter
                        ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
                        : "ไม่มีข้อมูลสมาชิก"}
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

export default MembersDataTable;
