"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Plus,
  CalendarIcon,
} from "lucide-react";
import CreateGoalForm from "./CreateGoalForm";
import {
  getAllMemberGoals,
  changeGoalStatus,
  deleteGoal,
} from "@/actions/trainer/goalManagementAction";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { th } from "date-fns/locale";

/**
 * คอมโพเนนต์โมดัลจัดการเป้าหมายการออกกำลังกาย
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - สถานะเปิด/ปิดโมดัล
 * @param {Function} props.onClose - ฟังก์ชันเมื่อปิดโมดัล
 * @param {string} props.trainerId - รหัสเทรนเนอร์
 * @param {string} props.memberId - รหัสสมาชิก
 * @param {string} props.memberName - ชื่อสมาชิก
 * @param {number} props.currentWeight - น้ำหนักปัจจุบันของสมาชิก
 */
export default function GoalManagementModal({
  isOpen,
  onClose,
  trainerId,
  memberId,
  memberName,
  currentWeight,
}) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [mode, setMode] = useState("list"); // list, create, edit
  const [activeTab, setActiveTab] = useState("active");

  // โหลดข้อมูลเป้าหมายเมื่อเปิดโมดัล
  useEffect(() => {
    if (isOpen && memberId) {
      loadGoals();
    }
  }, [isOpen, memberId]);

  // โหลดข้อมูลเป้าหมายจาก API
  const loadGoals = async () => {
    setLoading(true);
    try {
      const result = await getAllMemberGoals(trainerId, memberId);
      if (result.success) {
        setGoals(result.goals);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูลเป้าหมาย");
      console.error("Error loading goals:", error);
    } finally {
      setLoading(false);
    }
  };

  // จัดการการปิดโมดัล - รีเซ็ตข้อมูลและกลับไปหน้ารายการ
  const handleClose = () => {
    setMode("list");
    setSelectedGoal(null);
    onClose();
  };

  // จัดการสร้างเป้าหมายใหม่
  const handleCreateGoal = () => {
    setMode("create");
    setSelectedGoal(null);
  };

  // จัดการแก้ไขเป้าหมาย
  const handleEditGoal = (goal) => {
    setSelectedGoal(goal);
    setMode("edit");
  };

  // จัดการเปลี่ยนสถานะเป้าหมาย
  const handleChangeStatus = async (goalId, newStatus) => {
    try {
      const result = await changeGoalStatus(
        trainerId,
        goalId,
        memberId,
        newStatus
      );
      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: result.message,
          variant: "success",
        });
        await loadGoals();
      } else {
        toast({
          title: "ผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "ผิดพลาด",
        description: "เกิดข้อผิดพลาดในการเปลี่ยนสถานะเป้าหมาย",
        variant: "destructive",
      });
      console.error("Error changing goal status:", error);
    }
  };

  // จัดการลบเป้าหมาย
  const handleDeleteGoal = async (goalId) => {
    if (!confirm("คุณต้องการลบเป้าหมายนี้หรือไม่?")) return;

    try {
      const result = await deleteGoal(trainerId, goalId, memberId);
      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: result.message,
          variant: "success",
        });
        await loadGoals();
      } else {
        toast({
          title: "ผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "ผิดพลาด",
        description: "เกิดข้อผิดพลาดในการลบเป้าหมาย",
        variant: "destructive",
      });
      console.error("Error deleting goal:", error);
    }
  };

  // เมื่อสร้าง/แก้ไขเป้าหมายสำเร็จ
  const handleGoalSuccess = async () => {
    await loadGoals();
    setMode("list");
    setSelectedGoal(null);
  };

  // แสดงแถบสถานะเป้าหมาย
  const renderStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">กำลังดำเนินการ</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">เสร็จสิ้นแล้ว</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">ยกเลิก</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  // แสดงรายการเป้าหมาย
  const renderGoalList = () => {
    const filteredGoals = goals.filter((goal) => {
      if (activeTab === "all") return true;
      return goal.fitness_goal_status === activeTab;
    });

    if (filteredGoals.length === 0) {
      return (
        <Alert className="my-4">
          <AlertDescription>
            {loading ? "กำลังโหลดข้อมูล..." : "ไม่พบเป้าหมายในหมวดหมู่นี้"}
          </AlertDescription>
        </Alert>
      );
    }

    return filteredGoals.map((goal) => (
      <Card key={goal.fitness_goal_id} className="mb-4">
        <CardContent className="pt-4">
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold text-lg">
              {goal.fitness_goal_type}
            </div>
            {renderStatusBadge(goal.fitness_goal_status)}
          </div>

          <div className="text-sm text-muted-foreground flex items-center mb-2">
            <CalendarIcon className="w-4 h-4 mr-1" />
            {format(new Date(goal.fitness_goal_startdate), "d MMM yyyy", {
              locale: th,
            })}{" "}
            -
            {format(new Date(goal.fitness_goal_enddate), "d MMM yyyy", {
              locale: th,
            })}
          </div>

          {goal.fitness_goal_targetweight && (
            <div className="mt-2">
              <strong>น้ำหนักเป้าหมาย:</strong> {goal.fitness_goal_targetweight}{" "}
              กก.
              {currentWeight && (
                <span className="text-xs text-muted-foreground ml-2">
                  (ปัจจุบัน: {currentWeight} กก.)
                </span>
              )}
            </div>
          )}

          {goal.fitness_goal_targetmuscle && (
            <div className="mt-1">
              <strong>เป้าหมายกล้ามเนื้อ:</strong>{" "}
              {goal.fitness_goal_targetmuscle}
            </div>
          )}

          {goal.fitness_goal_note && (
            <div className="mt-1 text-sm text-muted-foreground">
              <strong>บันทึก:</strong> {goal.fitness_goal_note}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end space-x-2 pt-0">
          {goal.fitness_goal_status === "active" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleChangeStatus(goal.fitness_goal_id, "completed")
                }
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                เสร็จสิ้น
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleChangeStatus(goal.fitness_goal_id, "cancelled")
                }
              >
                <XCircle className="h-4 w-4 mr-1" />
                ยกเลิก
              </Button>
            </>
          )}

          {goal.fitness_goal_status !== "active" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleChangeStatus(goal.fitness_goal_id, "active")}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              ทำต่อ
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditGoal(goal)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            แก้ไข
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteGoal(goal.fitness_goal_id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            ลบ
          </Button>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === "list" && `จัดการเป้าหมายการออกกำลังกาย - ${memberName}`}
            {mode === "create" && `สร้างเป้าหมายใหม่ - ${memberName}`}
            {mode === "edit" && `แก้ไขเป้าหมาย - ${memberName}`}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="my-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {mode === "list" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="active">กำลังดำเนินการ</TabsTrigger>
                  <TabsTrigger value="completed">เสร็จสิ้นแล้ว</TabsTrigger>
                  <TabsTrigger value="cancelled">ยกเลิก</TabsTrigger>
                  <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button onClick={handleCreateGoal}>
                <Plus className="h-4 w-4 mr-1" />
                สร้างเป้าหมายใหม่
              </Button>
            </div>

            <ScrollArea className="flex-grow">
              <div className="pr-4">{renderGoalList()}</div>
            </ScrollArea>
          </>
        )}

        {(mode === "create" || mode === "edit") && (
          <CreateGoalForm
            trainerId={trainerId}
            memberId={memberId}
            initialData={selectedGoal}
            currentWeight={currentWeight}
            onSuccess={handleGoalSuccess}
            onCancel={() => {
              setMode("list");
              setSelectedGoal(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
