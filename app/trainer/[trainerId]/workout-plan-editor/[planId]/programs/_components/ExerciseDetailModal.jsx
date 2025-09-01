"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Info, Loader2 } from "lucide-react";

export default function ExerciseDetailModal({ isOpen, onClose, exercise }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [totalImages, setTotalImages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exerciseDetails, setExerciseDetails] = useState(null);

  // โหลดรายละเอียดเพิ่มเติมจาก exercises.json
  useEffect(() => {
    if (!isOpen || !exercise) return;

    const fetchExerciseDetails = async () => {
      try {
        // ดึงข้อมูลจาก API
        const response = await fetch(`/api/exercises/${exercise.exercise_id}`);
        if (!response.ok)
          throw new Error("ไม่สามารถดึงข้อมูลท่าออกกำลังกายได้");

        const data = await response.json();
        setExerciseDetails(data);
      } catch (error) {
        console.error("Error fetching exercise details:", error);
        setExerciseDetails(null);
      }
    };

    fetchExerciseDetails();
  }, [isOpen, exercise]);

  // โหลดรูปภาพทั้งหมด
  useEffect(() => {
    if (!isOpen || !exercise) return;

    setLoading(true);
    setCurrentImageIndex(0);

    // ตรวจสอบว่ามีรูปภาพทั้งหมดกี่รูป (โดยทดลองโหลด index 0-5)
    const checkImagesCount = async () => {
      const foundImages = [];
      const maxImagesToCheck = 6;

      for (let i = 0; i < maxImagesToCheck; i++) {
        try {
          const imgUrl = `/exercises/${exercise.exercise_id}/${i}.jpg`;
          const response = await fetch(imgUrl, { method: "HEAD" });
          if (response.ok) {
            foundImages.push(imgUrl);
          }
        } catch (error) {
          console.log(`Image ${i} not found`);
        }
      }

      // ถ้าไม่มีรูปเลย ใช้รูป placeholder
      if (foundImages.length === 0) {
        foundImages.push("/placeholder-exercise.png");
      }

      setImages(foundImages);
      setTotalImages(foundImages.length);
      setLoading(false);
    };

    checkImagesCount();
  }, [isOpen, exercise]);

  if (!exercise) return null;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  // แปลงรายละเอียดจาก string เป็น list
  const getInstructionsList = () => {
    // ใช้ข้อมูลจาก API หากมี
    if (exerciseDetails?.instructions) {
      // ตรวจสอบว่า instructions เป็น array หรือไม่
      if (Array.isArray(exerciseDetails.instructions)) {
        return exerciseDetails.instructions.filter(
          (item) => item && item.trim() !== ""
        );
      }

      // ตรวจสอบว่า instructions เป็น string หรือไม่
      if (typeof exerciseDetails.instructions === "string") {
        return exerciseDetails.instructions
          .split("\n")
          .filter((line) => line.trim() !== "");
      }

      // กรณีเป็นชนิดข้อมูลอื่นๆ เช่น object
      return ["ไม่สามารถแสดงข้อมูลวิธีการทำได้"];
    }

    // ใช้ข้อมูลจาก props หากไม่มีข้อมูลจาก API
    if (exercise.instructions) {
      if (typeof exercise.instructions === "string") {
        return exercise.instructions
          .split("\n")
          .filter((line) => line.trim() !== "");
      }

      if (Array.isArray(exercise.instructions)) {
        return exercise.instructions.filter(
          (item) => item && item.trim() !== ""
        );
      }
    }

    return [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {exercise.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* ส่วนรูปภาพ */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="relative h-full">
                <img
                  src={images[currentImageIndex]}
                  alt={`${exercise.name} - ภาพที่ ${currentImageIndex + 1}`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />

                {totalImages > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          className={`w-2 h-2 rounded-full ${
                            idx === currentImageIndex
                              ? "bg-primary"
                              : "bg-gray-300"
                          }`}
                          onClick={() => setCurrentImageIndex(idx)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ส่วนรายละเอียด */}
          <div>
            <h3 className="text-lg font-semibold mb-2">รายละเอียด</h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
              <div className="text-sm font-medium">กลุ่มกล้ามเนื้อหลัก:</div>
              <div className="text-sm">
                {exercise.primaryMuscles?.join(", ") || "-"}
              </div>

              <div className="text-sm font-medium">กลุ่มกล้ามเนื้อรอง:</div>
              <div className="text-sm">
                {exercise.secondaryMuscles?.join(", ") || "-"}
              </div>

              <div className="text-sm font-medium">อุปกรณ์:</div>
              <div className="text-sm">{exercise.equipment || "-"}</div>

              <div className="text-sm font-medium">ระดับ:</div>
              <div className="text-sm">{exercise.level || "-"}</div>

              <div className="text-sm font-medium">ประเภท:</div>
              <div className="text-sm">{exercise.category || "-"}</div>
            </div>

            {/* คำอธิบายวิธีทำท่าออกกำลังกาย */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                วิธีการทำ
              </h3>

              {/* แสดงข้อความกำลังโหลดข้อมูล */}
              {isOpen && !exerciseDetails && (
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังโหลดรายละเอียด...
                </div>
              )}

              {getInstructionsList().length > 0 ? (
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {getInstructionsList().map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">
                  ไม่มีข้อมูลวิธีการทำ
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
