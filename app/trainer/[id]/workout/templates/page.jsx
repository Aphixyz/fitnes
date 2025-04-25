"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWorkoutTemplates } from "@/actions/trainer/workout/workoutv1/workoutTemplateActions";
import { toast } from "@/components/ui/use-toast";
import WorkoutTemplateList from "@/app/trainer/_components/workout/WorkoutTemplateList";
import { ChevronLeft, Search, Plus, Filter } from "lucide-react";

export default function WorkoutTemplatesPage({ params }) {
  const { id: trainerId } = React.use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchTemplates();
  }, [trainerId]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const result = await getWorkoutTemplates(trainerId);

      if (result.success) {
        setTemplates(result.templates || []);
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description:
            result.message || "ไม่สามารถดึงข้อมูลเทมเพลตโปรแกรมการฝึกได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลเทมเพลตโปรแกรมการฝึกได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // กรองข้อมูลตามคำค้นหา
  const getFilteredTemplates = () => {
    return templates.filter((template) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        template.template_name.toLowerCase().includes(searchLower) ||
        (template.template_description &&
          template.template_description.toLowerCase().includes(searchLower)) ||
        template.trainer_name.toLowerCase().includes(searchLower);

      if (activeTab === "all") {
        return matchesSearch;
      } else if (activeTab === "my") {
        return (
          matchesSearch &&
          template.trainer_id.toString() === trainerId.toString()
        );
      } else if (activeTab === "public") {
        return matchesSearch && template.is_public === 1;
      }

      return matchesSearch;
    });
  };

  const filteredTemplates = getFilteredTemplates();

  // จัดการการค้นหา
  const handleSearch = (e) => {
    e.preventDefault();
    // ค้นหาจาก state ที่มีการอัพเดตแล้ว
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            เทมเพลตโปรแกรมการฝึก
          </h1>
          <p className="text-muted-foreground">
            เทมเพลตสำเร็จรูปสำหรับนำไปใช้กับสมาชิก
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" /> ย้อนกลับ
          </Button>
          <Button
            onClick={() =>
              router.push(`/trainer/${trainerId}/workout/templates/create`)
            }
          >
            <Plus className="mr-2 h-4 w-4" /> สร้างเทมเพลตใหม่
          </Button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex items-center max-w-xl">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาเทมเพลตโปรแกรมการฝึก"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button type="submit" className="ml-2">
          ค้นหา
        </Button>
      </form>

      {/* แสดงข้อความค้นหา */}
      {searchTerm && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            ผลการค้นหาสำหรับ:{" "}
            <span className="font-medium">"{searchTerm}"</span>
          </p>
          <Button
            variant="ghost"
            onClick={() => setSearchTerm("")}
            className="h-auto p-0 text-sm text-muted-foreground"
          >
            ล้างการค้นหา
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          <TabsTrigger value="my">ของฉัน</TabsTrigger>
          <TabsTrigger value="public">สาธารณะ</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="pt-4">
          {loading ? (
            <Card>
              <CardContent className="py-10">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3">กำลังโหลดข้อมูล...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <WorkoutTemplateList
              templates={filteredTemplates}
              trainerId={trainerId}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
