"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getAllProgressPhotos } from "@/actions/trainer/member/fetchMemberProgressPhotos";
import PhotoCard from "./_components/PhotoCard";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProgressPhotoPage() {
  const params = useParams();
  const { trainerId, memberId } = params;

  // State management
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ดึงข้อมูล progress photos ทั้งหมด
  const fetchAllPhotos = async () => {
    if (!memberId) return;

    setLoading(true);
    setError("");

    try {
      const result = await getAllProgressPhotos(memberId);

      if (result.success) {
        setPhotos(result.data);
      } else {
        setError(result.error || "ไม่สามารถดึงข้อมูลรูปภาพได้");
        setPhotos([]);
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      setPhotos([]);
      console.error("Error fetching photos:", err);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchAllPhotos();
  }, [memberId]);

  // จัดเรียงรูปภาพตาม type (front, side, back)
  const sortedPhotos = photos.sort((a, b) => {
    const order = { front: 0, side: 1, back: 2 };
    return (
      order[a.photos.front ? "front" : a.photos.side ? "side" : "back"] -
      order[b.photos.front ? "front" : b.photos.side ? "side" : "back"]
    );
  });

  // แปลงข้อมูลเป็น array ของรูปภาพแต่ละประเภท
  const photoCards = [];
  sortedPhotos.forEach((photoData) => {
    const { photos: photoUrls, measurementDate } = photoData;

    // เพิ่มรูปภาพแต่ละประเภท
    if (photoUrls.front) {
      photoCards.push({
        id: `${photoData.id}-front`,
        imageUrl: photoUrls.front,
        type: "front",
        date: measurementDate,
        addedBy: "Client",
      });
    }

    if (photoUrls.side) {
      photoCards.push({
        id: `${photoData.id}-side`,
        imageUrl: photoUrls.side,
        type: "side",
        date: measurementDate,
        addedBy: "Client",
      });
    }

    if (photoUrls.back) {
      photoCards.push({
        id: `${photoData.id}-back`,
        imageUrl: photoUrls.back,
        type: "back",
        date: measurementDate,
        addedBy: "Client",
      });
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}


      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Photos Grid */}
      {!loading && !error && (
        <div>
          {photoCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photoCards.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  imageUrl={photo.imageUrl}
                  type={photo.type}
                  date={photo.date}
                  addedBy={photo.addedBy}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ไม่พบรูปภาพ
                </h3>
                <p className="text-gray-600 text-center">
                  ไม่พบรูปภาพ progress photos ของสมาชิกคนนี้
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
}
