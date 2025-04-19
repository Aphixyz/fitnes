'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createNutritionPlan } from '@/actions/trainer/(nutrition)/nutritionPlanAction';
import { getMemberDetails } from '@/actions/trainer/getMemberDetails';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

// Schema สำหรับข้อมูลแผนโภชนาการ
const nutritionPlanSchema = z.object({
  plan_name: z.string().min(1, { message: 'โปรดระบุชื่อแผนโภชนาการ' }),
  plan_description: z.string().optional(),
  plan_startdate: z.string().min(1, { message: 'โปรดระบุวันที่เริ่มต้น' }),
  plan_enddate: z.string().optional(),
  daily_calories: z.coerce.number().positive().optional().nullable(),
  protein_target: z.coerce.number().positive().optional().nullable(),
  carbs_target: z.coerce.number().positive().optional().nullable(),
  fat_target: z.coerce.number().positive().optional().nullable(),
  notes: z.string().optional(),
});

export default function CreateNutritionPlanPage() {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id;
  const memberId = params.memberId;
  
  const [memberName, setMemberName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // ฟอร์มสำหรับสร้างแผนโภชนาการใหม่
  const form = useForm({
    resolver: zodResolver(nutritionPlanSchema),
    defaultValues: {
      plan_name: '',
      plan_description: '',
      plan_startdate: new Date().toISOString().split('T')[0],
      plan_enddate: '',
      daily_calories: null,
      protein_target: null,
      carbs_target: null,
      fat_target: null,
      notes: '',
    },
  });
  
  // ดึงข้อมูลสมาชิก
  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const result = await getMemberDetails(trainerId, memberId);
        if (result.success) {
          setMemberName(`${result.member.member_firstname} ${result.member.member_lastname}`);
        }
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลสมาชิกได้",
          variant: "destructive",
        });
      }
    };
    
    fetchMemberDetails();
  }, [trainerId, memberId]);
  
  // สร้างแผนโภชนาการใหม่
  const onSubmit = async (data) => {
    setSubmitting(true);
    
    try {
      const formData = {
        ...data,
        trainer_id: trainerId,
        member_id: memberId,
      };
      
      const result = await createNutritionPlan(formData);
      
      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: "สร้างแผนโภชนาการใหม่เรียบร้อยแล้ว",
        });
        
        // นำทางไปยังหน้ารายละเอียดแผนโภชนาการ
        router.push(`/trainer/${trainerId}/members/${memberId}/nutrition/${result.plan_id}`);
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
      setSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">สร้างแผนโภชนาการใหม่</h1>
          <p className="text-muted-foreground">
            สำหรับ {memberName}
          </p>
        </div>
        <Link href={`/trainer/${trainerId}/members/${memberId}/nutrition`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลแผนโภชนาการ</CardTitle>
          <CardDescription>
            กรอกข้อมูลสำหรับแผนโภชนาการใหม่
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                {/* ชื่อแผน */}
                <FormField
                  control={form.control}
                  name="plan_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อแผน</FormLabel>
                      <FormControl>
                        <Input placeholder="ระบุชื่อแผนโภชนาการ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* วันที่เริ่มต้น */}
                <FormField
                  control={form.control}
                  name="plan_startdate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>วันที่เริ่มต้น</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* วันที่สิ้นสุด */}
                <FormField
                  control={form.control}
                  name="plan_enddate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>วันที่สิ้นสุด (ไม่ระบุได้)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* เป้าหมายแคลอรี่ต่อวัน */}
                <FormField
                  control={form.control}
                  name="daily_calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เป้าหมายแคลอรี่ต่อวัน (kcal)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ระบุเป้าหมายแคลอรี่"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : Number(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* เป้าหมายโปรตีน */}
                <FormField
                  control={form.control}
                  name="protein_target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เป้าหมายโปรตีน (กรัม)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ระบุเป้าหมายโปรตีน"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : Number(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* เป้าหมายคาร์โบไฮเดรต */}
                <FormField
                  control={form.control}
                  name="carbs_target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เป้าหมายคาร์โบไฮเดรต (กรัม)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ระบุเป้าหมายคาร์โบไฮเดรต"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : Number(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* เป้าหมายไขมัน */}
                <FormField
                  control={form.control}
                  name="fat_target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เป้าหมายไขมัน (กรัม)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ระบุเป้าหมายไขมัน"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : Number(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* คำอธิบาย */}
              <FormField
                control={form.control}
                name="plan_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>คำอธิบาย</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="อธิบายเกี่ยวกับแผนโภชนาการนี้"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* บันทึกเพิ่มเติม */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>บันทึกเพิ่มเติม</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="บันทึกเพิ่มเติมเกี่ยวกับแผนโภชนาการนี้"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}