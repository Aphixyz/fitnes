"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DurationPickerModal({
  isOpen,
  onClose,
  onSelect,
  initialValue = 0,
}) {
  const [selectedDuration, setSelectedDuration] = useState(initialValue);

  const handleSelect = (duration) => {
    setSelectedDuration(duration);
  };

  const handleConfirm = () => {
    onSelect(selectedDuration);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เลือกระยะเวลาโปรแกรม</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">ระยะเวลา</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={selectedDuration === 0 ? "default" : "outline"}
                className="justify-center"
                onClick={() => handleSelect(0)}
              >
                ไม่กำหนด
              </Button>
              {[1, 2, 3, 4, 5, 6, 8, 12].map((weeks) => (
                <Button
                  key={weeks}
                  variant={selectedDuration === weeks ? "default" : "outline"}
                  className="justify-center"
                  onClick={() => handleSelect(weeks)}
                >
                  {weeks} {weeks === 1 ? "สัปดาห์" : "สัปดาห์"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleConfirm}>เลือก</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
