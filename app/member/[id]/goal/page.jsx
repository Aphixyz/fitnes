"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast"; // เพิ่มการนำเข้า toast
import GoalForm from "@/app/member/_components/goal/GoalForm";
import GoalInfo from "@/app/member/_components/goal/GoalInfo";
import GoalHistory from "@/app/member/_components/goal/GoalHistory";
import {
  getActiveMemberGoal,
  getMemberGoalHistory,
} from "@/actions/member/goal/goalActions";
import { getMemberHealth } from "@/actions/member/health/healthActions";
import { Skeleton } from "@/components/ui/skeleton";

export default function MemberGoalPage() {
  const params = useParams();
  const memberId = params.id;

  const [activeTab, setActiveTab] = useState("info");
  const [goalData, setGoalData] = useState(null);
  const [historyData, setHistoryData] = useState([]); // เปลี่ยนจาก null เป็น []
  const [currentWeight, setCurrentWeight] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({}); // เพิ่มข้อมูลดีบัก

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const debug = {}; // เก็บข้อมูลดีบัก

      try {
        console.log(`[GoalPage] Fetching data for member ID: ${memberId}`);
        debug.memberId = memberId;

        // ดึงข้อมูลน้ำหนักปัจจุบัน
        const healthData = await getMemberHealth(memberId);
        debug.healthData = healthData ? "exists" : "null";

        if (healthData && healthData.weight) {
          setCurrentWeight(healthData.weight);
          debug.currentWeight = healthData.weight;
        }

        // ดึงข้อมูลเป้าหมายที่กำลังใช้งาน
        const activeGoal = await getActiveMemberGoal(memberId);
        debug.activeGoal = activeGoal ? "exists" : "null";
        setGoalData(activeGoal);

        // ดึงประวัติเป้าหมาย
        try {
          const goalHistory = await getMemberGoalHistory(memberId);
          console.log("[GoalPage] Goal history data:", goalHistory);
          debug.goalHistoryReceived = goalHistory ? "received" : "null";
          debug.goalHistoryType = typeof goalHistory;
          debug.goalHistoryIsArray = Array.isArray(goalHistory);
          debug.goalHistoryLength = Array.isArray(goalHistory)
            ? goalHistory.length
            : "N/A";

          // ตรวจสอบและแปลงข้อมูลให้เป็นอาร์เรย์
          if (Array.isArray(goalHistory)) {
            setHistoryData(goalHistory);
          } else {
            console.warn(
              "[GoalPage] goalHistory is not an array:",
              goalHistory
            );
            setHistoryData([]);
          }
        } catch (historyError) {
          console.error(
            "[GoalPage] Error fetching goal history:",
            historyError
          );
          debug.goalHistoryError = historyError.message;
          setHistoryData([]);
        }
      } catch (error) {
        console.error("[GoalPage] Error loading data:", error);
        debug.mainError = error.message;

        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        });
      } finally {
        setDebugInfo(debug); // บันทึกข้อมูลดีบัก
        setLoading(false);
      }
    };

    fetchData();
  }, [memberId]);

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      console.log("[GoalPage] Refreshing data...");

      // ดึงข้อมูลน้ำหนักปัจจุบัน
      const healthData = await getMemberHealth(memberId);
      if (healthData && healthData.weight) {
        setCurrentWeight(healthData.weight);
      }

      // ดึงข้อมูลเป้าหมายที่กำลังใช้งาน
      const activeGoal = await getActiveMemberGoal(memberId);
      setGoalData(activeGoal);

      // ดึงประวัติเป้าหมาย
      const goalHistory = await getMemberGoalHistory(memberId);
      console.log("[GoalPage] Refreshed goal history:", goalHistory);

      // ตรวจสอบและแปลงข้อมูลให้เป็นอาร์เรย์
      if (Array.isArray(goalHistory)) {
        setHistoryData(goalHistory);
      } else {
        console.warn(
          "[GoalPage] Refreshed goalHistory is not an array:",
          goalHistory
        );
        setHistoryData([]);
      }

      // รีเซ็ตการแก้ไข
      setIsEditing(false);
      setSelectedRecord(null);

      toast({
        title: "อัพเดทข้อมูลสำเร็จ",
        variant: "success",
      });
    } catch (error) {
      console.error("[GoalPage] Error refreshing goal data:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรีเฟรชข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsEditing(true);
    setActiveTab("add");
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setIsEditing(false);
    setActiveTab("details");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            เป้าหมายการออกกำลังกาย
          </h1>
          <p className="text-muted-foreground">
            ตั้งเป้าหมายและติดตามความก้าวหน้าในการออกกำลังกายของคุณ
          </p>
        </div>

        <Button onClick={handleRefreshData} disabled={loading}>
          รีเฟรชข้อมูล
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-4">
          <TabsTrigger value="info">เป้าหมายปัจจุบัน</TabsTrigger>
          <TabsTrigger value="add">
            {isEditing ? "แก้ไขเป้าหมาย" : "ตั้งเป้าหมายใหม่"}
          </TabsTrigger>
          <TabsTrigger value="history">
            ประวัติ ({historyData?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedRecord}>
            รายละเอียด
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="info" className="m-0">
            {loading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <GoalInfo
                goalData={goalData}
                currentWeight={currentWeight}
                onEdit={handleEdit}
                refreshData={handleRefreshData}
              />
            )}
          </TabsContent>

          <TabsContent value="add" className="m-0">
            <GoalForm
              memberId={memberId}
              initialData={isEditing ? selectedRecord : null}
              currentWeight={currentWeight}
            />
          </TabsContent>

          <TabsContent value="history" className="m-0">
            {loading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* ข้อความดีบัก */}
                {(historyData === null || historyData.length === 0) && (
                  <p className="text-sm text-muted-foreground mb-2">
                    ไม่พบประวัติเป้าหมาย (
                    {historyData === null ? "null" : "empty array"})
                  </p>
                )}
                <GoalHistory
                  historyData={historyData || []}
                  onViewDetails={handleViewDetails}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="details" className="m-0">
            {selectedRecord && (
              <GoalInfo
                goalData={selectedRecord}
                currentWeight={currentWeight}
                onEdit={handleEdit}
                refreshData={handleRefreshData}
              />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
