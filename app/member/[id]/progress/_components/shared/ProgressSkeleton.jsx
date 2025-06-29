import React from "react";

const ProgressSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Filter Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-12 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-20 bg-gray-300 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">กำลังโหลดกราฟ...</p>
          </div>
        </div>
      </div>

      {/* Secondary Charts Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-pulse h-4 w-4 bg-gray-300 rounded mx-auto mb-2" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Individual card skeleton for reuse
export const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
      <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="space-y-2">
      <div className="h-6 w-20 bg-gray-300 rounded animate-pulse" />
      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

// Chart skeleton for reuse
export const ChartSkeleton = ({ height = "h-64" }) => (
  <div
    className={`${height} bg-gray-100 rounded-lg flex items-center justify-center`}
  >
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
      <p className="text-sm text-gray-500">กำลังโหลดกราฟ...</p>
    </div>
  </div>
);

export default ProgressSkeleton;
