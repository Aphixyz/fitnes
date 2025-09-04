"use client";

import { useState, useEffect } from "react";
import TimeFilterDrawer from "./TimeFilterDrawer";
import ProgressChart from "./ProgressChart";
import CategoryTabs from "./CategoryTabs";
import HistoryList from "./HistoryList";
import { ChevronDown, AlertCircle } from "lucide-react";
import { fetchAllHealthData } from "@/actions/member/metric/fetchAllHealthData";
import { useRouter, useSearchParams } from "next/navigation";
import { formatThaiDateShort } from "@/utils/dateUtils";

const categories = [
  { id: "weight", label: "น้ำหนักตัว", unit: "กก.", color: "#3B82F6" },
  { id: "bodyfat", label: "ไขมันร่างกาย", unit: "%", color: "#EF4444" },
  { id: "chest", label: "รอบอก", unit: "ซม.", color: "#10B981" },
  { id: "waist", label: "รอบเอว", unit: "ซม.", color: "#F59E0B" },
  { id: "hip", label: "รอบสะโพก", unit: "ซม.", color: "#8B5CF6" },
  { id: "arm", label: "รอบแขน", unit: "ซม.", color: "#EC4899" },
  { id: "thigh", label: "รอบต้นขา", unit: "ซม.", color: "#06B6D4" },
];

const timeFilters = [
  { id: "1m", label: "1 เดือนล่าสุด" },
  { id: "3m", label: "3 เดือนล่าสุด" },
  { id: "6m", label: "6 เดือนล่าสุด" },
  { id: "1y", label: "1 ปีล่าสุด" },
  { id: "all", label: "ทั้งหมด" },
];

const ProgressStatsDisplay = ({ memberId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get category from URL parameter
  const categoryParam = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "weight");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("1m");
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update category when URL parameter changes
  useEffect(() => {
    if (categoryParam && categories.find(cat => cat.id === categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Fetch real data from database
  useEffect(() => {
    const loadHealthData = async () => {
      if (!memberId) return;

      try {
        setLoading(true);
        setError(null);

        // Use selectedTimeFilter directly as it matches the API period parameter
        const period = selectedTimeFilter;

        // Fetch data from server action
        const healthData = await fetchAllHealthData(memberId, period);

        // Transform database data to component format
        const transformedData = healthData.map((record) => ({
          date: record.measurement_date,
          member_health_id: record.member_health_id, // Keep the ID for navigation
          weight: record.weight || null,
          bodyfat: record.metrics?.bodyfat || null,
          chest: record.metrics?.chest || null,
          waist: record.metrics?.waist || null,
          hip: record.metrics?.hip || null,
          arm: record.metrics?.arm || null,
          thigh: record.metrics?.thigh || null,
        }));

        setRawData(transformedData);
      } catch (err) {
        console.error("Error loading health data:", err);
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    };

    loadHealthData();
  }, [memberId, selectedTimeFilter]);

  const currentCategory = categories.find((cat) => cat.id === selectedCategory);
  const currentData = rawData
    .filter((item) => {
      const value = item[selectedCategory];
      // Only include records with actual values (not null, undefined, 0, or empty string)
      return value !== null && value !== undefined && value !== 0 && value !== '';
    })
    .map((item) => ({
      date: item.date,
      value: Math.round(item[selectedCategory]),
      member_health_id: item.member_health_id, // Pass the ID for navigation
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending (old to new)

  const latestData = currentData[currentData.length - 1]; // Get latest data (last in ascending order)
  const selectedTimeFilterLabel = timeFilters.find(
    (f) => f.id === selectedTimeFilter
  )?.label;

  const formatDate = (dateString) => {
    return formatThaiDateShort(dateString);
  };

  if (loading) {
    return (
      <div className="px-3 sm:px-4 py-4">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="flex space-x-2 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 rounded-full w-20 flex-shrink-0"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 sm:px-4 py-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            เกิดข้อผิดพลาด
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  // Show full page empty state only when no health data exists at all
  if (rawData.length === 0) {
    return (
      <div className="px-3 sm:px-4 py-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ยังไม่มีข้อมูล
          </h3>
          <p className="text-gray-600">
            เริ่มบันทึกข้อมูลสุขภาพของคุณเพื่อดูสถิติและความคืบหน้า
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 py-4 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        {/* Current Value */}
        <div className="flex-1">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {currentData.length > 0 ? (
              <>
                {latestData?.value || 0}
                {currentCategory?.unit}
                <span className="text-base sm:text-lg font-normal text-blue-600 ml-2">
                  {formatDate(latestData?.date || new Date().toISOString())}
                </span>
              </>
            ) : (
              <>
                -
                <span className="text-base sm:text-lg font-normal text-gray-500 ml-2">
                  ไม่มีข้อมูล{currentCategory?.label}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Time Filter */}
        <button
          onClick={() => setIsTimeFilterOpen(true)}
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
        >
          <span>{selectedTimeFilterLabel}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <ProgressChart
          data={currentData}
          color={currentCategory?.color}
          unit={currentCategory?.unit}
        />
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* History Section */}
      {currentData.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            ประวัติ{currentCategory?.label}
          </h3>
          <HistoryList
            data={currentData}
            unit={currentCategory?.unit}
            formatDate={formatDate}
            memberId={memberId}
          />
        </div>
      )}

      {/* Time Filter Drawer */}
      <TimeFilterDrawer
        isOpen={isTimeFilterOpen}
        onClose={() => setIsTimeFilterOpen(false)}
        filters={timeFilters}
        selectedFilter={selectedTimeFilter}
        onFilterChange={setSelectedTimeFilter}
      />
    </div>
  );
};

export default ProgressStatsDisplay;
