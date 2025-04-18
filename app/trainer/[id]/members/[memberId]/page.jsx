"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDate } from "@/utils/utils";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Activity,
  Target,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// Import Server Actions
import { getMemberDetails } from "@/actions/trainer/getMemberDetails";
import {
  getMemberHealth,
  getMemberHealthHistory,
} from "@/actions/member/healthActions";
import {
  getActiveMemberGoal,
  getMemberGoalHistory,
} from "@/actions/member/goalActions";

// Import Components
import MemberInfoTab from "@/app/trainer/_components/(member)/MemberInfoTab";
import MemberHealthTab from "@/app/trainer/_components/(member)/MemberHealthTab";
import MemberGoalTab from "@/app/trainer/_components/(member)/MemberGoalTab";
import MemberSummaryCard from "@/app/trainer/_components/(member)/MemberSummaryCard";

/**
 * หน้าแสดงรายละเอียดสมาชิกสำหรับเทรนเนอร์
 */
export default function MemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id;
  const memberId = params.memberId;

  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [healthHistory, setHealthHistory] = useState(null);
  const [goalData, setGoalData] = useState(null);
  const [goalHistory, setGoalHistory] = useState(null);

  // ดึงข้อมูลสมาชิกเมื่อหน้าโหลด
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลสมาชิก
        const memberDetailsResult = await getMemberDetails(trainerId, memberId);

        if (!memberDetailsResult.success) {
          throw new Error(
            memberDetailsResult.message || "ไม่สามารถดึงข้อมูลสมาชิกได้"
          );
        }

        setMemberData(memberDetailsResult.member);

        // ดึงข้อมูลสุขภาพ
        const healthData = await getMemberHealth(memberId);
        setHealthData(healthData);

        // ดึงประวัติข้อมูลสุขภาพ
        const healthHistory = await getMemberHealthHistory(memberId, 5); // ดึง 5 รายการล่าสุด
        setHealthHistory(healthHistory);

        // ดึงข้อมูลเป้าหมาย
        const goalData = await getActiveMemberGoal(memberId);
        setGoalData(goalData);

        // ดึงประวัติเป้าหมาย
        const goalHistory = await getMemberGoalHistory(memberId);
        setGoalHistory(goalHistory);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trainerId, memberId]);

  // แสดง Loading state หรือ Error message
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} trainerId={trainerId} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href={`/trainer/${trainerId}/members`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปยังรายการสมาชิก
            </Button>
          </Link>
        </div>

        <div className="flex space-x-2">
          <Link href={`/trainer/${trainerId}/members/${memberId}/nutrition`}>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              แผนโภชนาการ
            </Button>
          </Link>
          <Link href={`/trainer/${trainerId}/members/${memberId}/exercise`}>
            <Button variant="outline" size="sm">
              <Activity className="mr-2 h-4 w-4" />
              แผนออกกำลังกาย
            </Button>
          </Link>
        </div>
      </div>

      {/* Member Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            {memberData?.member_profileimage ? (
              <AvatarImage
                src={memberData.member_profileimage}
                alt={`${memberData.member_firstname} ${memberData.member_lastname}`}
              />
            ) : (
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl">
                {memberData?.member_firstname?.charAt(0)}
                {memberData?.member_lastname?.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {`${memberData?.member_firstname} ${memberData?.member_lastname}`}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge
                className={
                  memberData?.is_expired ? "bg-red-500" : "bg-green-500"
                }
              >
                {memberData?.is_expired ? "หมดอายุ" : "ใช้งาน"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                สมาชิกถึงวันที่: {formatDate(memberData?.registration_enddate)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button>
            <Target className="mr-2 h-4 w-4" />
            จัดการเป้าหมาย
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            ต่ออายุสมาชิก
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <MemberSummaryCard
        healthData={healthData}
        goalData={goalData}
        loading={loading}
      />

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            ข้อมูลทั่วไป
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            ข้อมูลสุขภาพ
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center">
            <Target className="mr-2 h-4 w-4" />
            เป้าหมาย
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="info">
            <MemberInfoTab memberData={memberData} />
          </TabsContent>
          <TabsContent value="health">
            <MemberHealthTab
              memberId={memberId}
              healthData={healthData}
              healthHistory={healthHistory}
            />
          </TabsContent>
          <TabsContent value="goals">
            <MemberGoalTab
              memberId={memberId}
              goalData={goalData}
              goalHistory={goalHistory}
              currentWeight={healthData?.weight}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

/**
 * คอมโพเนนต์แสดงขณะกำลังโหลดข้อมูล
 */
function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>

      <div>
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      <div>
        <Skeleton className="h-10 w-full rounded-lg mb-6" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}

/**
 * คอมโพเนนต์แสดงเมื่อเกิดข้อผิดพลาด
 */
function ErrorState({ error, trainerId }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href={`/trainer/${trainerId}/members`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปยังรายการสมาชิก
          </Button>
        </Link>
      </div>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
        <AlertDescription>
          {error || "ไม่สามารถดึงข้อมูลสมาชิกได้ กรุณาลองใหม่อีกครั้ง"}
        </AlertDescription>
      </Alert>

      <div className="flex justify-center">
        <Button onClick={() => window.location.reload()}>โหลดหน้าใหม่</Button>
      </div>
    </div>
  );
}
