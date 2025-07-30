import React from "react";

/**
 * Status Badge Component
 * แสดงสถานะ Active/Expired ของ Package
 */
export default function StatusBadge({ isActive }) {
  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        isActive
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-red-100 text-red-800 border border-red-200"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full mr-2 ${
          isActive ? "bg-green-400" : "bg-red-400"
        }`}
      />
      {isActive ? "Active" : "Expired"}
    </div>
  );
}
