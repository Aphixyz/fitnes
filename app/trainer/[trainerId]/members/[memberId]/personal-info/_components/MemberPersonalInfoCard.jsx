"use client";

import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { updateMemberPersonalInfo } from "@/actions/trainer/member/updateMemberPersonalInfo";
import { getMemberLatestHealthData } from "@/actions/trainer/member/fetchMemberLatestHealthData";

// Experience Levels
const EXPERIENCE_LEVELS = [
  {
    value: "beginner",
    label: "เริ่มต้น",
    description: "เพิ่งออกกำลังกายเป็นประจำ < 6 เดือน",
  },
  {
    value: "intermediate",
    label: "กลาง",
    description: "ออกกำลังกาย 6–24 เดือน",
  },
  {
    value: "advanced",
    label: "ขั้นสูง",
    description: "ออกกำลังกาย > 2 ปี",
  },
];

// Training Frequencies
const TRAINING_FREQUENCIES = [
  {
    value: 0,
    label: "ไม่ได้ออกกำลังกายเลย",
    description: "ไม่ได้ออกกำลังกาย",
  },
  {
    value: 1,
    label: "1-3 วัน/สัปดาห์",
    description: "น้อย",
  },
  {
    value: 2,
    label: "4-6 วัน/สัปดาห์",
    description: "ปานกลาง",
  },
  {
    value: 3,
    label: "7+ วัน/สัปดาห์",
    description: "ทุกวัน",
  },
];

// Activity Levels
const ACTIVITY_LEVELS = [
  {
    value: 0,
    label: "เคลื่อนไหวน้อยมาก",
    description: "นั่งทำงาน ไม่ค่อยออกกำลังกาย",
  },
  {
    value: 1,
    label: "เคลื่อนไหวเล็กน้อย",
    description: "ออกกำลังกายเบา ๆ สัปดาห์ละ 1–3 วัน",
  },
  {
    value: 2,
    label: "ออกกำลังกายปานกลาง",
    description: "ออกกำลังกายหนักปานกลาง 3–5 วันต่อสัปดาห์",
  },
  {
    value: 3,
    label: "ออกกำลังกายหนัก",
    description: "ออกกำลังกายหนักหรือมีกิจกรรมทางกายต่อเนื่องทุกวัน",
  },
];

// Training Times
const TRAINING_TIMES = [
  {
    value: "morning",
    label: "เช้า",
    description: "06:00 – 09:00",
  },
  {
    value: "afternoon",
    label: "กลางวัน",
    description: "10:00 – 14:00",
  },
  {
    value: "evening",
    label: "บ่าย",
    description: "15:00 – 18:00",
  },
  {
    value: "night",
    label: "เย็น",
    description: "18:00 – 21:00",
  },
];

// Goal Types
const GOAL_TYPES = [
  {
    value: "ลดน้ำหนัก",
    label: "ลดน้ำหนัก",
    description: "ลดไขมันและน้ำหนักตัว",
  },
  {
    value: "เพิ่มกล้ามเนื้อ",
    label: "เพิ่มกล้ามเนื้อ",
    description: "เพิ่มมวลกล้ามเนื้อและความแข็งแรง",
  },
  {
    value: "รักษาหุ่น",
    label: "รักษาหุ่น",
    description: "รักษาน้ำหนักและสุขภาพปัจจุบัน",
  },
];

