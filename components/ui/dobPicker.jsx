"use client";

import * as React from "react";
import { ChevronDownIcon, CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DobPicker({
  value,
  onChange,
  error,
  placeholder = "เลือกวันเกิด",
  label = "วันเกิด",
  required = false,
  className = "",
}) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (selectedDate) => {
    onChange?.(selectedDate);
    setOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <Label htmlFor="dob" className="text-sm font-medium text-gray-700">
          {label} {required && "*"}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="dob"
            className={`w-full justify-between font-normal h-10 sm:h-11 text-sm ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } ${!value ? "text-muted-foreground" : ""}`}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {value ? formatDate(value) : placeholder}
            </div>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            onSelect={handleDateSelect}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            defaultMonth={value || new Date(2000, 0)} // เริ่มที่ปี 2000 ถ้าไม่มีค่า
            fromYear={1900}
            toYear={new Date().getFullYear()}
          />
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
