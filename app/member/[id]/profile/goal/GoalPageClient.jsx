"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Target, Calendar, TrendingUp, Dumbbell, Clock, User } from "lucide-react";
import { getCurrentFitnessGoal } from "@/actions/member/goal/getFitnessGoal";
import { getCurrentWeight } from "@/actions/member/profile";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Profile Card Component
const ProfileCard = ({ icon, title, value, isEditable = false, color = "text-gray-500", bgColor = "bg-gray-100", onClick }) => (
  <div 
    className={`flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl mb-3 ${isEditable ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
    onClick={isEditable ? onClick : undefined}
  >
    <div className="flex items-center space-x-3">
      <div className={`p-2 ${bgColor} rounded-full`}>
        <div className={`${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
    {isEditable && (
      <ChevronRight className="h-5 w-5 text-gray-400" />
    )}
  </div>
);

// Constants
const GOAL_TYPES = [
  { value: "ลดน้ำหนัก", label: "ลดน้ำหนัก" },
  { value: "เพิ่มกล้ามเนื้อ", label: "เพิ่มกล้ามเนื้อ" },
  { value: "รักษาหุ่น", label: "รักษาหุ่น" },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "เริ่มต้น" },
  { value: "intermediate", label: "กลาง" },
  { value: "advanced", label: "ขั้นสูง" },
];

const TRAINING_FREQUENCIES = [
  { value: 0, label: "ไม่ค่อยออกกำลังกาย" },
  { value: 1, label: "1-3 วัน/สัปดาห์" },
  { value: 2, label: "4-6 วัน/สัปดาห์" },
  { value: 3, label: "มากกว่า 5 วัน/สัปดาห์" },
];

const TRAINING_TIMES = [
  { value: "morning", label: "เช้า (06:00-09:00)" },
  { value: "afternoon", label: "กลางวัน (10:00-14:00)" },
  { value: "evening", label: "บ่าย (15:00-18:00)" },
  { value: "night", label: "เย็น (18:00-21:00)" },
];

export default function GoalPageClient({ memberId }) {
  const router = useRouter();
  const [currentGoal, setCurrentGoal] = useState(null);
  const [currentWeight, setCurrentWeight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit modal states
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch fitness goal data
        const goalResult = await getCurrentFitnessGoal(memberId);
        if (goalResult.success) {
          setCurrentGoal(goalResult.data);
        }
        
        // Fetch current weight data
        const weightResult = await getCurrentWeight(memberId);
        if (weightResult.success) {
          setCurrentWeight(weightResult.data);
        }
        
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberId]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short", 
      day: "numeric",
    });
  };

  const formatGoalType = (goalType) => {
    const goal = GOAL_TYPES.find(g => g.value === goalType);
    return goal ? goal.label : goalType || "-";
  };

  const formatExperienceLevel = (level) => {
    const exp = EXPERIENCE_LEVELS.find(e => e.value === level);
    return exp ? exp.label : level || "-";
  };

  const formatTrainingFrequency = (freq) => {
    const training = TRAINING_FREQUENCIES.find(t => t.value === freq);
    return training ? training.label : `${freq} วัน/สัปดาห์` || "-";
  };

  const formatTrainingTime = (time) => {
    const training = TRAINING_TIMES.find(t => t.value === time);
    return training ? training.label : time || "-";
  };

  const handleEditClick = (field) => {
    if (!currentGoal) return;
    
    setEditingField(field);
    
    // Set initial values based on field type
    switch(field) {
      case 'startDate':
        const dateValue = currentGoal.startDate ? 
          (typeof currentGoal.startDate === 'string' ? 
            currentGoal.startDate.split('T')[0] : 
            currentGoal.startDate) : '';
        setEditValues({ startDate: dateValue });
        break;
      case 'goalType':
        setEditValues({ goalType: currentGoal.goalType || '' });
        break;
      case 'targetWeight':
        setEditValues({ targetWeight: currentGoal.targetWeight || '' });
        break;
      case 'trainingFrequency':
        setEditValues({ trainingFrequency: currentGoal.trainingFrequency || '' });
        break;
      case 'experienceLevel':
        setEditValues({ experienceLevel: currentGoal.experienceLevel || '' });
        break;
      case 'trainingTime':
        setEditValues({ trainingTime: currentGoal.trainingTime || '' });
        break;
    }
    
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    // TODO: Implement API call to save goal data
    console.log('Saving goal:', editingField, editValues);
    
    // Update local state
    if (currentGoal) {
      setCurrentGoal(prev => ({
        ...prev,
        ...editValues
      }));
    }
    
    setIsDrawerOpen(false);
    setEditingField(null);
  };

  const handleInputChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error || !currentGoal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-red-500">{error || "ไม่พบข้อมูลเป้าหมาย"}</p>
          <p className="text-sm text-gray-500 mt-2">กรุณาตั้งเป้าหมายใหม่</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header Section */}
      <div className="sticky top-0 z-50 h-20 bg-white border-b border-gray-200 pt-2 items-center justify-center">
        <div className="flex items-center justify-between p-4 h-16">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors items-start justify-start"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">เป้าหมายของฉัน</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Goal Info Section */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
            ข้อมูลเป้าหมาย
          </h2>
          
          <ProfileCard
            icon={<Calendar className="h-5 w-5" />}
            title="วันที่เริ่มต้น"
            value={formatDate(currentGoal.startDate)}
            isEditable={true}
            color="text-white"
            bgColor="bg-blue-500"
            onClick={() => handleEditClick('startDate')}
          />

          <ProfileCard
            icon={<Target className="h-5 w-5" />}
            title="ประเภทเป้าหมาย"
            value={formatGoalType(currentGoal.goalType)}
            isEditable={true}
            color="text-white"
            bgColor="bg-green-500"
            onClick={() => handleEditClick('goalType')}
          />

          <ProfileCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="เป้าหมายน้ำหนัก"
            value={currentGoal.targetWeight ? `${Math.round(currentGoal.targetWeight)} กก.` : "-"}
            isEditable={true}
            color="text-white"
            bgColor="bg-purple-500"
            onClick={() => handleEditClick('targetWeight')}
          />

          <ProfileCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="น้ำหนักปัจจุบัน"
            value={currentWeight ? `${Math.round(currentWeight)} กก.` : "ไม่มีข้อมูล"}
            isEditable={false}
            color="text-white"
            bgColor="bg-orange-500"
          />
        </div>

        {/* Fitness Info Section */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
            ข้อมูลการออกกำลังกาย
          </h2>

          <ProfileCard
            icon={<Dumbbell className="h-5 w-5" />}
            title="ความถี่ในการฝึก"
            value={formatTrainingFrequency(currentGoal.trainingFrequency)}
            isEditable={true}
            color="text-white"
            bgColor="bg-red-500"
            onClick={() => handleEditClick('trainingFrequency')}
          />

          <ProfileCard
            icon={<User className="h-5 w-5" />}
            title="ระดับประสบการณ์"
            value={formatExperienceLevel(currentGoal.experienceLevel)}
            isEditable={true}
            color="text-white"
            bgColor="bg-indigo-500"
            onClick={() => handleEditClick('experienceLevel')}
          />

          <ProfileCard
            icon={<Clock className="h-5 w-5" />}
            title="เวลาฝึก"
            value={formatTrainingTime(currentGoal.trainingTime)}
            isEditable={true}
            color="text-white"
            bgColor="bg-teal-500"
            onClick={() => handleEditClick('trainingTime')}
          />
        </div>
      </div>

      {/* Edit Drawer Modal */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-center border-b border-gray-200 pb-4">
            <DrawerTitle className="text-lg font-semibold">
              แก้ไข{editingField === 'startDate' ? 'วันที่เริ่มต้น' :
                     editingField === 'goalType' ? 'ประเภทเป้าหมาย' :
                     editingField === 'targetWeight' ? 'เป้าหมายน้ำหนัก' :
                     editingField === 'trainingFrequency' ? 'ความถี่ในการฝึก' :
                     editingField === 'experienceLevel' ? 'ระดับประสบการณ์' :
                     editingField === 'trainingTime' ? 'เวลาฝึก' : ''}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="p-6 space-y-6">
            {/* Start Date Editor */}
            {editingField === 'startDate' && (
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-2 block">
                  วันที่เริ่มต้น
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editValues.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {/* Goal Type Editor */}
            {editingField === 'goalType' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-4 block">
                  ประเภทเป้าหมาย
                </Label>
                <RadioGroup
                  value={editValues.goalType || ''}
                  onValueChange={(value) => handleInputChange('goalType', value)}
                  className="space-y-3"
                >
                  {GOAL_TYPES.map((goal) => (
                    <div key={goal.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={goal.value} id={goal.value} className="text-green-500" />
                      <Label htmlFor={goal.value} className="flex-1 cursor-pointer font-medium">
                        {goal.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Target Weight Editor */}
            {editingField === 'targetWeight' && (
              <div className="text-center py-8">
                <div className="mb-8">
                  <div className="flex items-center justify-center space-x-4">
                    <Input
                      id="targetWeight"
                      type="number"
                      value={editValues.targetWeight || ''}
                      onChange={(e) => handleInputChange('targetWeight', e.target.value)}
                      placeholder="60"
                      className="w-32 h-20 text-center text-5xl font-light border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-900"
                      inputMode="numeric"
                      style={{ fontSize: '4rem', fontWeight: '300' }}
                    />
                    <span className="text-2xl font-light text-gray-600">กก.</span>
                  </div>
                  <div className="w-full h-px bg-gray-300 mt-4 mx-auto max-w-xs"></div>
                </div>
              </div>
            )}

            {/* Training Frequency Editor */}
            {editingField === 'trainingFrequency' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-4 block">
                  ความถี่ในการฝึก
                </Label>
                <RadioGroup
                  value={editValues.trainingFrequency?.toString() || ''}
                  onValueChange={(value) => handleInputChange('trainingFrequency', parseInt(value))}
                  className="space-y-3"
                >
                  {TRAINING_FREQUENCIES.map((freq) => (
                    <div key={freq.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={freq.value.toString()} id={freq.value.toString()} className="text-green-500" />
                      <Label htmlFor={freq.value.toString()} className="flex-1 cursor-pointer font-medium">
                        {freq.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Experience Level Editor */}
            {editingField === 'experienceLevel' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-4 block">
                  ระดับประสบการณ์
                </Label>
                <RadioGroup
                  value={editValues.experienceLevel || ''}
                  onValueChange={(value) => handleInputChange('experienceLevel', value)}
                  className="space-y-3"
                >
                  {EXPERIENCE_LEVELS.map((exp) => (
                    <div key={exp.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={exp.value} id={exp.value} className="text-green-500" />
                      <Label htmlFor={exp.value} className="flex-1 cursor-pointer font-medium">
                        {exp.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Training Time Editor */}
            {editingField === 'trainingTime' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-4 block">
                  เวลาฝึก
                </Label>
                <RadioGroup
                  value={editValues.trainingTime || ''}
                  onValueChange={(value) => handleInputChange('trainingTime', value)}
                  className="space-y-3"
                >
                  {TRAINING_TIMES.map((time) => (
                    <div key={time.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={time.value} id={time.value} className="text-green-500" />
                      <Label htmlFor={time.value} className="flex-1 cursor-pointer font-medium">
                        {time.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>

          <DrawerFooter className="border-t border-gray-200 px-6 pb-6">
            <Button 
              onClick={handleSave}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl text-lg"
            >
              บันทึก
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}