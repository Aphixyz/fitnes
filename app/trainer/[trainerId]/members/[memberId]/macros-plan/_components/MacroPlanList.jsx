"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  MoreHorizontal,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Apple,
  PlusCircle,
} from "lucide-react";
import {
  getMemberMacroPlans,
  deleteMacroPlan,
} from "@/actions/trainer/macro/getMemberMacroPlans";
import { updateMacroPlanStatus } from "@/actions/trainer/macro/manual/updateMacroTargets";

// ===== Components =====

const MacroRatioDisplay = ({ ratios, size = "sm" }) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`flex gap-2 ${sizeClasses[size]}`}>
      <span className="text-red-600 font-medium">P: {ratios.protein}%</span>
      <span className="text-green-600 font-medium">C: {ratios.carb}%</span>
      <span className="text-yellow-600 font-medium">F: {ratios.fat}%</span>
    </div>
  );
};

const PlanStatusBadge = ({ plan }) => {
  const getStatusConfig = (status, color) => {
    switch (color) {
      case "green":
        return {
          className: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        };
      case "red":
        return {
          className: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
        };
      case "gray":
        return {
          className: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Pause,
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Pause,
        };
    }
  };

  const config = getStatusConfig(plan.actualStatus, plan.statusColor);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {plan.displayStatus}
    </Badge>
  );
};

const PlanActionsMenu = ({
  plan,
  onEditClick,
  onDeleteClick,
  onStatusChange,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusToggle = async () => {
    setIsProcessing(true);
    try {
      const newStatus = plan.actualStatus === "active" ? "inactive" : "active";
      await onStatusChange(plan.macro_plan_id, newStatus);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onDeleteClick(plan.macro_plan_id);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEditClick(plan)}>
            <Edit className="mr-2 h-4 w-4" />
            แก้ไข
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleStatusToggle}
            disabled={isProcessing}
          >
            {plan.actualStatus === "active" ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                ปิดการใช้งาน
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                เปิดการใช้งาน
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600"
            disabled={plan.actualStatus === "active"}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            ลบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบแผนโภชนาการ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบแผนโภชนาการนี้ใช่หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isProcessing}>
              {isProcessing ? "กำลังลบ..." : "ลบ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const PlanTableRow = ({ plan, onEditClick, onDeleteClick, onStatusChange }) => {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{plan.formattedDates.createdAt}</span>
        </div>
      </TableCell>
      <TableCell>
        <MacroRatioDisplay ratios={plan.macroSummary} />
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {plan.formattedDates.startDate} - {plan.formattedDates.endDate}
        </div>
        <div className="text-xs text-muted-foreground">
          {plan.durationDays} วัน
        </div>
      </TableCell>
      <TableCell>
        <PlanStatusBadge plan={plan} />
      </TableCell>
      <TableCell>
        <PlanActionsMenu
          plan={plan}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          onStatusChange={onStatusChange}
        />
      </TableCell>
    </TableRow>
  );
};

const PlansTable = ({ plans, onEditClick, onDeleteClick, onStatusChange }) => {
  if (plans.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Apple className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
        <p>ไม่มีแผนโภชนาการ</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>วันที่สร้าง</TableHead>
          <TableHead>อัตราส่วน Macro</TableHead>
          <TableHead>ช่วงเวลา</TableHead>
          <TableHead>สถานะ</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <PlanTableRow
            key={plan.macro_plan_id}
            plan={plan}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            onStatusChange={onStatusChange}
          />
        ))}
      </TableBody>
    </Table>
  );
};

const SummaryCards = ({ summary }) => {
  const cards = [
    {
      title: "แผนทั้งหมด",
      value: summary.total,
      icon: Apple,
      color: "blue",
    },
    {
      title: "ใช้งานอยู่",
      value: summary.active,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "หมดอายุ",
      value: summary.expired,
      icon: XCircle,
      color: "red",
    },
    {
      title: "ไม่ใช้งาน",
      value: summary.inactive,
      icon: Pause,
      color: "gray",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// ===== Main Component =====

const MacroPlanList = ({ memberId, trainerId, onEditClick }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // โหลดข้อมูลแผนโภชนาการ
  const loadPlans = async () => {
    try {
      setLoading(true);
      const result = await getMemberMacroPlans(memberId, trainerId);

      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // ลบแผนโภชนาการ
  const handleDeletePlan = async (planId) => {
    try {
      const result = await deleteMacroPlan(planId, trainerId);

      if (result.success) {
        await loadPlans(); // รีโหลดข้อมูล
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบแผน");
    }
  };

  // เปลี่ยนสถานะแผนโภชนาการ
  const handleStatusChange = async (planId, newStatus) => {
    try {
      const result = await updateMacroPlanStatus({
        planId,
        trainerId,
        status: newStatus,
      });

      if (result.success) {
        await loadPlans(); // รีโหลดข้อมูล
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    }
  };

  useEffect(() => {
    loadPlans();
  }, [memberId, trainerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <XCircle className="h-12 w-12 mx-auto mb-2" />
            <p>{error}</p>
            <Button onClick={loadPlans} className="mt-4">
              ลองใหม่
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>รายการแผนโภชนาการ</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              ทั้งหมด {data.summary.total} แผน
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlansTable
            plans={data.plans}
            onEditClick={onEditClick}
            onDeleteClick={handleDeletePlan}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MacroPlanList;
