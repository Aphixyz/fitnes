"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import MembersDataTable from "./MembersDataTable";

export default function MembersTableWithSearch({ initialData, trainerId }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="ค้นหาชื่อลูกค้า อีเมล เป้าหมาย..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 w-80"
        />
      </div>

      {/* Data Table */}
      <MembersDataTable 
        initialData={initialData} 
        trainerId={trainerId} 
        hideSearch={true}
        externalSearchTerm={searchTerm}
      />
    </>
  );
}