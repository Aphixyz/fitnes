"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { getTrainerRegistrations } from "@/actions/trainer/registration/manageMemberRegistration";
import { Clock, CheckCircle, XCircle, AlertTriangle, User } from "lucide-react";
import ConfirmRegistrationModal from "./ConfirmRegistrationModal";
import AddButton from "@/components/button/Add";

export default function RegistrationList({ trainerId }) {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [trainerId, activeTab]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      let statusFilter = null;
      if (activeTab === "pending") statusFilter = "pending";
      else if (activeTab === "paid") statusFilter = "paid";
      else if (activeTab === "active") statusFilter = "active";
      else if (activeTab === "expired") statusFilter = "expired";

      const result = await getTrainerRegistrations(trainerId, statusFilter);

      if (result.success) {
        setRegistrations(
          result.registrations.map((reg) => {
            let memberData = {};
            if (!reg.member_id && reg.member_data) {
              try {
                memberData = JSON.parse(reg.member_data);
              } catch (error) {
                console.error("เกิดข้อผิดพลาดในการแปลง member_data:", error);
              }
            }
            // กำหนดวันที่ปัจจุบัน (31 พฤษภาคม 2568, 16:49 น. +07)
            const currentDate = new Date("2025-05-31T16:49:00+07:00");
            const endDate = reg.registration_enddate
              ? new Date(reg.registration_enddate)
              : null;

            return {
              ...reg,
              member_name: reg.member_id
                ? `${reg.member_firstname} ${reg.member_lastname}`
                : `${memberData.member_firstname || ""} ${
                    memberData.member_lastname || ""
                  }`.trim(),
              member_email: reg.member_id
                ? reg.member_email
                : memberData.member_email || "",
              is_pending: reg.registration_status === "pending", // รอชำระเงิน
              is_paid: reg.registration_status === "paid", // ชำระเงินแล้ว
              is_active: reg.registration_status === "active", // ใช้งานอยู่
              is_expired:
                reg.registration_status === "expired" ||
                (endDate && endDate < currentDate), // หมดอายุ
            };
          })
        );
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลการลงทะเบียนได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClick = (registration) => {
    setSelectedRegistration(registration);
    setShowConfirmModal(true);
  };

  const getStatusBadge = (registration) => {
    switch (registration.registration_status) {
      case "pending":
        return <Badge className="bg-yellow-500">ยังไม่ชำระเงิน</Badge>;
      case "paid":
        return <Badge className="bg-blue-500">ชำระเงินแล้ว</Badge>;
      case "active":
        return <Badge className="bg-green-500">ใช้งานอยู่</Badge>;
      case "expired":
        return <Badge className="bg-red-500">หมดอายุ</Badge>;
      default:
        return <Badge className="bg-gray-500">ไม่ทราบสถานะ</Badge>;
    }
  };

  const getStatusIcon = (registration) => {
    switch (registration.registration_status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "paid":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "expired":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("th-TH", options);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">รายการลงทะเบียนของสมาชิก</CardTitle>
          <CardDescription>จัดการการลงทะเบียนของสมาชิกทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4 grid grid-cols-5 w-full">
              <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
              <TabsTrigger value="pending">ยังไม่ชำระเงิน</TabsTrigger>
              <TabsTrigger value="paid">ชำระเงินแล้ว</TabsTrigger>
              <TabsTrigger value="active">ใช้งานอยู่</TabsTrigger>
              <TabsTrigger value="expired">หมดอายุ</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-2">
              {loading ? (
                Array(3)
                  .fill()
                  .map((_, i) => (
                    <Card key={i} className="w-full overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                          <div>
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : registrations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">ไม่พบข้อมูลการลงทะเบียน</p>
                </div>
              ) : (
                registrations.map((registration) => (
                  <Card
                    key={registration.registration_id}
                    className="w-full overflow-hidden"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start md:items-center gap-3">
                          <div className="bg-gray-100 rounded-full p-2">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {registration.member_name || "ไม่ทราบชื่อ"}
                              </p>
                              {getStatusBadge(registration)}
                            </div>
                            <p className="text-sm text-gray-500">
                              {registration.member_email || "ไม่ทราบอีเมล"}
                            </p>
                            <div className="mt-2 text-sm flex flex-wrap gap-x-4 gap-y-1">
                              <span>
                                ลงทะเบียนเมื่อ:{" "}
                                <strong>
                                  {formatDate(
                                    registration.registration_startdate
                                  )}
                                </strong>
                              </span>
                              {registration.registration_enddate && (
                                <span>
                                  หมดอายุ:{" "}
                                  <strong>
                                    {formatDate(
                                      registration.registration_enddate
                                    )}
                                  </strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          {registration.is_paid && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmClick(registration)}
                              showIcon={false}
                            />
                          )}
                          {registration.is_active &&
                            !registration.is_expired && (
                              <Button variant="outline" size="sm">
                                ดูข้อมูล
                              </Button>
                            )}
                          {registration.is_expired && (
                            <Button variant="outline" size="sm">
                              ต่ออายุ
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* โมดอลยืนยันการลงทะเบียน */}
      <ConfirmRegistrationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        registration={selectedRegistration}
        trainerId={trainerId}
        onSuccess={() => {
          setShowConfirmModal(false);
          fetchRegistrations();
        }}
      />
    </>
  );
}
