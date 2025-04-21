"use client";

import { useState, useEffect } from "react";
import { searchFoods } from "@/actions/trainer/nutrition/foodActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, Plus } from "lucide-react";

export default function FoodPicker({ onSelect, trainerId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([
    { value: "all", label: "ทุกหมวดหมู่" },
  ]);

  // ดึงข้อมูลอาหารเมื่อเปิด picker
  useEffect(() => {
    if (isOpen) {
      fetchFoods();
    }
  }, [isOpen]);

  // ฟังก์ชันค้นหาอาหาร
  const fetchFoods = async () => {
    setLoading(true);
    try {
      const result = await searchFoods(searchTerm, trainerId);
      if (result.success) {
        setFoods(result.foods || []);

        // สร้างหมวดหมู่จากอาหารที่ได้
        const categorySet = new Set();
        result.foods.forEach((food) => {
          if (food.food_category) {
            categorySet.add(food.food_category);
          }
        });

        // เรียงลำดับและแปลงเป็นรูปแบบที่ใช้งานได้
        setCategories([
          { value: "all", label: "ทุกหมวดหมู่" },
          ...Array.from(categorySet)
            .sort()
            .map((cat) => ({
              value: cat,
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
            })),
        ]);
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันค้นหาอาหาร
  const handleSearch = (e) => {
    e.preventDefault();
    fetchFoods();
  };

  // เลือกอาหาร
  const handleSelectFood = (food) => {
    onSelect(food);
    setIsOpen(false);
  };

  // กรองรายการอาหารตามหมวดหมู่
  const filteredFoods = foods.filter((food) => {
    return category === "all" || food.food_category === category;
  });

  return (
    <div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="mr-2 h-4 w-4" />
        เพิ่มอาหาร
      </Button>

      {isOpen && (
        <div className="mt-4 border rounded-lg p-4 max-h-[90vh] overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">ค้นหาและเลือกอาหาร</h3>
            {/* ปุ่มปิด */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* ส่วนค้นหาและกรอง */}
          <div className="space-y-4 py-4">
            <form onSubmit={handleSearch} className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาอาหาร"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button type="submit">ค้นหา</Button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">หมวดหมู่</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* แสดงสถานะการโหลด */}
          {loading && (
            <div className="text-center py-4">กำลังโหลดข้อมูล...</div>
          )}

          {/* แสดงรายการอาหาร */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFoods.length > 0 ? (
                filteredFoods.map((food) => (
                  <Card key={food.food_id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {food.food_name}
                        </CardTitle>
                        {food.food_category && (
                          <Badge variant="outline">{food.food_category}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {food.serving_size &&
                          `ขนาดเสิร์ฟ: ${food.serving_size}`}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>แคลอรี่: {food.calories || 0} kcal</div>
                        <div>โปรตีน: {food.protein || 0} g</div>
                        <div>คาร์บ: {food.carbs || 0} g</div>
                        <div>ไขมัน: {food.fat || 0} g</div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button
                        className="w-full"
                        onClick={() => handleSelectFood(food)}
                      >
                        เลือก
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  {searchTerm ? "ไม่พบอาหารที่ค้นหา" : "กรุณาค้นหาอาหาร"}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
