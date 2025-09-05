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
const MetricLogComp = ({
  memberId,
  open,
  onOpenChange,
  onDataChange, // callback ให้ parent reload ข้อมูลใหม่
}) => {
  // ===== State =====
  const [metrics, setMetrics] = useState({
    bodyfat: "",
    chest: "",
    waist: "",
    hip: "",
    arm: "",
    thigh: "",
  });
  const [date, setDate] = useState(
    () => formatDateForDatabase()
  );
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
        setMetrics({
          bodyfat: existingRecord.metrics.bodyfat
            ? String(existingRecord.metrics.bodyfat)
            : "",
          chest: existingRecord.metrics.chest
            ? String(existingRecord.metrics.chest)
            : "",
          waist: existingRecord.metrics.waist
            ? String(existingRecord.metrics.waist)
            : "",
          hip: existingRecord.metrics.hip
            ? String(existingRecord.metrics.hip)
            : "",
          arm: existingRecord.metrics.arm
            ? String(existingRecord.metrics.arm)
            : "",
          thigh: existingRecord.metrics.thigh
            ? String(existingRecord.metrics.thigh)
            : "",
        });

        setExistingData(existingRecord);
      } else {
        // ไม่มีข้อมูลเดิม → reset ฟอร์ม
        setMetrics({
          bodyfat: "",
          chest: "",
          waist: "",
          hip: "",
          arm: "",
          thigh: "",
        });
        setExistingData(null);
      }
    } catch (error) {
      console.error("Error loading existing data:", error);
      // reset ฟอร์มถ้าโหลดข้อมูลไม่สำเร็จ
      setMetrics({
        bodyfat: "",
        chest: "",
        waist: "",
        hip: "",
        arm: "",
        thigh: "",
      });
    } finally {
      setLoadingData(false);
    }
  };

  // ===== Handle Metric Change =====
  const handleMetricChange = (field, value) => {
    setMetrics((prev) => ({ ...prev, [field]: value }));
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

  const isFormValid = () => {
    // ตรวจสอบว่ามีข้อมูลอย่างน้อย 1 ตัวและมีค่ามากกว่า 0
    const hasData = Object.values(metrics).some(
      (value) => value && parseFloat(value) > 0
    );
    return hasData;
  };

  // ===== Handle Save =====
  const handleSave = async (e) => {
    e.preventDefault(); // ป้องกัน form submit default
    setLoading(true);
    setError("");

    // ตรวจสอบว่ามีข้อมูลอย่างน้อย 1 ตัว
    const hasData = Object.values(metrics).some(
      (value) => value && parseFloat(value) > 0
    );
    if (!hasData) {
      setError("กรุณากรอกข้อมูลอย่างน้อย 1 ตัว");
      setLoading(false);
      return;
    }

    try {
      // เตรียมข้อมูลสำหรับ insertHealth
      const healthData = {
        memberId: memberId,
        measurementDate: date,
        // เพิ่ม metrics ที่มีข้อมูล
        ...(metrics.bodyfat && { bodyfat: parseFloat(metrics.bodyfat) }),
        ...(metrics.chest && { chest: parseFloat(metrics.chest) }),
        ...(metrics.waist && { waist: parseFloat(metrics.waist) }),
        ...(metrics.hip && { hip: parseFloat(metrics.hip) }),
        ...(metrics.arm && { arm: parseFloat(metrics.arm) }),
        ...(metrics.thigh && { thigh: parseFloat(metrics.thigh) }),
      };

      // บันทึกข้อมูลด้วย insertHealth
      const result = await insertHealth(healthData);
      if (!result.success) {
        setError(result.message || "บันทึกข้อมูลไม่สำเร็จ");
        setLoading(false);
        return;
      }

      // สำเร็จ
      setLoading(false);
      setMetrics({
        bodyfat: "",
        chest: "",
        waist: "",
        hip: "",
        arm: "",
        thigh: "",
      });
      if (onDataChange) onDataChange();
      onOpenChange(false); // ปิด modal
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setLoading(false);
    }
  };

  // ===== Render Metric Input =====
  const renderMetricInput = (field, label, unit = "ซม.") => (
    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
      <label className="text-lg font-semibold text-gray-800" htmlFor={field}>
        {label}
      </label>
      <div className="relative">
        <input
          id={field}
          type="number"
          min="0"
          step="0.1"
          value={metrics[field]}
          onChange={(e) => handleMetricChange(field, e.target.value)}
          placeholder="0.0"
          className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
          aria-label={label}
          disabled={loadingData}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
          {unit}
        </span>
      </div>
    </div>
  );

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

          {/* Body Fat */}
          {renderMetricInput("bodyfat", "ไขมันในร่างกาย", "%")}

          {/* Chest */}
          {renderMetricInput("chest", "รอบอก")}

          {/* Waist */}
          {renderMetricInput("waist", "รอบเอว")}

          {/* Hip */}
          {renderMetricInput("hip", "รอบสะโพก")}

          {/* Arm */}
          {renderMetricInput("arm", "รอบแขน")}

          {/* Thigh */}
          {renderMetricInput("thigh", "รอบต้นขา")}

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

export default MetricLogComp;
