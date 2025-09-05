"use client";

import { useEffect, useState } from "react";
import { getPackages } from "@/actions/admin/packages/getPackages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "../_components/common/loadingSpinner";
import BackButton from "@/components/button/Back";
import { useRouter } from "next/navigation";
import { deletePackage } from "@/actions/admin/packages/deletePackages";

export default function PackageListPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบแพ็คเกจนี้?")) return;
    const res = await deletePackage(id);
    if (res.success) {
      setPackages((prev) => prev.filter((pkg) => pkg.packages_id !== id));
    } else {
      alert(res.message || "ลบไม่สำเร็จ");
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      const res = await getPackages();
      if (res.success) {
        setPackages(res.packages);
      } else {
        setError(res.message || "เกิดข้อผิดพลาดในการโหลดแพ็คเกจ");
      }
      setLoading(false);
    };

    fetchPackages();
  }, []);

  return (
    <div className="p-6">
      <div className="relative py-6">
        {/* <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <BackButton />
        </div> */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-center tracking-tight text-gray-800 mb-2 drop-shadow-sm">
          รายการแพ็คเกจทั้งหมด
        </h1>
        <div className="flex justify-end mt-4">
          <button
            className="flex items-center gap-3 px-3 py-3 rounded-full bg-blue-600 text-white font-extrabold text-lg shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            onClick={() => router.push("/admin/packages/addPackages")}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-800/80 border border-blue-200">
              <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2.5" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8"/></svg>
            </span>
            เพิ่มแพ็คเกจ
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      ) : packages.length === 0 ? (
        <p className="text-muted-foreground">ไม่พบข้อมูลแพ็คเกจ</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card
              key={pkg.packages_id}
              className="border border-blue-100 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm"
            >
              <CardHeader className="flex flex-row justify-between items-center pb-2">
                <CardTitle className="text-lg font-bold text-blue-700 flex-1 truncate">
                  {pkg.packages_name}
                </CardTitle>
                <button
                  className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors"
                  onClick={() => handleDelete(pkg.packages_id)}
                  title="ลบแพ็คเกจ"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">
                    ระยะเวลา {pkg.packages_duration_months} เดือน
                  </span>
                  <span className="inline-block bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs font-medium">
                    ฿{Number(pkg.packages_price).toLocaleString()}
                  </span>
                </div>
                <div className="text-gray-600 text-sm min-h-[40px]">
                  {pkg.packages_description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
