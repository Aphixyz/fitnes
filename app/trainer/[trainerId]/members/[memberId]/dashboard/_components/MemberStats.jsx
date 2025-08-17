"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Scale, 
  Apple, 
  Dumbbell, 
  Target,
  TrendingUp 
} from "lucide-react";

/**
 * Loading skeleton for member stats
 */
function MemberStatsLoading() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Individual stat item component
 */
function StatItem({ icon: Icon, label, value, unit, iconColor = "text-gray-600", isWorkoutStat = false }) {
  const formatValue = (val) => {
    // For workout stats: if value is 0, show "ไม่มีข้อมูล"
    if (isWorkoutStat && val === 0) {
      return "";
    }
    
    // For any stat: if null or undefined, show "ไม่มีข้อมูล"
    if (val === null || val === undefined) {
      return "";
    }
    
    // Format number with locale
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    
    return val;
  };

  const displayValue = formatValue(value);
  const showUnit = displayValue !== "" && unit;

  return (
    <div className="flex items-center space-x-3 py-2">
      <div className={`p-2 rounded-lg bg-gray-50`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-600 font-medium">
          {label}
        </div>
        <div className={`text-lg font-bold ${displayValue === "" ? "text-gray-400" : "text-gray-900"}`}>
          {displayValue}{showUnit && ` ${unit}`}
        </div>
      </div>
    </div>
  );
}

/**
 * MemberStats component - แสดงสถิติของสมาชิก
 */
export function MemberStats({ memberId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMemberStats() {
      try {
        setLoading(true);
        setError(null);

        // Import and call the server action
        const { getMemberStats } = await import(
          "@/actions/trainer/dashboard/getMemberStats"
        );
        
        const result = await getMemberStats(memberId);
        
        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ");
        }
      } catch (err) {
        console.error("Error fetching member stats:", err);
        setError("ไม่สามารถโหลดข้อมูลสถิติได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    }

    if (memberId) {
      fetchMemberStats();
    }
  }, [memberId]);

  if (loading) {
    return <MemberStatsLoading />;
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <TrendingUp className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    );
  }

  // Always show the component, even if no data
  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          สถิติลูกค้า
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-1">
        {/* Body Weight */}
        <StatItem
          icon={Scale}
          label="น้ำหนักปัจจุบัน"
          value={stats.weight}
          unit="kg"
          iconColor="text-blue-600"
        />

        {/* Body Fat */}
        <StatItem
          icon={Target}
          label="เปอร์เซ็นต์ไขมันปัจจุบัน"
          value={stats.bodyFat}
          unit="%"
          iconColor="text-orange-600"
        />

        {/* Workout Volume */}
        <StatItem
          icon={Dumbbell}
          label="ปริมาณการออกกำลังกาย"
          value={stats.totalVolume}
          unit="kg"
          iconColor="text-purple-600"
          isWorkoutStat={true}
        />

        {/* Total Reps */}
        <StatItem
          icon={TrendingUp}
          label="การออกกำลังกายจำนวนครั้งทั้งหมด"
          value={stats.totalReps}
          unit="ครั้ง"
          iconColor="text-green-600"
          isWorkoutStat={true}
        />
      </CardContent>
    </Card>
  );
}

export default MemberStats;