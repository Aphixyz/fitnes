"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getTrainerData } from "@/actions/admin/getTrainer";
import { getMemberWithTrainer } from "@/actions/admin/member/getMemberWithTrainer";
import { getRevenueByPackage } from "@/actions/admin/getPrice";

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    {
      title: "ผู้ฝึกสอนทั้งหมด",
      value: "0",
      change: "",
      changeType: "neutral",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      title: "สมาชิกทั้งหมด",
      value: "0",
      change: "",
      changeType: "neutral",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      title: "รายได้ประจำเดือน",
      value: "฿0",
      change: "",
      changeType: "neutral",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "แผนออกกำลังกายทั้งหมด",
      value: "874",
      change: "+54",
      changeType: "increase",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        const [trainers, membersResponse, revenueResponse] = await Promise.all([
          getTrainerData(),
          getMemberWithTrainer(),
          getRevenueByPackage(),
        ]);

        const members = membersResponse.success ? membersResponse.data : [];
        
        const currentMonth = new Date().toISOString().slice(0, 7);
        const filteredRevenue = revenueResponse.success
          ? revenueResponse.data.filter(item => item.revenue_month === currentMonth)
          : [];
        const currentMonthRevenue = revenueResponse.success
          ? filteredRevenue.reduce((sum, item) => {
              const revenue = Number(item.monthly_revenue) || 0;
              return sum + revenue;
            }, 0)
          : 0;

        // ดึงข้อมูลก่อนหน้าจาก localStorage
        const previousData = JSON.parse(localStorage.getItem("previousData")) || {
          trainers: 0,
          members: 0,
          revenue: 0, // ตั้งค่าเริ่มต้นเป็น 0 ถ้าไม่มีข้อมูล
        };

        // คำนวณการเปลี่ยนแปลงของรายได้ โดยแปลงเป็นตัวเลขให้ชัดเจน
        const previousRevenue = Number(previousData.revenue) || 0; // แปลงเป็นตัวเลขถ้าเป็น undefined
        const revenueChange = currentMonthRevenue - previousRevenue;

        // ดีบักเพื่อตรวจสอบค่า
        console.log("currentMonthRevenue:", currentMonthRevenue);
        console.log("previousRevenue:", previousRevenue);
        console.log("revenueChange:", revenueChange);

        // อัปเดต localStorage ด้วยข้อมูลปัจจุบัน
        localStorage.setItem(
          "previousData",
          JSON.stringify({
            trainers: trainers.length,
            members: members.length,
            revenue: currentMonthRevenue,
          })
        );

        const trainerChange = trainers.length - previousData.trainers;
        const memberChange = members.length - previousData.members;

        setStats((prevStats) => {
          const newStats = [...prevStats];

          newStats[0] = {
            ...newStats[0],
            value: trainers.length.toString(),
            change:
              trainerChange !== 0
                ? trainerChange > 0
                  ? `+${trainerChange}`
                  : trainerChange.toString()
                : "",
            changeType:
              trainerChange > 0
                ? "increase"
                : trainerChange < 0
                ? "decrease"
                : "neutral",
          };

          newStats[1] = {
            ...newStats[1],
            value: members.length.toString(),
            change:
              memberChange !== 0
                ? memberChange > 0
                  ? `+${memberChange}`
                  : memberChange.toString()
                : "",
            changeType:
              memberChange > 0
                ? "increase"
                : memberChange < 0
                ? "decrease"
                : "neutral",
          };

          newStats[2] = {
            ...newStats[2],
            value: `฿${currentMonthRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change:
              revenueChange !== 0
                ? revenueChange > 0
                  ? `+${revenueChange.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : revenueChange.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "",
            changeType:
              revenueChange > 0
                ? "increase"
                : revenueChange < 0
                ? "decrease"
                : "neutral",
          };

          return newStats;
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          แดชบอร์ดผู้ดูแลระบบ
        </h1>
        <p className="text-muted-foreground">
          ดูภาพรวมระบบติดตามการออกกำลังกายและโภชนาการส่วนบุคคล
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                  {stat.change && (
                    <div
                      className={`text-sm ${
                        stat.changeType === "increase"
                          ? "text-green-500"
                          : stat.changeType === "decrease"
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {stat.change}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>ภาพรวมประจำเดือน</CardTitle>
            <CardDescription>แสดงสถิติการใช้งานระบบรายเดือน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-muted-foreground">แสดงกราฟข้อมูลที่นี่</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สมาชิกใหม่ในเดือนนี้</CardTitle>
            <CardDescription>
              แสดงสมาชิกใหม่ล่าสุดที่เข้ามาในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-full">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {
                        [
                          "ผู้ฝึกสอนใหม่ลงทะเบียน",
                          "สมาชิกใหม่ลงทะเบียน",
                          "มีการชำระเงิน",
                          "แผนออกกำลังกายถูกสร้าง",
                        ][i]
                      }
                    </p>
                    {/* <p className="text-xs text-muted-foreground">
                      {
                        [
                          "2 นาทีที่แล้ว",
                          "15 นาทีที่แล้ว",
                          "45 นาทีที่แล้ว",
                          "1 ชั่วโมงที่แล้ว",
                        ][i]
                      }
                    </p> */}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}