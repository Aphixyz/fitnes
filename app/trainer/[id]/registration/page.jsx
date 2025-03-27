"use client";

import { useState } from "react";
import { use } from "react"; // Import React.use()
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LinkGenerator from "../../_components/LinkGenerator";
import RegistrationList from "../../_components/RegistrationList";

export default function TrainerRegistrationPage({ params }) {
  const { id: trainerId } = use(params); // ใช้ React.use() เพื่อดึงค่า params

  const [activeTab, setActiveTab] = useState("link");

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">การลงทะเบียน</h1>
        <p className="text-gray-500">
          สร้างลิงก์ลงทะเบียนและจัดการการลงทะเบียนของสมาชิก
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="link">สร้างลิงก์ลงทะเบียน</TabsTrigger>
          <TabsTrigger value="list">รายการลงทะเบียน</TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="space-y-6">
          <div className="max-w-3xl mx-auto">
            <LinkGenerator trainerId={trainerId} />

            <div className="mt-8 bg-gray-50 border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">คำแนะนำการใช้งาน</h2>
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  คลิกปุ่ม "สร้างลิงก์ลงทะเบียน" เพื่อสร้างลิงก์สำหรับสมาชิกใหม่
                </li>
                <li>
                  คัดลอกลิงก์ที่สร้างขึ้นและส่งให้สมาชิกผ่านช่องทางที่ต้องการ
                </li>
                <li>
                  เมื่อสมาชิกลงทะเบียนผ่านลิงก์ จะมีรายการลงทะเบียนปรากฏในแท็บ
                  "รายการลงทะเบียน"
                </li>
                <li>ตรวจสอบและยืนยันการลงทะเบียนของสมาชิกใหม่</li>
              </ol>

              <div className="mt-4 p-3 bg-blue-50 rounded-md text-blue-700 text-sm border border-blue-200">
                <p className="font-medium">หมายเหตุ:</p>
                <p>
                  เมื่อสมาชิกลงทะเบียนแล้ว
                  คุณจะต้องยืนยันการลงทะเบียนและกำหนดวันเริ่มต้น-สิ้นสุดการใช้งาน
                  ก่อนที่สมาชิกจะสามารถเข้าใช้งานระบบได้
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <RegistrationList trainerId={trainerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
