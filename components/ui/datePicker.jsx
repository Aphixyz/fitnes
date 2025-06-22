"use client";

import * as React from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  value,
  onChange,
  placeholder = "เลือกวันที่",
  dateFormat = "PPP",
  locale = th,
  label,
  error,
  required = false,
  disabled = false,
  className = "",
  buttonClassName = "",
  calendarProps = {},
  ...props
}) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (selectedDate) => {
    onChange?.(selectedDate);
    setOpen(false);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            data-empty={!value}
            className={cn(
              "data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal h-11",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              buttonClassName
            )}
            {...props}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              format(value, dateFormat, { locale })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            defaultMonth={value}
            selected={value}
            onSelect={handleDateSelect}
            className="rounded-lg border shadow-sm"
            {...calendarProps}
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

// Export เพิ่มสำหรับใช้งานแบบ demo
export function DatePickerDemo() {
  const [date, setDate] = React.useState();

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      label="เลือกวันที่"
      placeholder="คลิกเพื่อเลือกวันที่"
      className="w-[280px]"
    />
  );
}
