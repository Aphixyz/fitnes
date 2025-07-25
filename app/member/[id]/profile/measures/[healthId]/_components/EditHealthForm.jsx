"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, X, Eye, EyeOff } from "lucide-react";
import { updateHealth } from "@/actions/member/metric/updateHealth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/utils"; // เพิ่ม import formatDate

// InlineEditableField: ปรับ logic สำหรับ date ให้ set ค่าใหม่ทุกครั้งที่แก้ไข
function InlineEditableField({
  label,
  value,
  type = "text",
  onChange,
  format,
  placeholder,
  min,
  max,
  step,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? "");

  // เมื่อ blur หรือ enter ให้ save ค่าใหม่ทันที (รองรับ date)
  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  // เมื่อ click span ให้ set editValue เป็นค่าปัจจุบัน
  const handleSpanClick = () => {
    if (type === "date" && value) {
      // สำหรับ input type="date", ค่า value ต้องเป็นรูปแบบ "YYYY-MM-DD"
      // เราจะแปลงค่าวันที่ (ซึ่งอาจเป็น ISO string จากฐานข้อมูล) ให้อยู่ในรูปแบบที่ถูกต้อง
      try {
        const date = new Date(value);
        // toISOString() จะให้ค่า UTC เสมอ และเราใช้ split('T')[0] เพื่อเอาเฉพาะส่วน YYYY-MM-DD
        const formattedDate = date.toISOString().split("T")[0];
        setEditValue(formattedDate);
      } catch (error) {
        console.error("Invalid date value:", value);
        setEditValue(""); // ตั้งเป็นค่าว่างถ้าวันที่ไม่ถูกต้อง
      }
    } else {
      setEditValue(value ?? "");
    }
    setIsEditing(true);
  };

  return (
    <div
      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
      onClick={!isEditing ? handleSpanClick : undefined}
    >
      <span className="text-gray-700 whitespace-nowrap">{label}</span>
      {isEditing ? (
        <input
          type={type}
          className="w-36 text-right bg-transparent border-none focus:outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          autoFocus
        />
      ) : (
        <span className="text-gray-900">
          {format ? format(value) : value ?? "-"}
        </span>
      )}
    </div>
  );
}

