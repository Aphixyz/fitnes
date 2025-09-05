"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Plus } from "lucide-react";
import ProgressStatsDisplay from "./_components/ProgressStatsDisplay";

export default function ProgressPage() {
  const params = useParams();
  const memberId = parseInt(params.id);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);

  const loadProgressData = async () => {
    try {
      // Trigger refresh in child component by updating key
      setRefreshKey(prev => prev + 1);
      // Small delay to show refresh animation
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error loading progress data:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  // Pull-to-refresh handlers - Mobile optimized
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.min(Math.max(currentY - startY, 0), 100);
    setPullDistance(distance);

    // Prevent default scrolling when pulling
    if (distance > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 70) {
      await handleRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  };


  return (
    <div
      className="min-h-screen bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 z-80 flex items-center justify-center bg-white shadow-sm transition-all duration-200 border-b border-gray-200"
          style={{
            transform: `translateY(${Math.min(pullDistance - 200, 0)}px)`,
            height: `${Math.min(pullDistance, 200)}px`,
          }}
        >
          <div className="flex items-center gap-2 py-2">
            
            <RefreshCw
              className={`h-8 w-4 text-blue-600 ${
                refreshing || pullDistance > 200 ? "animate-spin" : ""
              }`}
              style={{
                transform: `rotate(${pullDistance * 3}deg)`,
                opacity: Math.min(pullDistance / 70, 1),
              }}
            />
            <span className="text-sm text-gray-600">
              {refreshing
                ? "กำลังรีเฟรช..."
                : pullDistance > 400
                ? "ปล่อยเพื่อรีเฟรช"
                : "ดึงลงเพื่อรีเฟรช"}
            </span>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-20 w-full flex items-center justify-center">
        <h1 className="text-xl font-semibold text-gray-900">สถิติของฉัน</h1>
      </div>

      {/* Main Content Area */}
      <ProgressStatsDisplay key={refreshKey} memberId={memberId} />
    </div>
  );
}
