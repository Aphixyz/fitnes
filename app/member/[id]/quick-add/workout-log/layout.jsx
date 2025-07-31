import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function WorkoutLogLayout({ children, params }) {
  const { id } = await params;
  const memberId = parseInt(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href={`/member/${memberId}/dashboard`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              บันทึกการออกกำลังกาย
            </h1>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
