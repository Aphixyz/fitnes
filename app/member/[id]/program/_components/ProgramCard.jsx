"use client";

import { useState } from "react";
import ProgramDialog from "./ProgramDialog";

/**
 * ProgramCard - Client Component
 * แสดงข้อมูล workout program พร้อม click เพื่อเปิด dialog
 */
const ProgramCard = ({ program, programIndex }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleKeyDownOpen = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpenDialog();
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
        {/* Program Header - Clickable */}
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleOpenDialog}
          onKeyDown={handleKeyDownOpen}
          tabIndex={0}
          role="button"
          aria-label={`ดูรายละเอียด program ${programIndex}: ${program.program_name}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  {programIndex}
                </span>
                <h4 className="text-lg font-semibold text-gray-900">
                  {program.program_name}
                </h4>
                <span className="text-sm text-gray-500">
                  ({program.exercises.length} ท่า)
                </span>
              </div>
            </div>

            {/* Click Icon */}
            <div className="ml-4">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Program Dialog */}
      <ProgramDialog
        program={program}
        programIndex={programIndex}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default ProgramCard;
