"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Eye, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import MemberAvatar from "@/components/ui/MemberAvatar";

const RegistrationActionMenu = ({
  registration,
  trainerId,
  onRegistrationUpdated,
}) => {
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extendDuration, setExtendDuration] = useState("1");
  const [dropdownOpen, setDropdownOpen] = useState(false); // เพิ่ม state สำหรับ dropdown

  // ดูรายละเอียดลูกค้า - ปิด dropdown ก่อน
  const handleViewCustomerDetails = () => {
    setDropdownOpen(false); // ปิด dropdown ก่อน
    // ใช้ setTimeout เพื่อให้ dropdown ปิดก่อน
    setTimeout(() => {
      setShowDetailDialog(true);
    }, 100);
  };

  // ต่ออายุแพ็คเกจ - ปิด dropdown ก่อน
  const handleExtendPackageClick = () => {
    setDropdownOpen(false); // ปิด dropdown ก่อน
    setTimeout(() => {
      setShowExtendDialog(true);
    }, 100);
  };

  // จัดการปิด dialog รายละเอียด - แก้ไขให้รับ boolean
  const handleDetailDialogChange = (open) => {
    setShowDetailDialog(open);
    if (!open) {
      // Reset focus หลังปิด dialog
      setTimeout(() => {
        document.body.focus();
      }, 100);
    }
  };

  // จัดการปิด dialog ต่ออายุ - แก้ไขให้รับ boolean
  const handleExtendDialogChange = (open) => {
    setShowExtendDialog(open);
    if (!open) {
      setExtendDuration("1"); // รีเซ็ตค่า
      setIsProcessing(false);
      // Reset focus หลังปิด dialog
      setTimeout(() => {
        document.body.focus();
      }, 100);
    }
  };

  // ต่ออายุแพ็คเกจ
  const handleExtendPackage = async () => {
    if (!extendDuration || extendDuration <= 0) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุจำนวนเดือนที่ต้องการต่ออายุ",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Mock success response for now
      const result = { success: true, message: "ต่ออายุแพ็คเกจเรียบร้อยแล้ว" };

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: result.message,
          variant: "default",
        });

        if (onRegistrationUpdated) {
          onRegistrationUpdated(registration.registration_id, "extended");
        }
        
        // ปิด dialog หลังสำเร็จ
        handleExtendDialogChange(false);
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error extending package:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถต่ออายุแพ็คเกจได้ในขณะนี้",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // สร้างชื่อเต็มของลูกค้า
  const getCustomerFullName = () => {
    const firstname = registration.member_firstname || "";
    const lastname = registration.member_lastname || "";
    return `${firstname} ${lastname}`.trim() || "ไม่ทราบชื่อ";
  };

  // เช็คสถานะแพ็คเกจ
  const getPackageStatus = () => {
    const endDate = registration.registration_enddate;
    if (!endDate) return { status: "unknown", label: "ไม่ทราบสถานะ" };

    const today = new Date();
    const packageEndDate = new Date(endDate);

    today.setHours(0, 0, 0, 0);
    packageEndDate.setHours(0, 0, 0, 0);

    return packageEndDate < today
      ? { status: "expired", label: "หมดอายุ" }
      : { status: "active", label: "ใช้งานอยู่" };
  };

  const packageStatus = getPackageStatus();

  // ทำความสะอาดเมื่อ component unmount
  useEffect(() => {
    return () => {
      // Force cleanup เมื่อ component ถูก unmount
      setShowDetailDialog(false);
      setShowExtendDialog(false);
      setDropdownOpen(false);
      setIsProcessing(false);
      
      // ลบ modal backdrop ที่อาจค้างอยู่
      const backdrops = document.querySelectorAll('[data-radix-popper-content-wrapper], .fixed.inset-0');
      backdrops.forEach(backdrop => {
        if (backdrop.style.pointerEvents === 'none' || 
            backdrop.classList.contains('bg-black/80') ||
            backdrop.getAttribute('data-state') === 'closed') {
          backdrop.remove();
        }
      });
      
      // Reset body styles
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, []);

  // ป้องกันการเปิด dialog หลายตัวพร้อมกัน
  useEffect(() => {
    if (showDetailDialog && showExtendDialog) {
      setShowExtendDialog(false);
    }
  }, [showDetailDialog, showExtendDialog]);

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="เมนูจัดการลูกค้า"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>จัดการลูกค้า</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={handleViewCustomerDetails}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            ดูรายละเอียด
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleExtendPackageClick}
            className="cursor-pointer text-blue-600 focus:text-blue-600"
          >
            <Clock className="mr-2 h-4 w-4" />
            ต่ออายุแพ็คเกจ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog ดูรายละเอียดลูกค้า */}
      <Dialog 
        open={showDetailDialog} 
        onOpenChange={handleDetailDialogChange}
        modal={true}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>รายละเอียดลูกค้า</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* ข้อมูลลูกค้า */}
            <div className="flex items-center space-x-4">
              <MemberAvatar
                firstname={registration.member_firstname}
                lastname={registration.member_lastname}
                profileImage={registration.member_profileimage}
                size="lg"
              />
              <div>
                <h3 className="font-medium text-gray-900 text-lg">
                  {getCustomerFullName()}
                </h3>
                {registration.member_email && (
                  <p className="text-sm text-gray-500">
                    {registration.member_email}
                  </p>
                )}
                {registration.member_phone && (
                  <p className="text-sm text-gray-500">
                    {registration.member_phone}
                  </p>
                )}
              </div>
            </div>

            {/* ข้อมูลแพ็คเกจ */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">ข้อมูลแพ็คเกจ</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">แพ็คเกจ:</span>{" "}
                  <span className="font-medium">
                    {registration.packages_name || "ไม่ระบุ"}
                  </span>
                </div>
                {registration.packages_price > 0 && (
                  <div>
                    <span className="text-gray-600">ราคา:</span> ฿
                    {registration.packages_price?.toLocaleString()}
                  </div>
                )}
                {registration.packages_duration_months && (
                  <div>
                    <span className="text-gray-600">ระยะเวลา:</span>{" "}
                    {registration.packages_duration_months} เดือน
                  </div>
                )}
              </div>
            </div>

            {/* ข้อมูลวันที่และสถานะ */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">สถานะและวันที่</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">สถานะ:</span>
                  <Badge
                    className={
                      packageStatus.status === "expired"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {packageStatus.label}
                  </Badge>
                </div>

                {registration.registration_startdate && (
                  <div>
                    <span className="text-gray-600">วันที่เริ่มต้น:</span>{" "}
                    {new Date(
                      registration.registration_startdate
                    ).toLocaleDateString("th-TH")}
                  </div>
                )}

                {registration.registration_enddate && (
                  <div>
                    <span className="text-gray-600">วันที่สิ้นสุด:</span>{" "}
                    {new Date(
                      registration.registration_enddate
                    ).toLocaleDateString("th-TH")}
                  </div>
                )}
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDetailDialogChange(false)}
            >
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ต่ออายุแพ็คเกจ */}
      <Dialog 
        open={showExtendDialog} 
        onOpenChange={handleExtendDialogChange}
        modal={true}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ต่ออายุแพ็คเกจ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">ลูกค้า</h4>
              <p className="text-sm text-gray-600">{getCustomerFullName()}</p>
              <h4 className="font-medium text-gray-900 mb-1 mt-2">
                แพ็คเกจปัจจุบัน
              </h4>
              <p className="text-sm text-gray-600">
                {registration.packages_name}
              </p>
              {registration.registration_enddate && (
                <>
                  <h4 className="font-medium text-gray-900 mb-1 mt-2">
                    วันหมดอายุปัจจุบัน
                  </h4>
                  <p className="text-sm text-gray-600">
                    {new Date(
                      registration.registration_enddate
                    ).toLocaleDateString("th-TH")}
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="extendDuration">
                จำนวนเดือนที่ต้องการต่ออายุ
              </Label>
              <Input
                id="extendDuration"
                type="number"
                min="1"
                max="12"
                value={extendDuration}
                onChange={(e) => setExtendDuration(e.target.value)}
                placeholder="ระบุจำนวนเดือน"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500">
                หลังจากต่ออายุแล้ว แพ็คเกจจะหมดอายุในวันที่:{" "}
                {registration.registration_enddate &&
                  extendDuration &&
                  new Date(
                    new Date(registration.registration_enddate).setMonth(
                      new Date(registration.registration_enddate).getMonth() +
                        parseInt(extendDuration)
                    )
                  ).toLocaleDateString("th-TH")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleExtendDialogChange(false)}
              disabled={isProcessing}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleExtendPackage}
              disabled={isProcessing || !extendDuration}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? "กำลังดำเนินการ..." : "ต่ออายุแพ็คเกจ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegistrationActionMenu;