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
        <h1 className="text-xl sm:text-2xl font-bold text-center">
          รายการแพ็คเกจทั้งหมด
        </h1>
        <div className="flex justify-end mt-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => router.push("/admin/packages/addPackages")}
          >
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.packages_id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>{pkg.packages_name}</CardTitle>
                <button
                  className="text-red-600 hover:underline hover:bg-red-50 px-2 py-1 rounded text-sm transition"
                  onClick={() => handleDelete(pkg.packages_id)}
                  title="ลบแพ็คเกจ"
                >
                  ลบ
                </button>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>ระยะเวลา: </strong> {pkg.packages_duration_months}{" "}
                  เดือน
                </p>
                <p>
                  <strong>ราคา: </strong>
                  <span className="text-green-500">
                    ฿{Number(pkg.packages_price).toLocaleString()}
                  </span>
                </p>
                <p>
                  <strong>รายละเอียด: </strong> {pkg.packages_description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
