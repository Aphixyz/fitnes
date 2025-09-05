"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Apple,
  Search,
} from "lucide-react";
import {
  getMemberMacroPlans,
  deleteMacroPlan,
} from "@/actions/trainer/macro/getMemberMacroPlans";
import { updateMacroPlanStatus } from "@/actions/trainer/macro/manual/updateMacroTargets";
import EditMacroPlanSheet from "./EditMacroPlanSheet";

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
  // แปลง status เป็นภาษาไทยและกำหนดสี
  const getStatusConfig = (status) => {
    if (status === "active" || plan.displayStatus === "ใช้งานอยู่") {
      return {
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        text: "มอบหมาย"
      };
    } else {
      return {
        className: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: XCircle,
        text: "เสร็จสิ้น"
      };
    }
  };

  const config = getStatusConfig(plan.actualStatus);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const handleEditClick = () => {
    setIsDropdownOpen(false); // ปิด dropdown ก่อนเปิด sheet
    onEditClick(plan);
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEditClick}>
            <Edit className="mr-2 h-4 w-4" />
            แก้ไข
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleStatusToggle}
            disabled={isProcessing}
          >
            {plan.actualStatus === "active" ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                ทำเครื่องหมายเสร็จสิ้น
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                ทำเครื่องหมายมอบหมาย
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


const PlanListItem = ({ plan, onEditClick, onDeleteClick, onStatusChange }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
      {/* Calorie Target */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">
          {plan.calorie_target ? `${plan.calorie_target} kcal` : 'ไม่ระบุ'}
        </div>
      </div>
      
      {/* Size (Macro Ratios) */}
      <div className="flex-1 min-w-0">
        <MacroRatioDisplay ratios={plan.macroSummary} size="sm" />
      </div>
      
      {/* Start Date */}
      <div className="flex-1 min-w-0 text-sm text-gray-600">
        {plan.formattedDates.startDate}
      </div>
      
      {/* Status */}
      <div className="flex-1 min-w-0">
        <PlanStatusBadge plan={plan} />
      </div>
      
      {/* Actions */}
      <div className="ml-4">
        <PlanActionsMenu
          plan={plan}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
};

const PlansList = ({ plans, onEditClick, onDeleteClick, onStatusChange }) => {
  if (plans.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Apple className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
        <p>ไม่มีแผนโภชนาการ</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between py-3 px-1 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="flex-1">แผนเป้าหมายแคลอรี่</div>
        <div className="flex-1">ขนาด</div>
        <div className="flex-1">วันที่เริ่ม</div>
        <div className="flex-1">สถานะ</div>
        <div className="w-10"></div>
      </div>
      
      {/* List Items */}
      <div>
        {plans.map((plan) => (
          <PlanListItem
            key={plan.macro_plan_id}
            plan={plan}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
};


// ===== Main Component =====

const MacroPlanList = ({ memberId, trainerId, onCreateClick }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ทั้งหมด");
  
  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

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

  // Handle edit plan
  const handleEditPlan = (plan) => {
    setSelectedPlanId(plan.macro_plan_id);
    setIsEditModalOpen(true);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedPlanId(null);
    loadPlans(); // Reload data
  };

  // Handle edit close
  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedPlanId(null);
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

  // Filter plans based on search and filters
  const filteredPlans = data.plans?.filter((plan) => {
    const matchesSearch = searchQuery === "" || 
      plan.macro_plan_id.toString().includes(searchQuery);
    
    let matchesStatus = true;
    if (selectedStatus !== "ทั้งหมด") {
      if (selectedStatus === "มอบหมาย") {
        matchesStatus = plan.actualStatus === "active";
      } else if (selectedStatus === "เสร็จสิ้น") {
        matchesStatus = plan.actualStatus !== "active";
      }
    }
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ค้นหา
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ค้นหาแผนโภชนาการ"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            สถานะแผนโภชนาการ
          </label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
              <SelectItem value="มอบหมาย">มอบหมาย</SelectItem>
              <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Action Button */}
        <div className="flex gap-2 ml-auto">
          <Button onClick={onCreateClick} className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
            สร้างแผนโภชนาการ
          </Button>
        </div>
      </div>

      {/* Plans List */}
      <div className="bg-white border rounded-lg">
        <div className="p-6">
          <PlansList
            plans={filteredPlans}
            onEditClick={handleEditPlan}
            onDeleteClick={handleDeletePlan}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      {/* Edit Plan Sheet */}
      <EditMacroPlanSheet
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        planId={selectedPlanId}
        trainerId={trainerId}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default MacroPlanList;
