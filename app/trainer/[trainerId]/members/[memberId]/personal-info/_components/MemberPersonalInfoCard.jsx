"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Weight,
  Target,
  Ruler,
  Cake,
  Activity,
  Save
} from "lucide-react";
import { updateMemberPersonalInfo } from "@/actions/trainer/member/updateMemberPersonalInfo";

const MemberPersonalInfoCard = ({ personalData }) => {
  // Helper function to safely format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };

  // Initialize form data safely
  const initializeFormData = () => {
    if (!personalData) {
      return {
        member_health_height: "",
        member_health_weight: "",
        fitness_goal_targetweight: "",
        member_phone: "",
        member_gender: "",
        member_dob: "",
        member_age: "",
        fitness_goal_type: "",
        fitness_experience_level: "",
        member_health_condition: ""
      };
    }

    return {
      member_health_height: personalData.member_health_height || "",
      member_health_weight: personalData.member_health_weight || "",
      fitness_goal_targetweight: personalData.fitness_goal_targetweight || "",
      member_phone: personalData.member_phone || "",
      member_gender: personalData.member_gender || "",
      member_dob: formatDateForInput(personalData.member_dob),
      member_age: personalData.member_age || "",
      fitness_goal_type: personalData.fitness_goal_type || "",
      fitness_experience_level: personalData.fitness_experience_level || "",
      member_health_condition: personalData.member_health_condition || ""
    };
  };

  // State for form data
  const [formData, setFormData] = useState(initializeFormData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialData, setInitialData] = useState(initializeFormData);

  // Update form data when personalData changes
  useEffect(() => {
    const newFormData = initializeFormData();
    setFormData(newFormData);
    setInitialData(newFormData);
    setHasChanges(false);
  }, [personalData]);

  if (!personalData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600 text-center">
            ไม่พบข้อมูลส่วนตัวของสมาชิก
          </p>
        </div>
      </div>
    );
  }

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "ไม่ระบุ";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "ไม่ระบุ";
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "ไม่ระบุ";
    }
  };

  const getGenderDisplay = (gender) => {
    const genderMap = {
      male: "ชาย",
      female: "หญิง",
      other: "อื่นๆ",
    };
    return genderMap[gender] || "ไม่ระบุ";
  };

  const formatNumber = (value, unit = "") => {
    if (value === null || value === undefined || value === "" || value === 0) {
      return "ไม่ระบุ";
    }

    // Convert to number if it's a string
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    // Check if it's a valid number
    if (isNaN(numValue)) return "ไม่ระบุ";

    return `${numValue}${unit ? ` ${unit}` : ""}`;
  };

  // Check for changes
  useEffect(() => {
    const hasFormChanges = Object.keys(formData).some(key => {
      return String(formData[key]) !== String(initialData[key]);
    });
    setHasChanges(hasFormChanges);
  }, [formData, initialData]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    try {
      // Safely parse numbers
      const parseFloatSafe = (value) => {
        if (!value || value === "") return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      const updateData = {
        basicInfo: {
          member_phone: formData.member_phone || null,
          member_gender: formData.member_gender || null,
          member_dob: formData.member_dob || null
        },
        healthInfo: {
          member_health_height: parseFloatSafe(formData.member_health_height),
          member_health_weight: parseFloatSafe(formData.member_health_weight),
          member_health_condition: formData.member_health_condition || null
        },
        goalInfo: {
          fitness_goal_type: formData.fitness_goal_type || null,
          fitness_experience_level: formData.fitness_experience_level || null,
          fitness_goal_targetweight: parseFloatSafe(formData.fitness_goal_targetweight)
        }
      };

      const result = await updateMemberPersonalInfo(personalData.member_id, updateData);
      
      if (result && result.success) {
        // Update initial data to match current form data
        setInitialData({ ...formData });
        setHasChanges(false);
        alert("บันทึกข้อมูลสำเร็จ");
        
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const errorMessage = result && result.error ? result.error : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";
        alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Height */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">ส่วนสูง</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={formData.member_health_height}
            onChange={(e) => handleInputChange('member_health_height', e.target.value)}
            className="w-28 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ส่วนสูง"
            min="0"
            step="0.1"
          />
          <span className="px-3 py-2 text-gray-700 flex items-center">ซม.</span>
        </div>
      </div>

      {/* Weight and Goal Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">น้ำหนักปัจจุบัน</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.member_health_weight}
              onChange={(e) => handleInputChange('member_health_weight', e.target.value)}
              className="w-28 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="น้ำหนัก"
              min="0"
              step="0.1"
            />
            <span className="px-3 py-2 text-gray-700 flex items-center">กก.</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">น้ำหนักเป้าหมาย</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.fitness_goal_targetweight}
              onChange={(e) => handleInputChange('fitness_goal_targetweight', e.target.value)}
              className="w-28 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="เป้าหมาย"
              min="0"
              step="0.1"
            />
            <span className="px-3 py-2 text-gray-700 flex items-center">กก.</span>
          </div>
        </div>
      </div>

      {/* Phone */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</p>
        <input
          type="tel"
          value={formData.member_phone}
          onChange={(e) => handleInputChange('member_phone', e.target.value)}
          className="w-32 max-w-xs px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="กรอกเบอร์โทรศัพท์"
        />
      </div>

      {/* Gender */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">เพศ</p>
        <select
          value={formData.member_gender}
          onChange={(e) => handleInputChange('member_gender', e.target.value)}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">เลือกเพศ</option>
          <option value="male">ชาย</option>
          <option value="female">หญิง</option>
        </select>
      </div>

      {/* Birth Date and Age */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">วันเกิด</p>
          <input
            type="date"
            value={formData.member_dob}
            onChange={(e) => handleInputChange('member_dob', e.target.value)}
            className="w-42 max-w-xs px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">อายุ</p>
          <input
            type="number"
            value={personalData.member_age || ""}
            readOnly
            className="w-20 px-3 py-2 border border-gray-300 rounded-md text-gray-500 bg-gray-100"
            placeholder="Auto"
          />
        </div>
      </div>

      {/* Fitness Goals and Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">เป้าหมายการออกกำลังกาย</p>
          <select
            value={formData.fitness_goal_type}
            onChange={(e) => handleInputChange('fitness_goal_type', e.target.value)}
            className="w-42 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">เลือกเป้าหมาย</option>
            <option value="ลดน้ำหนัก">ลดน้ำหนัก</option>
            <option value="เพิ่มกล้ามเนื้อ">เพิ่มกล้ามเนื้อ</option>
            <option value="รักษาหุ่น">รักษาหุ่น</option>
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">ระดับประสบการณ์</p>
          <select
            value={formData.fitness_experience_level}
            onChange={(e) => handleInputChange('fitness_experience_level', e.target.value)}
            className="w-64 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">เลือกระดับประสบการณ์</option>
            <option value="ระดับเริ่มต้น">ระดับเริ่มต้น</option>
            <option value="ระดับกลาง">ระดับกลาง</option>
            <option value="ระดับขั้นสูง">ระดับขั้นสูง</option>
          </select>
        </div>
      </div>

      {/* Health Condition */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">ข้อมูลสุขภาพที่ต้องระวัง</p>
        <textarea
          value={formData.member_health_condition}
          onChange={(e) => handleInputChange('member_health_condition', e.target.value)}
          rows={4}
          className="w-96 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="กรอกข้อมูลสุขภาพที่ต้องระวัง (เช่น โรคประจำตัว, การแพ้ยา, ข้อห้าม ฯลฯ)"
        />
      </div>
      
      {/* Save Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all ${
            hasChanges && !isSaving
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>
  );
};

export default MemberPersonalInfoCard;