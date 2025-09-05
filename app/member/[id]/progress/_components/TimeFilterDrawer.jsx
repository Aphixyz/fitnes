"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Check } from "lucide-react";

const TimeFilterDrawer = ({ 
  isOpen, 
  onClose, 
  filters, 
  selectedFilter, 
  onFilterChange 
}) => {
  const handleFilterSelect = (filterId) => {
    onFilterChange(filterId);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[50vh]">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="text-center">
            เลือกช่วงเวลา
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-8">
          <div className="space-y-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterSelect(filter.id)}
                className={`w-full flex items-center justify-between p-4 rounded-lg text-left transition-colors ${
                  selectedFilter === filter.id
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <span className={`font-medium ${
                  selectedFilter === filter.id
                    ? "text-blue-700"
                    : "text-gray-900"
                }`}>
                  {filter.label}
                </span>
                
                {selectedFilter === filter.id && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TimeFilterDrawer;