const MemberPersonalInfoCard = ({ personalData, memberId }) => {
  // Helper function to safely format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
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
        member_health_condition: "",
        fitness_training_frequency: "",
        member_activity_level: "",
        fitness_training_time: "",
        fitness_desired_time: "",
      };
    }

    return {
      member_health_height: personalData.member_health_height
        ? Math.round(personalData.member_health_height)
        : "",
      member_health_weight: personalData.member_health_weight
        ? Math.round(personalData.member_health_weight)
        : "",
      fitness_goal_targetweight: personalData.fitness_goal_targetweight
        ? Math.round(personalData.fitness_goal_targetweight)
        : "",
      member_phone: personalData.member_phone || "",
      member_gender: personalData.member_gender || "",
      member_dob: formatDateForInput(personalData.member_dob),
      member_age: personalData.member_age || "",
      fitness_goal_type: personalData.fitness_goal_type || "",
      fitness_experience_level: personalData.fitness_experience_level || "",
      member_health_condition: personalData.member_health_condition || "",
      fitness_training_frequency: personalData.fitness_training_frequency || "",
      member_activity_level: personalData.member_activity_level || "",
      fitness_training_time: personalData.fitness_training_time || "",
      fitness_desired_time: personalData.fitness_desired_time || "",
    };
  };

  // State for form data
  const [formData, setFormData] = useState(initializeFormData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialData, setInitialData] = useState(initializeFormData);
  const [latestHealthData, setLatestHealthData] = useState(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  // ดึงข้อมูล health ล่าสุด
  const fetchLatestHealthData = async () => {
    if (!memberId) return;

    setIsLoadingHealth(true);
    try {
      const result = await getMemberLatestHealthData(memberId);
      if (result.success) {
        setLatestHealthData(result.data);

        // อัปเดต form data ด้วยข้อมูล health ล่าสุด
        setFormData((prev) => ({
          ...prev,
          member_health_height: result.data.height
            ? Math.round(result.data.height)
            : prev.member_health_height,
          member_health_weight: result.data.weight
            ? Math.round(result.data.weight)
            : prev.member_health_weight,
        }));
      }
    } catch (error) {
      console.error("Error fetching latest health data:", error);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  // Update form data when personalData changes
  useEffect(() => {
    const newFormData = initializeFormData();
    setFormData(newFormData);
    setInitialData(newFormData);
    setHasChanges(false);
  }, [personalData]);

  // ดึงข้อมูล health เมื่อ component mount
  useEffect(() => {
    fetchLatestHealthData();
  }, [memberId]);

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
    const hasFormChanges = Object.keys(formData).some((key) => {
      return String(formData[key]) !== String(initialData[key]);
    });
    setHasChanges(hasFormChanges);
  }, [formData, initialData]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
          member_dob: formData.member_dob || null,
        },
        healthInfo: {
          member_health_height: parseFloatSafe(formData.member_health_height),
          member_health_weight: parseFloatSafe(formData.member_health_weight),
          member_health_condition: formData.member_health_condition || null,
          member_activity_level:
            parseFloat(formData.member_activity_level) || null,
        },
        goalInfo: {
          fitness_goal_type: formData.fitness_goal_type || null,
          fitness_experience_level: formData.fitness_experience_level || null,
          fitness_goal_targetweight: parseFloatSafe(
            formData.fitness_goal_targetweight
          ),
          fitness_training_frequency:
            parseFloat(formData.fitness_training_frequency) || null,
          fitness_training_time: formData.fitness_training_time || null,
          fitness_desired_time:
            parseFloat(formData.fitness_desired_time) || null,
        },
      };

      const result = await updateMemberPersonalInfo(
        personalData.member_id,
        updateData
      );

      if (result && result.success) {
        // Update initial data to match current form data
        setInitialData({ ...formData });
        setHasChanges(false);
        alert("บันทึกข้อมูลสำเร็จ");

        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const errorMessage =
          result && result.error ? result.error : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";
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
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">ส่วนสูง</p>
          {latestHealthData?.measurementDate && (
            <p className="text-xs text-gray-500">
              อัปเดตล่าสุด:{" "}
              {new Date(latestHealthData.measurementDate).toLocaleDateString(
                "th-TH"
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={formData.member_health_height}
            onChange={(e) =>
              handleInputChange("member_health_height", e.target.value)
            }
            className="w-28 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ส่วนสูง"
            min="0"
            step="1"
            disabled={isLoadingHealth}
          />
          <span className="px-3 py-2 text-gray-700 flex items-center">ซม.</span>
        </div>
        {latestHealthData?.height && (
          <p className="text-xs text-green-600 mt-1">
            ค่าล่าสุด: {Math.round(latestHealthData.height)} ซม.
          </p>
        )}
      </div>

      {/* Weight and Goal Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            น้ำหนักปัจจุบัน
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.member_health_weight}
              onChange={(e) =>
                handleInputChange("member_health_weight", e.target.value)
              }
              className="w-28 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="น้ำหนัก"
              min="0"
              step="1"
              disabled={isLoadingHealth}
            />
            <span className="px-3 py-2 text-gray-700 flex items-center">
              กก.
            </span>
          </div>
          {latestHealthData?.weight && (
            <p className="text-xs text-green-600 mt-1">
              ค่าล่าสุด: {Math.round(latestHealthData.weight)} กก.
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            น้ำหนักเป้าหมาย
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.fitness_goal_targetweight}
              onChange={(e) =>
                handleInputChange("fitness_goal_targetweight", e.target.value)
              }
              className="w-28 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="เป้าหมาย"
              min="0"
              step="1"
            />
            <span className="px-3 py-2 text-gray-700 flex items-center">
              กก.
            </span>
          </div>
        </div>
      </div>

      {/* Additional Health Data */}
      {latestHealthData && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            ข้อมูลสุขภาพเพิ่มเติม
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {latestHealthData.chest && (
              <div>
                <p className="text-gray-500">รอบอก</p>
                <p className="font-medium">
                  {Math.round(latestHealthData.chest)} ซม.
                </p>
              </div>
            )}
            {latestHealthData.waist && (
              <div>
                <p className="text-gray-500">รอบเอว</p>
                <p className="font-medium">
                  {Math.round(latestHealthData.waist)} ซม.
                </p>
              </div>
            )}
            {latestHealthData.hip && (
              <div>
                <p className="text-gray-500">รอบสะโพก</p>
                <p className="font-medium">
                  {Math.round(latestHealthData.hip)} ซม.
                </p>
              </div>
            )}
            {latestHealthData.arm && (
              <div>
                <p className="text-gray-500">รอบแขน</p>
                <p className="font-medium">
                  {Math.round(latestHealthData.arm)} ซม.
                </p>
              </div>
            )}
            {latestHealthData.thigh && (
              <div>
                <p className="text-gray-500">รอบต้นขา</p>
                <p className="font-medium">
                  {Math.round(latestHealthData.thigh)} ซม.
                </p>
              </div>
            )}
            {latestHealthData.calf && (
              <div>
                <p className="text-gray-500">รอบน่อง</p>
                <p className="font-medium">
                  {Math.round(latestHealthData.calf)} ซม.
                </p>
              </div>
            )}
            {latestHealthData.bodyfat && (
              <div>
                <p className="text-gray-500">เปอร์เซ็นต์ไขมัน</p>
                <p className="font-medium">
                  {Math.round(latestHealthData.bodyfat)}%
                </p>
              </div>
            )}
            {latestHealthData.muscle && (
              <div>
                <p className="text-gray-500">มวลกล้ามเนื้อ</p>
                <p className="font-medium">
                  {Math.round(latestHealthData.muscle)} กก.
                </p>
              </div>
            )}
            {latestHealthData.bmi && (
              <div>
                <p className="text-gray-500">BMI</p>
                <p className="font-medium">
                  {Math.round(latestHealthData.bmi * 10) / 10}
                </p>
              </div>
            )}
            {latestHealthData.bmr && (
              <div>
                <p className="text-gray-500">BMR</p>
                <p className="font-medium">
                  {Math.round(latestHealthData.bmr)} kcal
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phone */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</p>
        <input
          type="tel"
          value={formData.member_phone}
          onChange={(e) => handleInputChange("member_phone", e.target.value)}
          className="w-32 max-w-xs px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="กรอกเบอร์โทรศัพท์"
        />
      </div>

      {/* Gender */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">เพศ</p>
        <select
          value={formData.member_gender}
          onChange={(e) => handleInputChange("member_gender", e.target.value)}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
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
            onChange={(e) => handleInputChange("member_dob", e.target.value)}
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
          <p className="text-sm font-medium text-gray-700 mb-2">
            เป้าหมายการออกกำลังกาย
          </p>
          <select
            value={formData.fitness_goal_type}
            onChange={(e) =>
              handleInputChange("fitness_goal_type", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {GOAL_TYPES.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            ระดับประสบการณ์
          </p>
          <select
            value={formData.fitness_experience_level}
            onChange={(e) =>
              handleInputChange("fitness_experience_level", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Training Frequency and Activity Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            ความถี่การฝึก
          </p>
          <select
            value={formData.fitness_training_frequency}
            onChange={(e) =>
              handleInputChange("fitness_training_frequency", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {TRAINING_FREQUENCIES.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">ระดับกิจกรรม</p>
          <select
            value={formData.member_activity_level}
            onChange={(e) =>
              handleInputChange("member_activity_level", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {ACTIVITY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Training Time and Desired Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">เวลาการฝึก</p>
          <select
            value={formData.fitness_training_time}
            onChange={(e) =>
              handleInputChange("fitness_training_time", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {TRAINING_TIMES.map((time) => (
              <option key={time.value} value={time.value}>
                {time.label} - {time.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Health Condition */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          ข้อมูลสุขภาพที่ต้องระวัง
        </p>
        <textarea
          value={formData.member_health_condition}
          onChange={(e) =>
            handleInputChange("member_health_condition", e.target.value)
          }
          rows={4}
          className="w-96 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all ${
            hasChanges && !isSaving
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Save className="w-4 h-4" />
          {isSaving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </div>
  );
};

export default MemberPersonalInfoCard;
