"use client";

import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { ReactPlugin } from "@stagewise-plugins/react";

// กำหนดค่า config สำหรับ stagewise toolbar พร้อม React plugin
const stagewiseConfig = {
  plugins: [ReactPlugin], // เพิ่ม React plugin สำหรับการทำงานกับ React components
};

export default function StagewiseProvider() {
  // แสดง toolbar เฉพาะใน development mode เท่านั้น
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <StagewiseToolbar config={stagewiseConfig} />;
}
