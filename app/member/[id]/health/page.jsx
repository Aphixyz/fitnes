"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import HealthForm from "@/app/member/_components/health/HealthForm";
import HealthInfo from "@/app/member/_components/health/HealthInfo";
import HealthHistory from "@/app/member/_components/health/HealthHistory";
import { getMemberHealth, getMemberHealthHistory } from "@/actions/member/healthActions";
import { Skeleton } from "@/components/ui/skeleton";

export default function MemberHealthPage() {
  // ใช้ useParams() แทนการเข้าถึง params.id โดยตรง
  const params = useParams();
  const memberId = params.id;
  
  const [activeTab, setActiveTab] = useState("info");
  const [healthData, setHealthData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลสุขภาพล่าสุด
        const latestHealthData = await getMemberHealth(memberId);
        setHealthData(latestHealthData);

        // ดึงประวัติข้อมูลสุขภาพ
        const healthHistory = await getMemberHealthHistory(memberId);
        setHistoryData(healthHistory);
      } catch (error) {
        console.error("Error fetching health data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberId]);

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      // ดึงข้อมูลสุขภาพล่าสุด
      const latestHealthData = await getMemberHealth(memberId);
      setHealthData(latestHealthData);

      // ดึงประวัติข้อมูลสุขภาพ
      const healthHistory = await getMemberHealthHistory(memberId);
      setHistoryData(healthHistory);

      // รีเซ็ตการแก้ไข
      setIsEditing(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error("Error refreshing health data:", error);
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
          <h1 className="text-2xl font-bold tracking-tight mb-1">ข้อมูลสุขภาพ</h1>
          <p className="text-muted-foreground">
            จัดการข้อมูลสุขภาพของคุณและติดตามความก้าวหน้า
          </p>
        </div>

        <Button onClick={handleRefreshData} disabled={loading}>
          รีเฟรชข้อมูล
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-4">
          <TabsTrigger value="info">ข้อมูลล่าสุด</TabsTrigger>
          <TabsTrigger value="add">
            {isEditing ? "แก้ไขข้อมูล" : "บันทึกข้อมูลใหม่"}
          </TabsTrigger>
          <TabsTrigger value="history">ประวัติ</TabsTrigger>
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
              <HealthInfo 
                healthData={healthData}
                onEdit={handleEdit}
                refreshData={handleRefreshData}
              />
            )}
          </TabsContent>

          <TabsContent value="add" className="m-0">
            <HealthForm 
              memberId={memberId} 
              initialData={isEditing ? selectedRecord : null}
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
              <HealthHistory 
                historyData={historyData}
                onViewDetails={handleViewDetails}
              />
            )}
          </TabsContent>

          <TabsContent value="details" className="m-0">
            {selectedRecord && (
              <HealthInfo 
                healthData={selectedRecord}
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