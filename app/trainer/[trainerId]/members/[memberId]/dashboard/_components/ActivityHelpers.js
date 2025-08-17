/**
 * Helper functions for MemberActivitiesTimeline component
 */

/**
 * Format วันที่เป็นภาษาไทย
 * @param {string} dateString - วันที่ในรูปแบบ ISO string
 * @returns {string} วันที่ที่จัดรูปแบบแล้ว
 */
export function formatDateThai(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if it's today or yesterday
  if (date.toDateString() === today.toDateString()) {
    return "วันนี้";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "เมื่อวาน";
  }

  // Format Thai date
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // Convert to Buddhist year

  return `${day} ${month} ${year}`;
}

/**
 * Format เวลาเป็นรูปแบบที่อ่านง่าย
 * @param {string} timestamp - timestamp
 * @returns {string} เวลาที่จัดรูปแบบแล้ว
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * คำนวณเปอร์เซ็นต์ของความคืบหน้า
 * @param {number} current - ค่าปัจจุบัน
 * @param {number} goal - เป้าหมาย
 * @returns {number} เปอร์เซ็นต์ (0-100)
 */
export function calculateProgress(current, goal) {
  if (goal <= 0) return 0;
  return Math.min(Math.max((current / goal) * 100, 0), 100);
}

/**
 * สร้างชื่อกิจกรรมตามประเภท
 * @param {Object} activity - ข้อมูลกิจกรรม
 * @returns {JSX.Element} ชื่อกิจกรรมพร้อมสี
 */
export function getActivityTitle(activity) {
  const { type, data } = activity;

  switch (type) {
    case 'nutrition':
      return (
        <span>
          <span className="text-gray-600">บันทึกการกินใหม่</span>
        </span>
      );
      
    case 'workout':
      const programName = data.programName || 'ไม่ระบุโปรแกรม';
      return (
        <span>
          <span className="text-gray-600">บันทึกการออกกำลังกายใหม่โปรแกรม: </span>
          <span className="text-gray-900 font-medium">{programName}</span>
        </span>
      );
      
    case 'health_metrics':
      if (data.weight) {
        return (
          <span>
            <span className="text-gray-600">บันทึกน้ำหนักใหม่: </span>
            <span className="text-gray-900 font-medium">{data.weight} กก.</span>
          </span>
        );
      }
      return (
        <span>
          <span className="text-gray-600">บันทึกข้อมูลสุขภาพใหม่</span>
        </span>
      );
      
    case 'progress_photo':
      return (
        <span>
          <span className="text-gray-600">อัปโหลดรูปภาพความคืบหน้า</span>
        </span>
      );
      
    default:
      return (
        <span>
          <span className="text-gray-600">กิจกรรมใหม่</span>
        </span>
      );
  }
}

/**
 * สร้าง summary text สำหรับกิจกรรม
 * @param {Object} activity - ข้อมูลกิจกรรม
 * @returns {string} ข้อความสรุป
 */
export function getActivitySummary(activity) {
  const { type, data } = activity;

  switch (type) {
    case 'nutrition':
      const { totalCalories, goalCalories = 2200 } = data;
      const caloriePercent = goalCalories > 0 ? Math.round((totalCalories / goalCalories) * 100) : 0;
      return `${totalCalories} แคลอรี่ (${caloriePercent}% ของเป้าหมาย)`;
      
    case 'workout':
      const { totalSets = 0, totalVolume = 0 } = data;
      return `${totalSets} sets${totalVolume > 0 ? `, Volume ${totalVolume.toFixed(0)} กก.` : ''}`;
      
    case 'health_metrics':
      const metrics = [];
      if (data.weight) metrics.push(`น้ำหนัก ${data.weight} กก.`);
      if (data.bodyFat) metrics.push(`ไขมัน ${data.bodyFat}%`);
      return metrics.join(', ') || 'บันทึกข้อมูลสุขภาพ';
      
    case 'progress_photo':
      const angles = data.angles || [];
      return `${data.photoCount} รูป (${angles.join(', ')})`;
      
    default:
      return 'กิจกรรมใหม่';
  }
}

/**
 * จัดกลุ่มกิจกรรมตามวันที่
 * @param {Array} activities - รายการกิจกรรม
 * @returns {Array} กิจกรรมที่จัดกลุ่มแล้ว
 */
