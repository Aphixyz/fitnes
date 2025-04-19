'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  createMeal, 
  updateMeal, 
  deleteMeal 
} from '@/actions/trainer/(nutrition)/mealPlanAction';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function MealPlanForm({ 
  mode = 'create', 
  mealData = null, 
  nutritionPlanId, 
  trainerId,
  onSuccess
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    meal_name: '',
    meal_time: '',
    calories_target: null,
    notes: '',
  });
  
  // Form errors
  const [errors, setErrors] = useState({});

  // Set initial form data when editing
  useEffect(() => {
    if (mealData && mode === 'edit') {
      setFormData({
        meal_name: mealData.meal_name || '',
        meal_time: mealData.meal_time || '',
        calories_target: mealData.calories_target || null,
        notes: mealData.notes || '',
      });
    }
  }, [mealData, mode]);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.meal_name) {
      newErrors.meal_name = 'โปรดระบุชื่อมื้ออาหาร';
    }
    
    if (formData.calories_target && formData.calories_target <= 0) {
      newErrors.calories_target = 'เป้าหมายแคลอรี่ต้องเป็นจำนวนบวก';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let result;
      
      if (mode === 'create') {
        // เพิ่มมื้ออาหารใหม่
        result = await createMeal({
          nutrition_plan_id: nutritionPlanId,
          ...formData
        });
      } else {
        // แก้ไขมื้ออาหาร
        result = await updateMeal(
          mealData.meal_plan_id,
          formData,
          trainerId
        );
      }

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: mode === 'create' 
            ? "เพิ่มมื้ออาหารเรียบร้อยแล้ว" 
            : "แก้ไขมื้ออาหารเรียบร้อยแล้ว",
        });
        setOpen(false);
        if (onSuccess) onSuccess(result);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ลบมื้ออาหาร
  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteMeal(
        mealData.meal_plan_id,
        trainerId
      );

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: "ลบมื้ออาหารเรียบร้อยแล้ว",
        });
        setConfirmDelete(false);
        setOpen(false);
        if (onSuccess) onSuccess(result);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // คอมโพเนนต์ปุ่มสำหรับเปิด Dialog
  const TriggerButton = () => {
    if (mode === 'create') {
      return (
        <Button type="button" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มมื้ออาหาร
        </Button>
      );
    } else {
      return (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      );
    }
  };

  return (
    <>
      <TriggerButton />
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-[500px] mx-auto">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                {mode === 'create' ? 'เพิ่มมื้ออาหารใหม่' : 'แก้ไขมื้ออาหาร'}
              </h2>
              <p className="text-sm text-gray-500">
                กรอกข้อมูลมื้ออาหารสำหรับแผนโภชนาการนี้
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* ชื่อมื้ออาหาร (meal_name) */}
              <div className="space-y-2">
                <label htmlFor="meal_name" className="text-sm font-medium">ชื่อมื้ออาหาร</label>
                <Select
                  value={formData.meal_name}
                  onValueChange={(value) => handleChange('meal_name', value)}
                >
                  <SelectTrigger id="meal_name">
                    <SelectValue placeholder="เลือกมื้ออาหาร" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">อาหารเช้า</SelectItem>
                    <SelectItem value="lunch">อาหารกลางวัน</SelectItem>
                    <SelectItem value="dinner">อาหารเย็น</SelectItem>
                    <SelectItem value="snack">อาหารว่าง</SelectItem>
                    <SelectItem value="pre_workout">ก่อนออกกำลังกาย</SelectItem>
                    <SelectItem value="post_workout">หลังออกกำลังกาย</SelectItem>
                    <SelectItem value="other">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
                {errors.meal_name && <p className="text-sm text-red-500">{errors.meal_name}</p>}
              </div>

              {/* เวลามื้ออาหาร (meal_time) */}
              <div className="space-y-2">
                <label htmlFor="meal_time" className="text-sm font-medium">เวลามื้ออาหาร</label>
                <Input 
                  id="meal_time"
                  type="time" 
                  value={formData.meal_time}
                  onChange={(e) => handleChange('meal_time', e.target.value)}
                />
                {errors.meal_time && <p className="text-sm text-red-500">{errors.meal_time}</p>}
              </div>

              {/* เป้าหมายแคลอรี่ (calories_target) */}
              <div className="space-y-2">
                <label htmlFor="calories_target" className="text-sm font-medium">เป้าหมายแคลอรี่ (kcal)</label>
                <Input
                  id="calories_target"
                  type="number"
                  placeholder="ระบุเป้าหมายแคลอรี่"
                  value={formData.calories_target || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseInt(e.target.value);
                    handleChange('calories_target', value);
                  }}
                />
                {errors.calories_target && <p className="text-sm text-red-500">{errors.calories_target}</p>}
              </div>

              {/* บันทึกเพิ่มเติม (notes) */}
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">บันทึกเพิ่มเติม</label>
                <Textarea
                  id="notes"
                  placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับมื้ออาหารนี้"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
                {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
              </div>

              <div className="flex justify-between items-center pt-4">
                {/* ปุ่มลบ (แสดงเฉพาะโหมดแก้ไข) */}
                {mode === 'edit' && (
                  <Button 
                    variant="destructive" 
                    type="button" 
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    ลบมื้ออาหาร
                  </Button>
                )}

                <div className="flex gap-2 ml-auto">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-[400px] mx-auto">
            <h2 className="text-lg font-semibold">คุณแน่ใจหรือไม่?</h2>
            <p className="text-sm text-gray-500 mt-2 mb-6">
              การลบมื้ออาหารนี้จะลบข้อมูลอาหารทั้งหมดในมื้อนี้ด้วย และไม่สามารถกู้คืนได้
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                ยกเลิก
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? 'กำลังลบ...' : 'ลบ'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
