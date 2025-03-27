"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Copy, Link, RefreshCw, CheckCircle } from "lucide-react";
import { generateRegistrationLink } from "@/actions/trainer/generateRegistrationLink";

export default function LinkGenerator({ trainerId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    setIsLoading(true);
    try {
      const result = await generateRegistrationLink({ trainerId });
      
      if (result.success) {
        setGeneratedLink(result);
        toast({
          title: "สร้างลิงก์สำเร็จ",
          description: "ลิงก์ลงทะเบียนถูกสร้างขึ้นแล้ว",
        });
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างลิงก์ลงทะเบียนได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedLink?.url) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink.url);
      setCopied(true);
      toast({
        title: "คัดลอกลิงก์สำเร็จ",
        description: "ลิงก์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกลิงก์ได้",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setGeneratedLink(null);
    setCopied(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">สร้างลิงก์ลงทะเบียนสำหรับสมาชิกใหม่</CardTitle>
        <CardDescription>
          คลิกปุ่มด้านล่างเพื่อสร้างลิงก์สำหรับให้สมาชิกใหม่ลงทะเบียน
        </CardDescription>
      </CardHeader>
      <CardContent>
        {generatedLink ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">ลิงก์ลงทะเบียน:</p>
              </div>
              <Badge variant="outline" className="bg-amber-50">
                เทรนเนอร์: {generatedLink.trainer_name}
              </Badge>
            </div>
            <div className="relative border rounded-md p-3 bg-gray-50 text-sm break-all">
              {generatedLink.url}
              <button
                onClick={copyToClipboard}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                title="คัดลอกลิงก์"
              >
                {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 border border-blue-200">
              <p>
                <strong>คำแนะนำ:</strong> คัดลอกลิงก์นี้และส่งให้สมาชิกใหม่ผ่านช่องทางที่ต้องการ เช่น LINE, Email หรือ SMS
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <Link className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">สร้างลิงก์ลงทะเบียนใหม่</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              คลิกปุ่มด้านล่างเพื่อสร้างลิงก์ลงทะเบียนสำหรับสมาชิกใหม่
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center space-x-2">
        {generatedLink ? (
          <>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              สร้างลิงก์ใหม่
            </Button>
            <Button onClick={copyToClipboard} disabled={copied}>
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
            </Button>
          </>
        ) : (
          <Button onClick={handleGenerateLink} disabled={isLoading}>
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังสร้างลิงก์...
              </>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                สร้างลิงก์ลงทะเบียน
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}