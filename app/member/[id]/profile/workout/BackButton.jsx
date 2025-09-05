"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
    >
      <ArrowLeft className="h-6 w-6 text-gray-700" />
    </button>
  );
}