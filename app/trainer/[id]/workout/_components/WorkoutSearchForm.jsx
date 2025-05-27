"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function WorkoutSearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const handleSearch = (e) => {
    e.preventDefault();

    // สร้าง URL params ใหม่สำหรับการค้นหา
    const params = new URLSearchParams(searchParams);

    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }

    // นำทางไปยัง URL เดิมแต่มีพารามิเตอร์การค้นหาใหม่
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex space-x-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="ค้นหาตามชื่อโปรแกรมหรือสมาชิก"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 w-[300px]"
        />
      </div>
      <Button type="submit" variant="secondary">
        ค้นหา
      </Button>

      {searchTerm && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setSearchTerm("");
            const params = new URLSearchParams(searchParams);
            params.delete("search");
            router.push(`${pathname}?${params.toString()}`);
          }}
        >
          ล้างการค้นหา
        </Button>
      )}
    </form>
  );
}
