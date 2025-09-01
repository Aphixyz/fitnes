"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import MemberAvatar from "../../../../../components/ui/MemberAvatar";
import MemberActionMenu from "./MemberActionMenu";

const columnHelper = createColumnHelper();

export const createMemberColumns = (trainerId, onMemberDeleted) => [
  // Column 1: ลูกค้า (Customer)
  columnHelper.accessor("full_name", {
    id: "customer",
    header: "ลูกค้า",
    enableSorting: true,
    sortingFn: "text", // ใช้ text sorting ที่รองรับ Unicode (ภาษาไทย)
    cell: (info) => {
      const member = info.row.original;
      return (
        <div className="flex items-center space-x-3">
          <MemberAvatar
            firstname={member.member_firstname}
            lastname={member.member_lastname}
            profileImage={member.member_profileimage}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {member.full_name}
            </p>
            {/* <p className="text-sm text-gray-500 truncate">
              {member.member_email}
            </p> */}
          </div>
        </div>
      );
    },
    filterFn: (row, columnId, value) => {
      const fullName = row.getValue(columnId);
      const searchValue = value.toLowerCase();
      return fullName.toLowerCase().includes(searchValue);
    },
  }),

  // Column 2: เป้าหมาย (Goal)
  columnHelper.accessor("fitness_goal_type", {
    id: "goal",
    header: "เป้าหมาย",
    enableSorting: false,
    cell: (info) => {
      const goalType = info.getValue();

      // กำหนดสีของ badge ตามประเภทเป้าหมาย
      const getGoalBadgeVariant = (type) => {
        switch (type) {
          case "weight_loss":
            return "bg-red-100 text-red-800";
          case "muscle_gain":
            return "bg-blue-100 text-blue-800";
          case "endurance":
            return "bg-green-100 text-green-800";
          case "strength":
            return "bg-purple-100 text-purple-800";
          case "general_fitness":
            return "bg-gray-100 text-gray-800";
          default:
            return "bg-gray-100 text-gray-600";
        }
      };

      // แปลประเภทเป้าหมายเป็นภาษาไทย
      const getGoalTypeLabel = (type) => {
        switch (type) {
          case "weight_loss":
            return "ลดน้ำหนัก";
          case "muscle_gain":
            return "เพิ่มกล้ามเนื้อ";
          case "endurance":
            return "เพิ่มความอดทน";
          case "strength":
            return "เพิ่มความแข็งแรง";
          case "general_fitness":
            return "สุขภาพทั่วไป";
          default:
            return goalType;
        }
      };

      return (
        <Badge variant="secondary" className={getGoalBadgeVariant(goalType)}>
          {getGoalTypeLabel(goalType)}
        </Badge>
      );
    },
  }),

  // Column 3: แผนออกกำลังกาย (Workout Plan)
  columnHelper.accessor("plan_name", {
    id: "workout_plan",
    header: "แผนออกกำลังกาย",
    enableSorting: false,
    cell: (info) => {
      const planName = info.getValue();
      // const member = info.row.original;

      if (!planName || planName === "ยังไม่มีแผน") {
        return <div className="text-sm text-gray-400 ">ยังไม่มีแผน</div>;
      }

      return (
        <div className="text-sm">
          <p className="font-medium text-gray-900 truncate max-w-[200px]">
            {planName}
          </p>
          {/* {member.plan_status && (
            <p className="text-xs text-gray-500">
              สถานะ:{" "}
              {member.plan_status === "active" ? "ใช้งาน" : member.plan_status}
            </p>
          )} */}
        </div>
      );
    },
  }),

  // Column 4: สถานะ (Status)
  columnHelper.accessor("status_display", {
    id: "status",
    header: "สถานะ",
    enableSorting: false,
    cell: (info) => {
      const status = info.getValue();

      const getStatusBadge = (status) => {
        switch (status) {
          case "Active":
            return (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                ใช้งานอยู่
              </Badge>
            );
          case "expired":
            return (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                หมดอายุ
              </Badge>
            );
          case "pending":
            return (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                รอดำเนินการ
              </Badge>
            );
          default:
            return <Badge variant="secondary">{status}</Badge>;
        }
      };

      return getStatusBadge(status);
    },
  }),

  // Column 5: Actions
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => {
      const member = info.row.original;
      return (
        <div className="flex justify-end">
          <MemberActionMenu
            member={member}
            trainerId={trainerId}
            onMemberDeleted={onMemberDeleted}
          />
        </div>
      );
    },
  }),
];
