"use client";

import { useState } from "react";
import ProgramDialog from "@/app/member/[id]/program/_components/ProgramDialog";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

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
      <Card 
        className="w-full hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200"
        onClick={handleOpenDialog}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Icon and Content */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Program Number Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-800 text-sm font-semibold">
                    {programIndex}
                  </span>
                </div>
              </div>
              
              {/* Program Info */}
              <div className="flex-1 min-w-0">
                {/* Program Name (Title) */}
                <h3 className="text-base md:text-lg font-bold text-gray-900 truncate mb-1">
                  {program.program_name}
                </h3>
                
                {/* Exercise Count (Subtitle) */}
                <p className="text-sm text-gray-600 truncate">
                  {program.exercises.length} ท่าการออกกำลังกาย
                </p>
              </div>
            </div>

            {/* Right Side - Arrow */}
            <div className="flex-shrink-0 ml-4">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

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
