"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, MessageCircle, Clock, Target } from "lucide-react";

/**
 * Component แสดงข้อความเมื่อไม่มี active macro plan
 */
const NoActivePlanMessage = () => {
  const handleContactTrainer = () => {
    // TODO: เพิ่มฟังก์ชันติดต่อผู้ฝึกสอน
    console.log("Contact trainer");
  };

  return (
    <div className="space-y-6">
      {/* Main Alert */}
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>ยังไม่มีแผนโภชนาการที่ใช้งานได้</strong>
          <br />
          คุณยังไม่มีแผนโภชนาการที่กำหนดโดยผู้ฝึกสอน
          หรือแผนที่มีอยู่อาจหมดอายุแล้ว
        </AlertDescription>
      </Alert>

      {/* Information Card */}
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Target className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            ไม่พบแผนโภชนาการ
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Steps to get nutrition plan */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-center">
              วิธีการรับแผนโภชนาการ:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    1
                  </div>
                  <h4 className="font-semibold text-blue-800 mb-2">
                    ติดต่อผู้ฝึกสอน
                  </h4>
                  <p className="text-sm text-blue-700">
                    แจ้งความต้องการขอแผนโภชนาการกับผู้ฝึกสอนของคุณ
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    2
                  </div>
                  <h4 className="font-semibold text-green-800 mb-2">
                    ประเมินข้อมูลสุขภาพ
                  </h4>
                  <p className="text-sm text-green-700">
                    ผู้ฝึกสอนจะประเมินข้อมูลสุขภาพและเป้าหมายของคุณ
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    3
                  </div>
                  <h4 className="font-semibold text-purple-800 mb-2">
                    รับแผนโภชนาการ
                  </h4>
                  <p className="text-sm text-purple-700">
                    ระบบจะแสดงแผนโภชนาการที่ผู้ฝึกสอนสร้างให้คุณ
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Button */}
          <div className="text-center">
            <Button
              onClick={handleContactTrainer}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              ติดต่อผู้ฝึกสอน
            </Button>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What you can do meanwhile */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  ขณะรอแผนโภชนาการ
                </h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• อัปเดตข้อมูลสุขภาพและเป้าหมายของคุณ</li>
                  <li>• ติดตามการออกกำลังกายประจำวัน</li>
                  <li>• ศึกษาข้อมูลโภชนาการพื้นฐาน</li>
                  <li>• ดื่มน้ำให้เพียงพอ 8-10 แก้วต่อวัน</li>
                </ul>
              </CardContent>
            </Card>

            {/* Why nutrition plan is important */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  ประโยชน์ของแผนโภชนาการ
                </h4>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• ควบคุมแคลอรี่และ macros ได้อย่างแม่นยำ</li>
                  <li>• ช่วยให้บรรลุเป้าหมายสุขภาพเร็วขึ้น</li>
                  <li>• ติดตามความคืบหน้าได้อย่างชัดเจน</li>
                  <li>• รับคำแนะนำจากผู้เชี่ยวชาญ</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Alert className="border-gray-200 bg-gray-50">
            <MessageCircle className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-700">
              <strong>ต้องการความช่วยเหลือ?</strong>
              <br />
              หากมีข้อสงสัยเกี่ยวกับแผนโภชนาการ สามารถติดต่อผู้ฝึกสอนหรือ
              ทีมสนับสนุนได้ตลอดเวลา
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoActivePlanMessage;
