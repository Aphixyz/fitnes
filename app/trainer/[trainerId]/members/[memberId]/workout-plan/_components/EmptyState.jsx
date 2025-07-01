"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

export default function EmptyState({ trainerId, memberId }) {
  return (
    <Card className="bg-gradient-to-r from-gray-50 to-blue-50 overflow-hidden">
      <CardContent className="pt-8 pb-8">
        <div className="flex flex-col items-center justify-center text-center p-4">
          <div className="rounded-full bg-blue-100 p-4 mb-4">
            <FileText className="h-10 w-10 text-blue-600" />
          </div>

          <h3 className="text-xl font-bold mb-2">
            ยังไม่มีแผนการออกกำลังกายที่ใช้งานอยู่
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            ขณะนี้สมาชิกยังไม่มีแผนการออกกำลังกายที่กำลังใช้งานอยู่
            สร้างแผนการออกกำลังกายหรือเปลี่ยนสถานะแผนที่มีอยู่เป็น "กำลังใช้งาน"
          </p>

          <Link
            href={`/trainer/${trainerId}/members/${memberId}/workout-plan/create`}
          >
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              สร้างแผนออกกำลังกายแรก
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
