"use client";

// ===== Imports =====
import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { X, Calendar } from "lucide-react";
import { insertHealth } from "@/actions/member/quick-add/insertHealth";
import { loadDailyHealthRecord } from "@/actions/member/quick-add/loadDailyHealthRecord";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { formatDateForDatabase } from "@/utils/dateUtils";

// ===== Main Component =====
const WeightLogModal = ({
  memberId,
  open,
  onOpenChange,
  onDataChange, // callback ให้ parent reload ข้อมูลใหม่
}) => {
  // ===== State =====
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(
    () => formatDateForDatabase()
  );
  const [progressPhotos, setProgressPhotos] = useState({
    front: null,
    side: null,
    back: null,
  });
  const [pendingPhotos, setPendingPhotos] = useState({
    front: null,
    side: null,
    back: null,
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [existingData, setExistingData] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ===== Reset Date When Modal Opens/Closes =====
  useEffect(() => {
    if (open) {
      // เมื่อเปิด modal ให้ reset กลับมาวันที่ปัจจุบัน
      const today = formatDateForDatabase();
      setDate(today);
      setShowDatePicker(false);
    }
  }, [open]);

  // ===== Load Existing Data When Modal Opens or Date Changes =====
  useEffect(() => {
    if (open && memberId) {
      loadExistingData();
    }
  }, [open, memberId, date]);

  // ===== Load Existing Data =====
  const loadExistingData = async () => {
    setLoadingData(true);
    try {
      const existingRecord = await loadDailyHealthRecord(memberId, date);

      if (existingRecord) {
        // เติมข้อมูลเดิมในฟอร์ม
        setWeight(existingRecord.weight ? String(existingRecord.weight) : "");

        // เก็บรูปเดิมไว้แสดง
        setProgressPhotos({
          front: existingRecord.photos.front,
          side: existingRecord.photos.side,
          back: existingRecord.photos.back,
        });

        setExistingData(existingRecord);
      } else {
        // ไม่มีข้อมูลเดิม → reset ฟอร์ม
        setWeight("");
        setProgressPhotos({
          front: null,
          side: null,
          back: null,
        });
        setExistingData(null);
      }
    } catch (error) {
      console.error("Error loading existing data:", error);
      // reset ฟอร์มถ้าโหลดข้อมูลไม่สำเร็จ
      setWeight("");
      setProgressPhotos({
        front: null,
        side: null,
        back: null,
      });
    } finally {
      setLoadingData(false);
    }
  };

  // ===== Handle Weight Change =====
  const handleWeightChange = (e) => {
    setWeight(e.target.value);
  };

  // ===== Handle Date Change =====
  const handleDateChange = (e) => {
    const val = e.target.value;
    // ห้ามเลือกวันอนาคต
    const today = formatDateForDatabase();
    if (val > today) return;
    setDate(val);
    setShowDatePicker(false); // ปิด date picker หลังจากเลือก
  };

  // ===== Handle Header Date Click =====
  const handleHeaderDateClick = () => {
    setShowDatePicker(!showDatePicker);
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
      // เตรียมข้อมูลสำหรับ insertHealth
      const healthData = {
        memberId: memberId,
        weight: w,
        measurementDate: date,
        // เพิ่มรูปภาพถ้ามี
        ...(pendingPhotos.front && { photoFront: pendingPhotos.front }),
        ...(pendingPhotos.side && { photoSide: pendingPhotos.side }),
        ...(pendingPhotos.back && { photoBack: pendingPhotos.back }),
      };

      // บันทึกข้อมูลสุขภาพด้วย insertHealth
      const result = await insertHealth(healthData);

      if (!result.success) {
        setError(result.message || "บันทึกข้อมูลไม่สำเร็จ");
        setLoading(false);
        return;
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
          <div className="flex-1 text-center relative">
            <div
              onClick={handleHeaderDateClick}
              onKeyDown={handleHeaderDateKeyDown}
              className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              tabIndex={0}
              role="button"
              aria-label="คลิกเพื่อเลือกวันที่"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <DrawerTitle className="text-xl">
                  {new Date(date).toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </DrawerTitle>
              </div>
            </div>

            {/* Date Picker Dropdown */}
            {showDatePicker && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <input
                  type="date"
                  value={date}
                  onChange={handleDateChange}
                  max={formatDateForDatabase()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  aria-label="เลือกวันที่"
                  autoFocus
                />
              </div>
            )}
          </div>
          <DrawerClose
            aria-label="ปิด"
            className="p-2 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <X className="w-6 h-6" />
          </DrawerClose>
        </DrawerHeader>
        <form onSubmit={handleSave} className="flex flex-col gap-6 px-4 pb-4">
          {/* Loading indicator */}
          {loadingData && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              <span className="ml-2 text-sm text-gray-600">
                กำลังโหลดข้อมูล...
              </span>
            </div>
          )}

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
                disabled={loadingData}
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
                isFormValid() && !loading && !loadingData
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isFormValid() || loading || loadingData}
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