export function groupActivitiesByDate(activities) {
  if (!activities || !Array.isArray(activities)) return [];

  const grouped = {};
  
  activities.forEach(activity => {
    const dateKey = activity.timestamp.split('T')[0]; // Get date part only
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(activity);
  });

  // Convert to array and sort by date (newest first)
  return Object.keys(grouped)
    .sort((a, b) => new Date(b) - new Date(a))
    .map(date => ({
      date,
      activitiesByDate: grouped[date].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )
    }));
}

/**
 * Format ข้อมูล macro สำหรับแสดงผล
 * @param {Object} nutritionData - ข้อมูลโภชนาการ
 * @returns {Object} ข้อมูลที่ format แล้ว
 */
export function formatNutritionData(nutritionData) {
  const {
    totalCalories = 0,
    goalCalories = 2200,
    protein = 0,
    proteinGoal = 120,
    carb = 0,
    carbGoal = 280,
    fat = 0,
    fatGoal = 80
  } = nutritionData;

  return {
    calories: {
      current: totalCalories,
      goal: goalCalories,
      percentage: calculateProgress(totalCalories, goalCalories),
      isOver: totalCalories > goalCalories && goalCalories > 0
    },
    macros: {
      protein: {
        current: protein,
        goal: proteinGoal,
        percentage: calculateProgress(protein, proteinGoal),
        isOver: protein > proteinGoal && proteinGoal > 0
      },
      carb: {
        current: carb,
        goal: carbGoal,
        percentage: calculateProgress(carb, carbGoal),
        isOver: carb > carbGoal && carbGoal > 0
      },
      fat: {
        current: fat,
        goal: fatGoal,
        percentage: calculateProgress(fat, fatGoal),
        isOver: fat > fatGoal && fatGoal > 0
      }
    }
  };
}

/**
 * สร้าง mock data สำหรับทดสอบ
 * @returns {Object} ข้อมูลจำลอง
 */
export function generateMockData() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return {
    success: true,
    data: {
      member: {
        memberId: 1,
        fullName: "สมชาย ใจดี",
        profileImage: null
      },
      activities: [
        {
          date: today.toISOString().split('T')[0],
          activitiesByDate: [
            {
              type: 'nutrition',
              timestamp: `${today.toISOString().split('T')[0]}T12:00:00Z`,
              data: {
                totalCalories: 593,
                goalCalories: 2200,
                protein: 46,
                proteinGoal: 120,
                carb: 55,
                carbGoal: 280,
                fat: 26,
                fatGoal: 80,
                adherencePercentage: 100
              }
            },
            {
              type: 'workout',
              timestamp: `${today.toISOString().split('T')[0]}T08:30:00Z`,
              data: {
                programName: "Full Body Workout",
                totalSets: 12,
                totalVolume: 1250,
                duration: 60,
                exercises: [
                  {
                    exerciseName: "Bench Press",
                    sets: [
                      { setNumber: 1, weight: 60, reps: 12 },
                      { setNumber: 2, weight: 65, reps: 10 },
                      { setNumber: 3, weight: 70, reps: 8 }
                    ]
                  },
                  {
                    exerciseName: "Squat",
                    sets: [
                      { setNumber: 1, weight: 80, reps: 12 },
                      { setNumber: 2, weight: 85, reps: 10 }
                    ]
                  }
                ]
              }
            }
          ]
        },
        {
          date: yesterday.toISOString().split('T')[0],
          activitiesByDate: [
            {
              type: 'health_metrics',
              timestamp: `${yesterday.toISOString().split('T')[0]}T07:00:00Z`,
              data: {
                weight: 75.5,
                bodyFat: 18.5,
                measurements: {
                  chest: 95,
                  waist: 78,
                  hip: 90
                }
              }
            },
            {
              type: 'progress_photo',
              timestamp: `${yesterday.toISOString().split('T')[0]}T07:05:00Z`,
              data: {
                photoCount: 3,
                angles: ['front', 'side', 'back'],
                hasComparison: true
              }
            }
          ]
        }
      ],
      summary: {
        totalDays: 30,
        activitiesCounts: {
          workout: 8,
          nutrition: 15,
          health_metrics: 3,
          progress_photo: 2
        },
        consistency: 76.7
      }
    }
  };
}