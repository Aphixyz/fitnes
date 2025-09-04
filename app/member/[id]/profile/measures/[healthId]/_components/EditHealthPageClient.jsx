"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import EditHealthForm from "./EditHealthForm";

const EditHealthPageClient = ({ memberId, healthData, healthRecordId }) => {
  const router = useRouter();
  const formRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    // Trigger form submission from EditHealthForm
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-20 w-full flex items-center justify-between px-4">
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-900">แก้ไขการวัด</h1>
        
        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isLoading ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4">
        <EditHealthForm
          ref={formRef}
          memberId={memberId}
          healthData={healthData}
          healthRecordId={healthRecordId}
          onLoadingChange={setIsLoading}
          hideDefaultButtons={true}
        />
      </div>
    </div>
  );
};

export default EditHealthPageClient;