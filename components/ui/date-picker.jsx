"use client";

import * as React from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DatePicker({
  value,
  onChange,
  placeholder = "เลือกวันที่",
  className,
  disabled,
}) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(
    value ? value.getMonth() : new Date().getMonth()
  );
  const [year, setYear] = React.useState(
    value ? value.getFullYear() : new Date().getFullYear()
  );

  // Thai month names
  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  // Generate year options (1950 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1949 },
    (_, i) => currentYear - i
  );

  const handleMonthChange = (newMonth) => {
    setMonth(parseInt(newMonth));
  };

  const handleYearChange = (newYear) => {
    setYear(parseInt(newYear));
  };

  const displayDate = new Date(year, month);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full h-11 justify-start text-left font-normal border-gray-300 hover:border-gray-400 text-sm",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
          {value ? (
            <span className="text-gray-900">
              {format(value, "d MMMM yyyy", { locale: th })}
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b bg-gray-50">
          <div className="flex gap-2">
            {/* Month Selector */}
            <Select value={month.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {thaiMonths.map((monthName, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Selector */}
            <Select value={year.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption.toString()}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          month={displayDate}
          onMonthChange={(newMonth) => {
            setMonth(newMonth.getMonth());
            setYear(newMonth.getFullYear());
          }}
          locale={th}
          className="p-3"
          classNames={{
            head_cell:
              "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] text-center",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground font-semibold",
            day_outside:
              "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            day_disabled: "text-muted-foreground opacity-50",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
