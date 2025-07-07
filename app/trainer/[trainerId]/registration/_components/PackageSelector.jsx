"use client";

import { useState, useEffect, useCallback } from "react";
import { getTrainerPackages } from "@/actions/trainer/packages/getPackages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Package, Users, Star, CheckCircle } from "lucide-react";

const PackageSelector = ({ trainerId, onPackageSelect, selectedPackage }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลแพ็คเกจเมื่อ component mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const result = await getTrainerPackages(trainerId);
        if (result.success) {
          setPackages(result.packages);
        } else {
          console.error("Error fetching packages:", result.message);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (trainerId) {
      fetchPackages();
    }
  }, [trainerId]);

  // จัดการการเลือกแพ็คเกจ
  const handlePackageSelect = useCallback(
    (pkg) => {
      if (onPackageSelect) {
        onPackageSelect(pkg);
      }
    },
    [onPackageSelect]
  );

  // Format ราคาเป็นรูปแบบไทย
  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">กำลังโหลดแพ็คเกจ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* เลือกแพ็คเกจ */}
      <div className="space-y-4">
        {packages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>ไม่มีแพ็คเกจที่สามารถใช้งานได้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const isSelected =
                selectedPackage?.packages_id === pkg.packages_id;
              return (
                <Card
                  key={pkg.packages_id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isSelected ? (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg">
                      {pkg.packages_name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* ราคา */}
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(pkg.packages_price)}
                    </div>

                    {/* คำอธิบาย */}
                    {pkg.packages_description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {pkg.packages_description}
                      </p>
                    )}

                    {/* สถิติการขาย */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {pkg.my_sales > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>คุณขายได้ทั้งหมด {pkg.my_sales} แพ็คเกจ</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageSelector;