export default function EditHealthForm({
  memberId,
  healthData,
  healthRecordId,
}) {
  const router = useRouter();
  const { toast } = useToast();

  // State ฟอร์ม (ยกเว้น measurementDate แยกออกมา)
  const [formData, setFormData] = useState({
    weight: healthData.weight || "",
    bodyfat: healthData.metrics.bodyfat || "",
    chest: healthData.metrics.chest || "",
    waist: healthData.metrics.waist || "",
    hip: healthData.metrics.hip || "",
    arm: healthData.metrics.arm || "",
    thigh: healthData.metrics.thigh || "",
    // measurementDate: healthData.measurement_date || "", // เอาออก
  });

  // State สำหรับวันที่ (ดึงจากฐานข้อมูล)
  const [measurementDate, setMeasurementDate] = useState(
    healthData.measurement_date || ""
  );

  const [photos, setPhotos] = useState({
    front: null,
    side: null,
    back: null,
  });
  // เพิ่ม state สำหรับ track การลบรูป
  const [removedPhotos, setRemovedPhotos] = useState({
    front: false,
    side: false,
    back: false,
  });
  const [showOriginalPhotos, setShowOriginalPhotos] = useState({
    front: false,
    side: false,
    back: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileRefs = {
    front: useRef(null),
    side: useRef(null),
    back: useRef(null),
  };

  // handle field change (ยกเว้น measurementDate)
  const handleFieldChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePhotoChange = (type, file) => {
    if (file) setPhotos((prev) => ({ ...prev, [type]: file }));
  };
  // ปรับ removePhoto ให้ลบ original photo เท่านั้น (ไม่รองรับ upload ใหม่)
  const removePhoto = (type) => {
    if (healthData.photos[type]) {
      setRemovedPhotos((prev) => ({ ...prev, [type]: true }));
    }
    if (fileRefs[type].current) fileRefs[type].current.value = "";
  };
  const toggleOriginalPhoto = (type) =>
    setShowOriginalPhotos((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));

  // handleSubmit: ใช้ measurementDate จาก state
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // ส่ง healthId (healthRecordId) เป็น primary key
      const submitData = {
        healthId: healthRecordId,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        bodyfat: formData.bodyfat ? parseFloat(formData.bodyfat) : undefined,
        chest: formData.chest ? parseFloat(formData.chest) : undefined,
        waist: formData.waist ? parseFloat(formData.waist) : undefined,
        hip: formData.hip ? parseFloat(formData.hip) : undefined,
        arm: formData.arm ? parseFloat(formData.arm) : undefined,
        thigh: formData.thigh ? parseFloat(formData.thigh) : undefined,
        // ส่ง flag สำหรับลบรูป
        removePhotoFront: removedPhotos.front,
        removePhotoSide: removedPhotos.side,
        removePhotoBack: removedPhotos.back,
      };

      const result = await updateHealth(submitData);
      if (result.success) {
        toast({
          title: "บันทึกข้อมูลสำเร็จ",
          description: result.message,
          variant: "default",
        });
        router.push(`/member/${memberId}/progress/measures`);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // renderPhotoSection: แสดงปุ่ม X เฉพาะ original photo ที่ยังไม่ถูกลบ
  const renderPhotoSection = (type, label) => {
    const hasOriginal = healthData.photos[type] && !removedPhotos[type];
    return (
      <div className="flex-shrink-0 space-y-2">
        <Label className="font-medium">{label}</Label>
        {hasOriginal ? (
          <div className="relative h-48 w-auto">
            <img
              src={healthData.photos[type]}
              alt={label}
              className="h-full w-auto object-contain rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full"
              onClick={() => removePhoto(type)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="h-48 w-36 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400">
            <span>ไม่มีรูป</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* inline fields */}

        <div className="bg-white rounded-lg shadow divide-y divide-gray-200 overflow-hidden">
          <InlineEditableField
            label="วันที่"
            value={measurementDate}
            type="date"
            onChange={(val) => setMeasurementDate(val)} // set state ทุกครั้งที่ user edit
            format={formatDate}
            placeholder={formatDate(healthData.measurement_date)}
          />
          {/* รูปภาพ */}
          <div>
            <div className="px-4 py-3 font-medium">รูปภาพความคืบหน้า</div>
            <div className="p-4 flex space-x-4 overflow-x-auto">
              {renderPhotoSection("front", "รูปด้านหน้า")}
              {renderPhotoSection("side", "รูปด้านข้าง")}
              {renderPhotoSection("back", "รูปด้านหลัง")}
            </div>

            <InlineEditableField
              label="น้ำหนัก (กก.)"
              value={formData.weight}
              type="number"
              placeholder={healthData.weight?.toString()}
              onChange={(val) => handleFieldChange("weight", val)}
              min="0"
              max="999.99"
              step="1"
            />
            <InlineEditableField
              label="เปอร์เซ็นต์ไขมัน (%)"
              value={formData.bodyfat}
              type="number"
              placeholder={healthData.metrics.bodyfat?.toString()}
              onChange={(val) => handleFieldChange("bodyfat", val)}
              min="0"
              max="100"
              step="1"
            />
            <InlineEditableField
              label="รอบอก (ซม.)"
              value={formData.chest}
              type="number"
              placeholder={healthData.metrics.chest?.toString()}
              onChange={(val) => handleFieldChange("chest", val)}
              min="0"
              step="1"
            />
            <InlineEditableField
              label="รอบเอว (ซม.)"
              value={formData.waist}
              type="number"
              placeholder={healthData.metrics.waist?.toString()}
              onChange={(val) => handleFieldChange("waist", val)}
              min="0"
              step="1"
            />
            <InlineEditableField
              label="รอบสะโพก (ซม.)"
              value={formData.hip}
              type="number"
              placeholder={healthData.metrics.hip?.toString()}
              onChange={(val) => handleFieldChange("hip", val)}
              min="0"
              step="1"
            />
            <InlineEditableField
              label="รอบแขน (ซม.)"
              value={formData.arm}
              type="number"
              placeholder={healthData.metrics.arm?.toString()}
              onChange={(val) => handleFieldChange("arm", val)}
              min="0"
              step="1"
            />
            <InlineEditableField
              label="รอบต้นขา (ซม.)"
              value={formData.thigh}
              type="number"
              placeholder={healthData.metrics.thigh?.toString()}
              onChange={(val) => handleFieldChange("thigh", val)}
              min="0"
              step="1"
            />
          </div>
        </div>

        {/* ปุ่มบันทึก */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </div>
      </form>
    </div>
  );
}
