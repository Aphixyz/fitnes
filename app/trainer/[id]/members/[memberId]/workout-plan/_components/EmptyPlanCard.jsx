import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EmptyPlanCard({ trainerId, memberId }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground mb-4">
          ยังไม่มีแผนออกกำลังกายสำหรับสมาชิกนี้
        </p>
        <Link
          href={`/trainer/${trainerId}/members/${memberId}/workout-plan/create`}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            สร้างแผนใหม่
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}