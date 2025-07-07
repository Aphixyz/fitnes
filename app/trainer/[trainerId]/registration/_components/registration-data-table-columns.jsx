"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import MemberAvatar from "@/components/ui/MemberAvatar";
import RegistrationActionMenu from "./RegistrationActionMenu";

const columnHelper = createColumnHelper();

export const createRegistrationColumns = (trainerId, onRegistrationUpdated) => [
  // Column 1: ลูกค้า (Customer)
  columnHelper.accessor("member_firstname", {
    id: "customer",
    header: "ลูกค้า",
    enableSorting: true,
    sortingFn: "text",
    cell: (info) => {
      const registration = info.row.original;
      const firstname = registration.member_firstname;
      const lastname = registration.member_lastname;
      const profileImage = registration.member_profileimage;

      const fullName =
        `${firstname || ""} ${lastname || ""}`.trim() || "ไม่ทราบชื่อ";

      return (
        <div className="flex items-center space-x-3">
          <MemberAvatar
            firstname={firstname}
            lastname={lastname}
            profileImage={profileImage}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fullName}
            </p>
          </div>
        </div>
      );
    },
  }),

  // Column 2: แพ็คเกจ (Package)
  columnHelper.accessor("packages_name", {
    id: "package",
    header: "แพ็คเกจ",
    enableSorting: false,
    cell: (info) => {
      const registration = info.row.original;
      const packages_name = info.getValue();

      return (
        <div className="text-sm">
          <p className="font-medium text-gray-900 truncate max-w-[200px]">
            {packages_name || "ไม่ระบุแพ็คเกจ"}
          </p>
        </div>
      );
    },
  }),

  // Column 3: วันที่ (Date Range)
  columnHelper.accessor("registration_startdate", {
    id: "date_range",
    header: "วันที่",
    enableSorting: false,
    cell: (info) => {
      const registration = info.row.original;
      const startDate = registration.registration_startdate;
      const endDate = registration.registration_enddate;

      const formatDate = (date) => {
        if (!date) return null;
        try {
          return new Date(date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        } catch (error) {
          return null;
        }
      };

      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      if (!formattedStartDate && !formattedEndDate) {
        return <span className="text-gray-400 text-sm">ไม่ระบุวันที่</span>;
      }

      return (
        <div className="text-sm">
          <div className="text-gray-900">
            {formattedStartDate || "ไม่ระบุ"}
            {formattedStartDate && formattedEndDate && (
              <span className="text-gray-500"> - </span>
            )}
            {formattedEndDate || ""}
          </div>
        </div>
      );
    },
  }),

  // Column 4: สถานะ (Status)
  columnHelper.accessor("registration_enddate", {
    id: "status",
    header: "สถานะ",
    enableSorting: true,
    cell: (info) => {
      const registration = info.row.original;
      const endDate = registration.registration_enddate;

      // เช็คสถานะจากวันที่
      const getPackageStatus = () => {
        if (!endDate) {
          return {
            status: "unknown",
            label: "ไม่ทราบสถานะ",
            className: "bg-gray-100 text-gray-800",
          };
        }

        const today = new Date();
        const packageEndDate = new Date(endDate);

        // ตั้งเวลาเป็น 00:00:00 เพื่อเปรียบเทียบแค่วันที่
        today.setHours(0, 0, 0, 0);
        packageEndDate.setHours(0, 0, 0, 0);

        if (packageEndDate < today) {
          return {
            status: "expired",
            label: "หมดอายุ",
            className: "bg-red-100 text-red-800 border-red-200",
          };
        } else {
          return {
            status: "active",
            label: "ใช้งานอยู่",
            className: "bg-green-100 text-green-800 border-green-200",
          };
        }
      };

      const statusInfo = getPackageStatus();

      return (
        <div className="space-y-1">
          <Badge className={statusInfo.className}>{statusInfo.label}</Badge>

          {/* แสดงข้อมูลวันที่หมดอายุ */}
          {endDate && (
            <div className="text-xs text-gray-500">
              หมดอายุ: {new Date(endDate).toLocaleDateString("th-TH")}
            </div>
          )}
        </div>
      );
    },
  }),

  // Column 5: Actions
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => {
      const registration = info.row.original;
      return (
        <div className="flex justify-end">
          <RegistrationActionMenu
            registration={registration}
            trainerId={trainerId}
            onRegistrationUpdated={onRegistrationUpdated}
          />
        </div>
      );
    },
  }),
];
