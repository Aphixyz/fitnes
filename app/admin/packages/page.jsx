"use client";

import { useEffect, useState } from "react";
import { getPackages } from "@/actions/admin/getPackages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "../_components/common/loadingSpinner";

// 🔁 ฟังก์ชันจัดกลุ่มแพ็คเกจตาม trainer_id
function groupByTrainer(packages) {
  const grouped = {};
  for (const pkg of packages) {
    const trainerId = pkg.trainer_id || "unknown";
    if (!grouped[trainerId]) {
      grouped[trainerId] = {
        trainerName:
          pkg.trainer_firstname && pkg.trainer_lastname
            ? `${pkg.trainer_firstname} ${pkg.trainer_lastname}`
            : "ไม่ระบุ",
        packages: [],
      };
    }
    grouped[trainerId].packages.push(pkg);
  }
  return grouped;
}

export default function PackageListPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const groupedPackages = groupByTrainer(packages);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">รายการแพ็คเกจทั้งหมด</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      ) : packages.length === 0 ? (
        <p className="text-muted-foreground">ไม่พบข้อมูลแพ็คเกจ</p>
      ) : (
        Object.entries(groupedPackages).map(([trainerId, group]) => (
          <div key={trainerId} className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              เทรนเนอร์: <span className="text-blue-600">{group.trainerName}</span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.packages.map((pkg) => (
                <Card key={pkg.packages_id}>
                  <CardHeader>
                    <CardTitle>{pkg.packages_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>
                      <strong>ระยะเวลา: </strong> {pkg.packages_duration_months}{" "}
                      เดือน
                    </p>
                    <p >
                      <strong>ราคา: </strong> 
                      <span className="text-green-500">฿{Number(pkg.packages_price).toLocaleString()}</span>
                    </p>
                    <p>
                      <strong>รายละเอียด: </strong> {pkg.packages_description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
