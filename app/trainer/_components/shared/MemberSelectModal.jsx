"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { getTrainerMembers } from "@/actions/trainer/getTrainerMembers";
import { Card, CardContent } from "@/components/ui/card";
import { User, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MemberSelectModal({ isOpen, onClose, trainerId, routePath = "workout-plan/create" }) {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ดึงข้อมูลสมาชิกที่มีสถานะ "ใช้งาน" เท่านั้นเมื่อโมดัลเปิด
  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, trainerId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const result = await getTrainerMembers({
        trainerId,
        status: "active", // เฉพาะสมาชิกที่มีสถานะ "ใช้งาน" เท่านั้น
        pageSize: 100,
      });

      if (result.success) {
        setMembers(result.members);
      } else {
        setError(result.message || "ไม่สามารถดึงข้อมูลสมาชิกได้");
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลสมาชิก",
          variant: "destructive",
        });
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // เลือกสมาชิกและนำทางไปยังหน้าสร้างแผน (route path ถูกส่งมาเป็น prop)
  const handleSelectMember = (memberId) => {
    router.push(`/trainer/${trainerId}/members/${memberId}/${routePath}`);
    onClose();
  };

  // กรองสมาชิกตามคำค้นหา
  const filteredMembers = members.filter((member) => {
    if (!searchTerm) return true;
    const fullName = `${member.member_firstname} ${member.member_lastname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เลือกสมาชิกสำหรับสร้างแผน</DialogTitle>
          <DialogDescription>
            เลือกสมาชิกที่คุณต้องการสร้างแผนสำหรับเขา
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          {/* ช่องค้นหา */}
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาสมาชิก"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* รายการสมาชิก */}
          <div className="max-h-[40vh] overflow-y-auto pr-4">
            {loading ? (
              // แสดง skeleton ขณะโหลด
              Array(5).fill().map((_, i) => (
                <Card key={i} className="mb-2">
                  <CardContent className="p-3 flex items-center">
                    <div className="animate-pulse h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="ml-3 space-y-1">
                      <div className="animate-pulse h-4 w-32 bg-gray-200"></div>
                      <div className="animate-pulse h-3 w-24 bg-gray-200"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              // แสดงข้อผิดพลาด
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : filteredMembers.length === 0 ? (
              // ไม่พบสมาชิก
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "ไม่พบสมาชิกที่ตรงกับการค้นหา" : "ไม่พบสมาชิกที่มีสถานะใช้งาน"}
              </div>
            ) : (
              // รายการสมาชิก
              filteredMembers.map((member) => (
                <Card
                  key={member.member_id}
                  className="mb-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSelectMember(member.member_id)}
                >
                  <CardContent className="p-3 flex items-center">
                    {member.member_profileimage ? (
                      <img
                        src={member.member_profileimage}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div className="ml-3 flex-1">
                      <p className="font-medium">
                        {member.member_firstname} {member.member_lastname}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.member_email}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      ใช้งาน
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}