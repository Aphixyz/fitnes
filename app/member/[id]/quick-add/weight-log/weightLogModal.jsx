"use client";

// ===== Imports =====
import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { X } from "lucide-react";
import { insertWeight } from "@/actions/member/quick-add/insertWeight";
import { insertProgressPhoto } from "@/actions/member/quick-add/insertProgressPhoto";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// ===== Main Component =====
const WeightLogModal = ({
  memberId,
  open,
  onOpenChange,
  latestWeight,
  progressPhotos: initialProgressPhotos,
  onDataChange, // callback ให้ parent reload ข้อมูลใหม่
}) => {
  // ===== State =====
  const [weight, setWeight] = useState(
    latestWeight ? String(latestWeight) : ""
  );
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [progressPhotos, setProgressPhotos] = useState({
    front: initialProgressPhotos?.photo_front || null,
    side: initialProgressPhotos?.photo_side || null,
    back: initialProgressPhotos?.photo_back || null,
  });
  const [pendingPhotos, setPendingPhotos] = useState({
    front: null,
    side: null,
    back: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===== Handle Weight Change =====
  const handleWeightChange = (e) => {
    setWeight(e.target.value);
  };

  // ===== Handle Date Change =====
  const handleDateChange = (e) => {
    const val = e.target.value;
    // ห้ามเลือกวันอนาคต
    const today = new Date().toISOString().split("T")[0];
    if (val > today) return;
    setDate(val);
  };

  // ===== Handle Header Date Click =====
  const handleHeaderDateClick = () => {
    document.getElementById("date-picker").click();
  };

  // ===== Handle Header Date Key Down =====
  const handleHeaderDateKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleHeaderDateClick();
    }
  };

  // ===== Handle Photo Selection (ไม่บันทึกทันที) =====
  const handlePhotoSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // เก็บไฟล์ไว้ใน pending state
    setPendingPhotos((prev) => ({ ...prev, [type]: file }));

    // แสดง preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProgressPhotos((prev) => ({ ...prev, [type]: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const isFormValid = () => {
    // ตรวจสอบว่ากรอกข้อมูลครบทุกช่องและมีค่ามากกว่า 0
    return weight && parseFloat(weight) > 0;
  };

  // ===== Handle Save All Data =====
  const handleSave = async (e) => {
    e.preventDefault(); // ป้องกัน form submit default
    setLoading(true);
    setError("");

    // ตรวจสอบน้ำหนัก
    const w = parseFloat(weight);
    if (!w || w <= 0) {
      setError("กรุณากรอกน้ำหนักให้ถูกต้อง");
      setLoading(false);
      return;
    }

    try {
      // 1. บันทึกน้ำหนักก่อน
      const weightRes = await insertWeight(memberId, w, date);
      if (!weightRes.success) {
        setError(weightRes.message || "บันทึกน้ำหนักไม่สำเร็จ");
        setLoading(false);
        return;
      }

      // 2. บันทึกรูปภาพที่เลือกไว้ (ถ้ามี)
      const photoPromises = [];
      Object.entries(pendingPhotos).forEach(([type, file]) => {
        if (file) {
          const formData = new FormData();
          formData.append("memberId", memberId);
          formData.append("photoType", type);
          formData.append("photoFile", file);
          formData.append("measurementDate", date);
          photoPromises.push(insertProgressPhoto(formData));
        }
      });

      // รอให้อัปโหลดรูปภาพเสร็จ
      if (photoPromises.length > 0) {
        const photoResults = await Promise.all(photoPromises);
        const failedPhotos = photoResults.filter((res) => !res.success);
        if (failedPhotos.length > 0) {
          setError("บันทึกน้ำหนักสำเร็จ แต่มีรูปภาพบางรูปอัปโหลดไม่สำเร็จ");
          setLoading(false);
          return;
        }
      }

      // สำเร็จทั้งหมด
      setLoading(false);
      setPendingPhotos({ front: null, side: null, back: null });
      if (onDataChange) onDataChange();
      onOpenChange(false); // ปิด modal
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setLoading(false);
    }
  };

  // ===== Render Dropzone =====
  const renderDropzone = (type, label, icon) => (
    <div className="flex flex-col items-center gap-3">
      <span className="text-base font-semibold text-gray-700 text-center">
        {label}
      </span>
      <label
        className="w-28 h-28 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
        tabIndex={0}
        aria-label={`เลือกรูป${label}`}
      >
        {progressPhotos[type] ? (
          <img
            src={progressPhotos[type]}
            alt={label}
            className="w-24 h-24 object-cover rounded-lg"
          />
        ) : (
          <div className="text-gray-400">{icon}</div>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoSelect(e, type)}
        />
      </label>
    </div>
  );

  // ===== Icons =====
  const iconFront = <span className="text-4xl">🌝</span>;
  const iconSide = <span className="text-4xl">🌛</span>;
  const iconBack = <span className="text-4xl">🌕</span>;

  // ===== Main Render =====
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex-1 text-center">
            <div
              onClick={handleHeaderDateClick}
              onKeyDown={handleHeaderDateKeyDown}
              className="flex flex-col items-center justify-center"
              tabIndex={0}
              role="button"
              aria-label="คลิกเพื่อเลือกวันที่"
            >
              <DrawerTitle className="text-xl mb-4">
                {new Date(date).toLocaleDateString("th-TH", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </DrawerTitle>
            </div>
            <input
              id="date-picker"
              type="date"
              value={date}
              onChange={handleDateChange}
              max={new Date().toISOString().split("T")[0]}
              className="hidden"
              aria-label="เลือกวันที่"
            />
          </div>
          <DrawerClose
            aria-label="ปิด"
            className="p-2 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <X className="w-6 h-6" />
          </DrawerClose>
        </DrawerHeader>
        <form onSubmit={handleSave} className="flex flex-col gap-6 px-4 pb-4">
          {/* น้ำหนัก */}
          <div className="flex items-center justify-between gap-4">
            <label
              className="text-lg font-semibold text-gray-800 flex-shrink-0"
              htmlFor="weight"
            >
              น้ำหนัก
            </label>
            <div className="flex-1 relative">
              <input
                id="weight"
                type="number"
                min="1"
                step="0.01"
                value={weight}
                onChange={handleWeightChange}
                placeholder="0.00"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                aria-label="น้ำหนัก"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                กก.
              </span>
            </div>
          </div>

          {/* Progress Photo */}
          <div>
            <div className="flex flex-row items-center justify-between gap-2">
              {renderDropzone("front", "Front", iconFront)}
              {renderDropzone("side", "Side", iconSide)}
              {renderDropzone("back", "Back", iconBack)}
            </div>
          </div>
          {/* Error */}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {/* Save Button */}
          <DrawerFooter>
            <Button
              type="submit"
              className={`w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${
                isFormValid() && !loading
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isFormValid() || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึก"
              )}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default WeightLogModal;
