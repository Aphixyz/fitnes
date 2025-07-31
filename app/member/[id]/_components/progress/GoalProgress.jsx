"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, TrendingUp, TrendingDown } from "lucide-react";

export default function GoalProgress({ goalData }) {
  if (!goalData) return null;

  const {
    type,
    start_weight,
    current_weight,
    target_weight,
    progress_percentage,
    remaining,
    days_remaining
  } = goalData;

  const isGainingGoal = target_weight > start_weight;
  const progressColor = progress_percentage >= 75 ? "bg-green-500" : 
                       progress_percentage >= 50 ? "bg-yellow-500" : "bg-red-500";

  const getGoalTypeText = (type) => {
    switch(type) {
      case 'weight_loss': return 'ลดน้ำหนัก';
      case 'weight_gain': return 'เพิ่มน้ำหนัก';
      case 'muscle_gain': return 'เพิ่มกล้ามเนื้อ';
      case 'fat_loss': return 'ลดไขมัน';
      default: return type;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          เป้าหมายปัจจุบัน
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{getGoalTypeText(type)}</Badge>
              {days_remaining > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  เหลือ {days_remaining} วัน
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">เริ่มต้น</p>
                <p className="font-bold">{start_weight} kg</p>
              </div>
              <div>
                <p className="text-gray-500">ปัจจุบัน</p>
                <p className="font-bold text-blue-600">{current_weight} kg</p>
              </div>
              <div>
                <p className="text-gray-500">เป้าหมาย</p>
                <p className="font-bold">{target_weight} kg</p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              {isGainingGoal ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-gray-500">
                เหลือ {remaining.toFixed(1)} kg
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {progress_percentage}%
              </span>
              <p className="text-xs text-gray-500">ความคืบหน้า</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>ความคืบหน้า</span>
            <span>{progress_percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
              style={{ width: `${Math.min(progress_percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Success/Warning Messages */}
        {progress_percentage >= 100 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                🎉 ยินดีด้วย! คุณบรรลุเป้าหมายแล้ว
              </span>
            </div>
          </div>
        )}

        {days_remaining < 7 && days_remaining > 0 && progress_percentage < 80 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                ⚠️ เหลือเวลาอีกเพียง {days_remaining} วัน ต้องเร่งการฝึก!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}