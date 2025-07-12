"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { X, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { InsertLogNutrition } from "@/actions/member/my-nutrition-plans/upsertLogNutrtion";

// ===== Responsive Modal Components =====
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ===== Visually Hidden Component =====
const VisuallyHidden = ({ children }) => (
  <span className="sr-only">{children}</span>
);

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

const NutrientLogModal = ({ isOpen, onClose, memberId }) => {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // ===== State Management =====
  const [formData, setFormData] = useState({
    calories: "",
    carb: "",
    protein: "",
    fat: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // ===== Date Handlers =====
  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const isDateDisabled = (date) => {
    // อนุญาตให้เลือกได้เฉพาะวันในอดีตและวันปัจจุบัน
    const today = new Date();
    today.setHours(23, 59, 59, 999); // ตั้งเวลาเป็นสิ้นสุดของวัน
    return date > today;
  };

  // ===== Formatted Date Display =====
  const formattedDate = format(selectedDate, " d MMMM yyyy", { locale: th });

  // ===== Form Handlers =====
  const handleInputChange = (field, value) => {
    // อนุญาตให้ใส่ได้เฉพาะตัวเลขและจุดทศนิยม
    const numericValue = value.replace(/[^0-9.]/g, "");

    setFormData((prev) => ({
      ...prev,
      [field]: numericValue,
    }));
  };

  const isFormValid = () => {
    // ตรวจสอบว่ากรอกข้อมูลครบทุกช่องและมีค่ามากกว่า 0
    return Object.values(formData).every(
      (value) => value && parseFloat(value) > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    setIsLoading(true);

    try {
      const formattedDateForDB = format(selectedDate, "yyyy-MM-dd");

      const result = await InsertLogNutrition({
        memberId: parseInt(memberId),
        date: formattedDateForDB,
        calories: parseFloat(formData.calories),
        protein: parseFloat(formData.protein),
        carb: parseFloat(formData.carb),
        fat: parseFloat(formData.fat),
      });

      if (result.success) {
        toast({
          title: "บันทึกสำเร็จ",
          description: result.message,
        });

        // Reset form และปิด modal
        setFormData({
          calories: "",
          carb: "",
          protein: "",
          fat: "",
        });
        setSelectedDate(new Date());
        onClose();
      } else {
        throw new Error(result.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error("Error saving nutrition log:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        calories: "",
        carb: "",
        protein: "",
        fat: "",
      });
      setSelectedDate(new Date());
      onClose();
    }
  };

  // ===== Form Fields Configuration =====
  const formFields = [
    {
      id: "calories",
      label: "พลังงาน",
      unit: "กิโลแคล",
    },
    {
      id: "carb",
      label: "คาร์บ",
      unit: "กรัม",
    },
    {
      id: "protein",
      label: "โปรตีน",
      unit: "กรัม",
    },
    {
      id: "fat",
      label: "ไขมัน",
      unit: "กรัม",
    },
  ];

  // ===== Modal Content =====
  const modalContent = (
    <div className="space-y-4 pt-4">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData[field.id]}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="h-12 text-base pr-20"
                  disabled={isLoading}
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

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className={`w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${
              isFormValid() && !isLoading
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              "บันทึก"
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  // ===== Date Picker Component =====
  const DatePicker = () => {
    // console.log("DatePicker render - selectedDate:", selectedDate);
    // console.log("DatePicker render - isCalendarOpen:", isCalendarOpen);

    return (
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto p-0 text-xl font-bold hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
            disabled={isLoading}
          >
            {formattedDate}
            <CalendarIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            initialFocus
            onDayClick={(day) => {
            //   console.log("Calendar day clicked:", day);
            }}
          />
        </PopoverContent>
      </Popover>
    );
  };

  // ===== Desktop Dialog =====
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="sr-only">บันทึกข้อมูลโภชนาการ</DialogTitle>
            <div className="flex items-center justify-center">
              <DatePicker />
            </div>
          </DialogHeader>
          {modalContent}
        </DialogContent>
      </Dialog>
    );
  }

  // ===== Mobile Drawer =====
  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="sr-only">บันทึกข้อมูลโภชนาการ</DrawerTitle>
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-center">
              <DatePicker />
            </div>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-gray-100"
                disabled={isLoading}
              >
                <X className="h-5 w-5 text-xl" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="px-6 pb-8">{modalContent}</div>
      </DrawerContent>
    </Drawer>
  );
};

export default NutrientLogModal;
