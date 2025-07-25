"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  Calendar,
  Search,
  Edit,
  Trash2,
  Plus,
  X,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  fetchIntakeList,
  fetchIntakeById,
} from "@/actions/member/my-nutrition-plans/fetchIntakeList";
import { editIntakeRecord } from "@/actions/member/my-nutrition-plans/editIntake";
import { deleteIntakeRecord } from "@/actions/member/my-nutrition-plans/deleteIntake";

// ===== Utility Functions =====
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

export default function HistoryNutrientPage() {
  const params = useParams();
  const memberId = parseInt(params.id);
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // ===== State Management =====
  const [intakeHistory, setIntakeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 วันล่าสุด
    endDate: new Date().toISOString().split("T")[0],
  });

  // Form state สำหรับแก้ไข
  const [editForm, setEditForm] = useState({
    date: "",
    calories: "",
    protein: "",
    carb: "",
    fat: "",
  });

  // ===== Load ประวัติข้อมูล =====
  useEffect(() => {
    loadIntakeHistory();
  }, [dateRange]);

  const loadIntakeHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchIntakeList(
        memberId,
        dateRange.startDate,
        dateRange.endDate
      );
      setIntakeHistory(data);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== Event Handlers =====
  const handleViewDetail = async (intakeId) => {
    try {
      const record = await fetchIntakeById(intakeId, memberId);
      setSelectedRecord(record);
      setShowDetail(true);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStartEdit = (record) => {
    setEditForm({
      date: record.date,
      calories: record.calories.toString(),
      protein: record.protein.toString(),
      carb: record.carb.toString(),
      fat: record.fat.toString(),
    });
    setSelectedRecord(record);
    setShowEdit(true);
    // ตั้งค่าวันที่เริ่มต้นเป็นวันที่ของ record นั้น
    setEditSelectedDate(new Date(record.date));
  };

  const handleSaveEdit = async () => {
    try {
      // ใช้วันที่จาก date picker หรือวันที่เดิม
      const dateToSave = format(editSelectedDate, "yyyy-MM-dd");

      const updatedRecord = await editIntakeRecord(
        selectedRecord.intake_id,
        memberId,
        {
          date: dateToSave,
          calories: parseInt(editForm.calories),
          protein: parseInt(editForm.protein),
          carb: parseInt(editForm.carb),
          fat: parseInt(editForm.fat),
        }
      );

      // อัพเดทข้อมูลใน state
      setIntakeHistory((prev) =>
        prev.map((item) =>
          item.intake_id === selectedRecord.intake_id ? updatedRecord : item
        )
      );

      setShowEdit(false);
      setSelectedRecord(null);

      toast({
        title: "บันทึกสำเร็จ",
        description: "แก้ไขข้อมูลเรียบร้อยแล้ว",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (intakeId) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?")) return;

    try {
      await deleteIntakeRecord(intakeId, memberId);

      // ลบออกจาก state
      setIntakeHistory((prev) =>
        prev.filter((item) => item.intake_id !== intakeId)
      );

      if (selectedRecord?.intake_id === intakeId) {
        setShowDetail(false);
        setSelectedRecord(null);
      }

      toast({
        title: "ลบสำเร็จ",
        description: "ลบข้อมูลเรียบร้อยแล้ว",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ===== Utility Functions =====
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateTotalCalories = (protein, carb, fat) => {
    return protein * 4 + carb * 4 + fat * 9;
  };

  // ===== Form Fields Configuration =====
  const formFields = [
    {
      id: "calories",
      label: "พลังงาน",
      unit: "กิโลแคล",
    },
    {
      id: "protein",
      label: "โปรตีน",
      unit: "กรัม",
    },
    {
      id: "carb",
      label: "คาร์บ",
      unit: "กรัม",
    },
    {
      id: "fat",
      label: "ไขมัน",
      unit: "กรัม",
    },
  ];

  // State สำหรับ date picker ใน edit form
  const [editSelectedDate, setEditSelectedDate] = useState(new Date());

  // ===== Date Picker Component =====
  const DatePicker = ({ selectedDate, onDateChange }) => {
    const isDateDisabled = (date) => {
      // อนุญาตให้เลือกได้เฉพาะวันในอดีตและวันปัจจุบัน
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return date > today;
    };

    const formattedDate = format(selectedDate, " d MMMM yyyy", { locale: th });

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto p-0 text-xl font-bold hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
          >
            {formattedDate}
            <CalendarIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            disabled={isDateDisabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* ===== Header ===== */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ประวัติการบันทึก
        </h1>
        <p className="text-gray-600">
          ดูและจัดการประวัติการบันทึก macronutrient
        </p>
      </div>

      {/* ===== Date Range Filter ===== */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            เลือกช่วงวันที่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                วันที่เริ่มต้น
              </Label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                วันที่สิ้นสุด
              </Label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Intake History List ===== */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : intakeHistory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">ไม่พบข้อมูลในช่วงวันที่ที่เลือก</p>
            </CardContent>
          </Card>
        ) : (
          intakeHistory.map((record) => (
            <Card
              key={record.intake_id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewDetail(record.intake_id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {formatDate(record.date)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      บันทึกเมื่อ{" "}
                      {new Date(record.create_at).toLocaleString("th-TH")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {record.calories} kcal
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-blue-600">
                      {record.protein}g
                    </p>
                    <p className="text-gray-500">โปรตีน</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-green-600">{record.carb}g</p>
                    <p className="text-gray-500">คาร์บ</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-orange-600">{record.fat}g</p>
                    <p className="text-gray-500">ไขมัน</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(record);
                    }}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    แก้ไข
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(record.intake_id);
                    }}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    ลบ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ===== Detail Drawer ===== */}
      <Drawer open={showDetail} onOpenChange={setShowDetail}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-4">
            <DrawerTitle className="sr-only">รายละเอียดข้อมูล</DrawerTitle>
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedRecord && formatDate(selectedRecord.date)}
                </h2>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-xl" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {selectedRecord && (
            <div className="px-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  บันทึกเมื่อ{" "}
                  {new Date(selectedRecord.create_at).toLocaleString("th-TH")}
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-lg">แคลอรี่รวม</span>
                  <span className="font-semibold text-2xl text-gray-900">
                    {selectedRecord.calories} kcal
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedRecord.protein}
                    </p>
                    <p className="text-sm text-gray-600">โปรตีน (g)</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      {selectedRecord.carb}
                    </p>
                    <p className="text-sm text-gray-600">คาร์บ (g)</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">
                      {selectedRecord.fat}
                    </p>
                    <p className="text-sm text-gray-600">ไขมัน (g)</p>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  แคลอรี่ที่คำนวณ:{" "}
                  {calculateTotalCalories(
                    selectedRecord.protein,
                    selectedRecord.carb,
                    selectedRecord.fat
                  )}{" "}
                  kcal
                </div>
              </div>
            </div>
          )}

          <DrawerFooter>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowDetail(false);
                  handleStartEdit(selectedRecord);
                }}
                className="flex-1 h-12 text-base font-semibold"
              >
                <Edit className="w-4 h-4 mr-2" />
                แก้ไข
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDetail(false);
                  handleDelete(selectedRecord.intake_id);
                }}
                className="flex-1 h-12 text-base font-semibold"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ลบ
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* ===== Edit Drawer ===== */}
      <Drawer open={showEdit} onOpenChange={setShowEdit}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-4">
            <DrawerTitle className="sr-only">แก้ไขข้อมูล</DrawerTitle>
            <div className="flex items-center justify-between">
              {/* Date Picker */}
              <div className="space-y-3 flex-1 flex justify-center">
                <div className="flex justify-center">
                  <DatePicker
                    selectedDate={editSelectedDate}
                    onDateChange={setEditSelectedDate}
                  />
                </div>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-xl" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="px-6 space-y-6">
            {/* Form Fields */}
            <form className="space-y-6">
              {formFields.map((field) => (
                <div key={field.id} className="space-y-3">
                  <div className="flex items-center justify-between gap-6">
                    <Label
                      htmlFor={field.id}
                      className="text-xl font-semibold text-gray-800 min-w-24"
                    >
                      {field.label}
                    </Label>
                    <div className="relative flex-1 max-w-52">
                      <Input
                        id={field.id}
                        type="text"
                        inputMode="decimal"
                        value={editForm[field.id]}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(
                            /[^0-9.]/g,
                            ""
                          );
                          setEditForm((prev) => ({
                            ...prev,
                            [field.id]: numericValue,
                          }));
                        }}
                        className="h-12 text-base pr-20"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-sm font-medium text-gray-600">
                          {field.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </form>
          </div>

          <DrawerFooter>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEdit(false)}
                className="flex-1 h-12 text-base font-semibold"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                บันทึก
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
