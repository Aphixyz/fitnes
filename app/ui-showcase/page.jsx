"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Navbar } from "@/components/ui/navbar";
import { Sidebar } from "@/components/ui/sidebar";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";

export default function UIShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState("all");

  const navItems = [
    { label: "หน้าหลัก", href: "#" },
    { label: "เกี่ยวกับเรา", href: "#" },
    { label: "บริการ", href: "#" },
    { label: "ติดต่อ", href: "#" },
  ];

  const sidebarItems = [
    { label: "แดชบอร์ด", href: "#", icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg> },
    { label: "โปรไฟล์", href: "#", icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg> },
    { label: "การออกกำลังกาย", href: "#", icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5z"></path><path d="M11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg> },
    { label: "โภชนาการ", href: "#", icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd"></path></svg> },
    { label: "รายงาน", href: "#", icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd"></path></svg> },
  ];

  const tableData = [
    { id: 1, name: "วิ่ง", duration: "30 นาที", calories: 300 },
    { id: 2, name: "ว่ายน้ำ", duration: "45 นาที", calories: 450 },
    { id: 3, name: "ปั่นจักรยาน", duration: "60 นาที", calories: 500 },
    { id: 4, name: "เวทเทรนนิ่ง", duration: "50 นาที", calories: 350 },
  ];

  const renderSection = (section) => {
    if (currentSection !== "all" && currentSection !== section) return null;

    switch (section) {
      case "buttons":
        return (
          <div className="mb-12 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Button Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Button Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Button Sizes</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon" variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m19 19-4-4"/>
                      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Button States</h3>
                <div className="flex flex-wrap gap-2">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button isLoading>Loading</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "cards":
        return (
          <div className="mb-12 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Card Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>การออกกำลังกายของฉัน</CardTitle>
                  <CardDescription>ติดตามกิจกรรมการออกกำลังกายประจำวัน</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>วันนี้คุณได้ออกกำลังกายแล้ว 45 นาที ซึ่งเป็น 75% ของเป้าหมายรายวัน</p>
                </CardContent>
                <CardFooter>
                  <Button>ดูรายละเอียด</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>โภชนาการของฉัน</CardTitle>
                  <CardDescription>ติดตามการบริโภคอาหารประจำวัน</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>วันนี้คุณได้รับพลังงาน 1,500 แคลอรี่ จากเป้าหมาย 2,000 แคลอรี่</p>
                </CardContent>
                <CardFooter>
                  <Button>ดูรายละเอียด</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        );

      case "inputs":
        return (
          <div className="mb-12 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Input Components</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อ</label>
                <Input placeholder="กรุณากรอกชื่อ" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">อีเมล</label>
                <Input type="email" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">รหัสผ่าน</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ที่อยู่ (ปิดการใช้งาน)</label>
                <Input disabled placeholder="ที่อยู่ของคุณ" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">อายุ (Error)</label>
                <Input error="กรุณากรอกอายุให้ถูกต้อง" placeholder="กรุณากรอกอายุ" />
              </div>
            </div>
          </div>
        );

      case "modals":
        return (
          <div className="mb-12 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Modal Components</h2>
            <div className="space-y-4">
              <Button onClick={() => setIsModalOpen(true)}>เปิด Modal</Button>
              
              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="บันทึกการออกกำลังกาย"
                description="กรุณากรอกรายละเอียดการออกกำลังกายของคุณ"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ประเภทการออกกำลังกาย</label>
                    <Input placeholder="เช่น วิ่ง, ว่ายน้ำ, ปั่นจักรยาน" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ระยะเวลา (นาที)</label>
                    <Input type="number" placeholder="เช่น 30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">แคลอรี่ที่เผาผลาญ</label>
                    <Input type="number" placeholder="เช่น 300" />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
                    <Button onClick={() => setIsModalOpen(false)}>บันทึก</Button>
                  </div>
                </div>
              </Modal>
            </div>
          </div>
        );

      case "navbar":
        return (
          <div className="mb-12 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Navbar Components</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Navbar for Member</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Navbar 
                    logo="FitTrack" 
                    menuItems={navItems} 
                    userRole="member"
                    rightItems={<Button size="sm">ออกจากระบบ</Button>}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Navbar for Trainer</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Navbar 
                    logo="FitTrack" 
                    menuItems={navItems} 
                    userRole="trainer"
                    rightItems={<Button size="sm" variant="outline">ออกจากระบบ</Button>}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Navbar for Admin</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Navbar 
                    logo="FitTrack" 
                    menuItems={navItems} 
                    userRole="admin"
                    rightItems={<Button size="sm" variant="outline">ออกจากระบบ</Button>}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "sidebar":
        return (
          <div className="mb-12 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Sidebar Components</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Sidebar for Member</h3>
                <div className="h-96 border rounded-lg overflow-hidden">
                  <div className="flex h-full">
                    <Sidebar 
                      logo="FitTrack" 
                      menuItems={sidebarItems} 
                      userRole="member"
                      defaultCollapsed={false}
                    />
                    <div className="flex-1 p-4 bg-gray-100">
                      <p>เนื้อหาของหน้าเว็บจะแสดงตรงนี้</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Sidebar for Trainer (Collapsed)</h3>
                <div className="h-96 border rounded-lg overflow-hidden">
                  <div className="flex h-full">
                    <Sidebar 
                      logo="FitTrack" 
                      menuItems={sidebarItems} 
                      userRole="trainer"
                      defaultCollapsed={true}
                    />
                    <div className="flex-1 p-4 bg-gray-100">
                      <p>เนื้อหาของหน้าเว็บจะแสดงตรงนี้</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Sidebar for Admin</h3>
                <div className="h-96 border rounded-lg overflow-hidden">
                  <div className="flex h-full">
                    <Sidebar 
                      logo="FitTrack" 
                      menuItems={sidebarItems} 
                      userRole="admin"
                      defaultCollapsed={false}
                    />
                    <div className="flex-1 p-4 bg-gray-100">
                      <p>เนื้อหาของหน้าเว็บจะแสดงตรงนี้</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "tables":
        return (
          <div className="mb-12 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Table Components</h2>
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>กิจกรรมการออกกำลังกาย</TableHead>
                    <TableHead>ระยะเวลา</TableHead>
                    <TableHead>แคลอรี่</TableHead>
                    <TableHead>การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.duration}</TableCell>
                      <TableCell>{item.calories}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">แก้ไข</Button>
                          <Button size="sm" variant="destructive">ลบ</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>รวมทั้งหมด</TableCell>
                    <TableCell>185 นาที</TableCell>
                    <TableCell>1600 แคลอรี่</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar 
        logo="UI Showcase" 
        userRole="member"
        menuItems={[
          { label: "หน้าหลัก", href: "#" },
          { label: "คอมโพเนนต์", href: "#" },
        ]}
        rightItems={<Button size="sm">ออกจากระบบ</Button>}
      />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">UI Component Showcase</h1>
          <p className="mt-2 text-gray-600">แสดงตัวอย่าง UI Components ทั้งหมดที่พัฒนาขึ้น</p>
        </div>
        
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={currentSection === "all" ? "default" : "outline"} 
              onClick={() => setCurrentSection("all")}
            >
              ทั้งหมด
            </Button>
            <Button 
              variant={currentSection === "buttons" ? "default" : "outline"} 
              onClick={() => setCurrentSection("buttons")}
            >
              Buttons
            </Button>
            <Button 
              variant={currentSection === "cards" ? "default" : "outline"} 
              onClick={() => setCurrentSection("cards")}
            >
              Cards
            </Button>
            <Button 
              variant={currentSection === "inputs" ? "default" : "outline"} 
              onClick={() => setCurrentSection("inputs")}
            >
              Inputs
            </Button>
            <Button 
              variant={currentSection === "modals" ? "default" : "outline"} 
              onClick={() => setCurrentSection("modals")}
            >
              Modals
            </Button>
            <Button 
              variant={currentSection === "navbar" ? "default" : "outline"} 
              onClick={() => setCurrentSection("navbar")}
            >
              Navbar
            </Button>
            <Button 
              variant={currentSection === "sidebar" ? "default" : "outline"} 
              onClick={() => setCurrentSection("sidebar")}
            >
              Sidebar
            </Button>
            <Button 
              variant={currentSection === "tables" ? "default" : "outline"} 
              onClick={() => setCurrentSection("tables")}
            >
              Tables
            </Button>
          </div>
        </div>
        
        {renderSection("buttons")}
        {renderSection("cards")}
        {renderSection("inputs")}
        {renderSection("modals")}
        {renderSection("navbar")}
        {renderSection("sidebar")}
        {renderSection("tables")}
      </div>
    </div>
  );
}