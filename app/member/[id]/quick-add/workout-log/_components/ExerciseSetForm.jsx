"use client";

import { getDistanceUnit } from "@/utils/utils";

/**
 * ExerciseSetForm - Component สำหรับบันทึกข้อมูลแต่ละเซต (Table Row Style)
 * รองรับ Dynamic Fields ตามข้อมูลที่เทรนเนอร์กำหนด
 */
const ExerciseSetForm = ({ set, exercise, loggedSets, setLoggedSets }) => {
  const setKey = `${exercise.program_exercise_id}_${set.program_exercise_set_id}`;
  const currentData = loggedSets[setKey] || {};

  // ตรวจสอบฟิลด์ที่มีค่า (ไม่เป็น null) เพื่อแสดงเป็น input
  const getActiveFields = () => {
    const fields = [];
    if (set.weight !== null)
      fields.push({
        key: "weight",
        label: "กก.",
        type: "number",
        step: "0.01",
        min: "0",
        max: "999",
        value: set.weight,
      });
    if (set.reps !== null)
      fields.push({
        key: "reps",
        label: "รอบ",
        type: "number",
        step: "1",
        min: "0",
        max: "999",
        value: set.reps,
      });
    if (set.time !== null)
      fields.push({
        key: "time",
        label: "วินาที",
        type: "number",
        step: "1",
        min: "0",
        max: "9999",
        value: set.time,
      });
    if (set.distance !== null)
      fields.push({
        key: "distance",
        label: getDistanceUnit(set.distance),
        type: "number",
        step: set.distance >= 1000 ? "0.01" : "1",
        min: "0",
        max: "999",
        value: set.distance,
      });
    return fields;
  };

  const activeFields = getActiveFields();

  // คำนวณ Smart Placeholder - ใช้ค่าล่าสุดที่ member กรอกใน exercise นี้
  const getSmartPlaceholder = (fieldKey) => {
    // ดึงข้อมูลจาก loggedSets ที่เป็น exercise เดียวกัน
    const exerciseLoggedSets = Object.keys(loggedSets)
      .filter((key) => key.startsWith(`${exercise.program_exercise_id}_`))
      .map((key) => loggedSets[key])
      .filter((data) => data && data[fieldKey]); // เฉพาะที่มีข้อมูล field นี้

    // ถ้ามีข้อมูลจาก member ใช้ค่าล่าสุด
    if (exerciseLoggedSets.length > 0) {
      const latestValue =
        exerciseLoggedSets[exerciseLoggedSets.length - 1][fieldKey];
      return latestValue;
    }

    // ถ้าไม่มี ใช้ค่าจาก trainer
    const field = activeFields.find((f) => f.key === fieldKey);
    return field ? field.value : null;
  };

  const handleInputChange = (field, value) => {
    setLoggedSets((prev) => ({
      ...prev,
      [setKey]: {
        ...prev[setKey],
        [field]: value,
      },
    }));
  };

  // ===== ปรับ logic placeholder: ดึงจากฐานข้อมูลเสมอ =====
  const getPlaceholder = (field) => {
    return set[field.key] ?? "";
  };

  // Render dynamic input field
  const renderInputField = (field) => {
    const inputValue = currentData[field.key] || "";

    const handleChange = (e) => {
      const val = e.target.value;
      handleInputChange(field.key, val);
    };

    return (
      <td key={field.key} className="px-4 py-3">
        <div className="relative">
          <input
            type={field.type}
            step={field.step}
            min={field.min}
            max={field.max}
            pattern={field.pattern}
            placeholder={getPlaceholder(field)}
            value={inputValue}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
        </div>
      </td>
    );
  };

  // ===== ปรับ handleComplete: ใช้ค่าปกติ =====
  const handleComplete = () => {
    if (currentData.completed) {
      setLoggedSets((prev) => ({
        ...prev,
        [setKey]: {
          ...prev[setKey],
          completed: false,
        },
      }));
    } else {
      const updatedData = { ...currentData };
      activeFields.forEach((field) => {
        let val = updatedData[field.key];
        if (val === undefined || val === null) {
          updatedData[field.key] = set[field.key];
        }
      });
      setLoggedSets((prev) => ({
        ...prev,
        [setKey]: {
          ...updatedData,
          completed: true,
        },
      }));
    }
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Set Number */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-900 text-sm font-medium">
          {set.set_order}
        </div>
      </td>

      {/* Dynamic Input Fields */}
      {activeFields.map((field) => renderInputField(field))}

      {/* Finish Button */}
      <td className="px-4 py-3">
        <button
          onClick={handleComplete}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            currentData.completed
              ? "bg-green-500 text-white shadow-green-500/25 shadow-lg"
              : " border-2 border-gray-200 text-gray-500 shadow-gray-200/25 shadow-lg"
          }`}
        >
          {currentData.completed ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
      </td>
    </tr>
  );
};

/**
 * ExerciseSetTable - Table container component รองรับ Dynamic Columns
 */
export const ExerciseSetTable = ({
  children,
  exerciseName,
  activeFields = [],
}) => {
  // สร้าง dynamic headers ตามฟิลด์ที่มีข้อมูล
  const getFieldDisplayName = (fieldKey) => {
    const fieldLabels = {
      weight: "น้ำหนัก (กก.)",
      reps: "รอบ",
      time: "เวลา (วินาที)",
      distance: "ระยะ",
    };
    return fieldLabels[fieldKey] || fieldKey;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {/* Set Number Column */}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Set
              </th>

              {/* Dynamic Field Columns */}
              {activeFields.map((field) => (
                <th
                  key={field.key}
                  className="px-4 py-3 text-center text-sm font-medium text-gray-700"
                >
                  {getFieldDisplayName(field.key)}
                </th>
              ))}

              {/* Finish Button Column */}
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExerciseSetForm;
