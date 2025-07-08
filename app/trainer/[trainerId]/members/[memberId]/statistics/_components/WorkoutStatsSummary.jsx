import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Zap, Target, Calendar } from "lucide-react";

const WorkoutStatsSummary = ({ data }) => {
  if (!data || !data.totals) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">ไม่พบข้อมูล</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { totals, averages, period } = data;

  // Cards configuration
  const statsCards = [
    {
      title: "Total Volume",
      value: `${totals.volume.toLocaleString()} kg`,
      // description: `เฉลี่ย ${averages.volumePerSession.toLocaleString()} kg/session`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Sessions",
      value: totals.sessions,
      // description: `${averages.workoutFrequency.toFixed(1)} ครั้ง/สัปดาห์`,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Reps",
      value: totals.reps.toLocaleString(),
      // description: `เฉลี่ย ${averages.repsPerSession} reps/session`,
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    // {
    //   title: "Total Duration",
    //   value: totals.durationFormatted,
    //   description: `เฉลี่ย ${averages.durationPerSessionFormatted}/session`,
    //   icon: Clock,
    //   color: "text-orange-600",
    //   bgColor: "bg-orange-50",
    // },
    {
      title: "Total Distance",
      value: `${(totals.distance / 1000).toFixed(1)} km`,
      // description: `เฉลี่ย ${averages.distancePerSession.toFixed(
      //   1
      // )} km/session`,
      icon: Target,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Period Info */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          ช่วงเวลา: {period.label} • รวม {period.totalSessions} sessions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-gray-800">
                  {card.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutStatsSummary;
