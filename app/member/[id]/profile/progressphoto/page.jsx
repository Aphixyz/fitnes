"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Camera, X, ZoomIn } from "lucide-react";
import { getMemberHealthHistory, deleteHealthPhoto } from "@/actions/member/healthActions";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

// Photo Card Component
const PhotoCard = ({ photoUrl, photoType, onDelete, onViewPhoto }) => {
  return (
    <div className="relative flex-shrink-0 mr-4 last:mr-0">
      {/* Larger size container for mobile */}
      <div className="w-40 h-48 bg-gray-100 rounded-3xl overflow-hidden relative">
        {photoUrl ? (
          <>
            <img 
              src={photoUrl} 
              alt={`${photoType} photo`} 
              className="w-full h-full object-cover object-center cursor-pointer"
              onClick={() => onViewPhoto(photoUrl, photoType)}
            />
            {/* Delete Icon */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="absolute top-3 right-3 w-8 h-8 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-opacity z-10"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
            
            {/* Photo Type Label Overlay */}
            <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 rounded-lg px-3 py-1.5">
              <span className="text-sm text-white font-medium">{photoType}</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Photo Type Label for empty state */}
      {!photoUrl && (
        <div className="text-center mt-2">
          <span className="text-sm text-gray-600 font-medium">{photoType}</span>
        </div>
      )}
    </div>
  );
};

// Timeline Date Group Component
const TimelineDateGroup = ({ date, photos, isToday, onDeletePhoto, onViewPhoto, weight }) => {
  const formatDateHeader = (dateString, isToday, weight) => {
    if (isToday) {
      const weightText = weight ? ` - น้ำหนัก ${parseFloat(weight).toFixed(1)} กก.` : "";
      return `วันนี้${weightText}`;
    }
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const thaiMonth = thaiMonths[date.getMonth()];
    const buddhistYear = date.getFullYear() + 543;
    
    const weightText = weight ? ` - น้ำหนัก ${parseFloat(weight).toFixed(1)} กก.` : "";
    
    return `${day} ${thaiMonth} ${buddhistYear}${weightText}`;
  };

  return (
    <div className="mb-8">
      {/* Date Header with Dashed Lines */}
      <div className="relative flex items-center mb-6">
        {/* Left dashed line */}
        <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
        
        {/* Date Header */}
        <div className="px-4">
          <h3 className="text-lg font-semibold text-gray-500 whitespace-nowrap">
            {formatDateHeader(date, isToday)}
          </h3>
        </div>
        
        {/* Right dashed line */}
        <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
      </div>
      
      {/* Horizontal Scrolling Photo Grid */}
      <div className="overflow-x-auto overflow-y-hidden px-4">
        <div 
          className="flex items-start"
          style={{ 
            width: 'max-content',
            minHeight: 'fit-content'
          }}
        >
          {photos.map((photo, index) => (
            <PhotoCard
              key={index}
              photoUrl={photo.url}
              photoType={photo.type}
              onDelete={() => onDeletePhoto(photo)}
              onViewPhoto={onViewPhoto}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Camera className="h-10 w-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      ยังไม่มีรูปภาพความคืบหน้า
    </h3>
    <p className="text-gray-500 mb-6 max-w-sm">
      เริ่มต้นบันทึกรูปภาพความคืบหน้าของคุณ เพื่อติดตามการเปลี่ยนแปลงของร่างกาย
    </p>
  </div>
);

// Loading Component
const LoadingState = () => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-500">กำลังโหลด...</span>
  </div>
);

export default function ProgressPhotoPage({ params }) {
  const router = useRouter();
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    photo: null,
    isDeleting: false
  });

  // Photo viewer state
  const [photoViewer, setPhotoViewer] = useState({
    isOpen: false,
    photoUrl: null,
    photoType: null
  });

  // Process health history into timeline format
  const processHealthHistoryToTimeline = (healthHistory) => {
    const groupedByDate = {};
    
    healthHistory.forEach(entry => {
      const date = entry.member_health_measurementdate;
      if (!date) return;
      
      const dateKey = new Date(date).toDateString();
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: date,
          weight: entry.member_health_weight, // Store weight for this date
          photos: []
        };
      }
      
      // Update weight if this entry has weight data and current doesn't
      if (entry.member_health_weight && !groupedByDate[dateKey].weight) {
        groupedByDate[dateKey].weight = entry.member_health_weight;
      }
      
      // Add photos to the date group
      const photos = [];
      if (entry.photo_front) {
        photos.push({
          url: entry.photo_front,
          type: "ด้านหน้า",
          entryId: entry.member_health_id,
          photoField: "photo_front"
        });
      }
      if (entry.photo_side) {
        photos.push({
          url: entry.photo_side,
          type: "ด้านข้าง", 
          entryId: entry.member_health_id,
          photoField: "photo_side"
        });
      }
      if (entry.photo_back) {
        photos.push({
          url: entry.photo_back,
          type: "ด้านหลัง",
          entryId: entry.member_health_id,
          photoField: "photo_back"
        });
      }
      
      groupedByDate[dateKey].photos.push(...photos);
    });
    
    // Convert to array and sort by date (newest first)
    return Object.values(groupedByDate)
      .filter(group => group.photos.length > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const isToday = (dateString) => {
    const today = new Date();
    const checkDate = new Date(dateString);
    return today.toDateString() === checkDate.toDateString();
  };

  useEffect(() => {
    const fetchHealthHistory = async () => {
      try {
        const { id } = await params;
        const memberId = parseInt(id);
        
        // Fetch health history with a reasonable limit
        const history = await getMemberHealthHistory(memberId, 50);
        
        // Get all entries with weight or photos for processing
        const allEntries = history.filter(entry => 
          entry.photo_front || 
          entry.photo_side || 
          entry.photo_back ||
          entry.member_health_weight
        );
        
        // Process into timeline format
        const processedTimeline = processHealthHistoryToTimeline(allEntries);
        setTimelineData(processedTimeline);
      } catch (err) {
        console.error("Error fetching health history:", err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthHistory();
  }, [params]);

  const handleDeletePhoto = (photo) => {
    // Open confirmation dialog
    setDeleteDialog({
      isOpen: true,
      photo: photo,
      isDeleting: false
    });
  };

  const confirmDeletePhoto = async () => {
    if (!deleteDialog.photo) return;
    
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
    
    try {
      const { id } = await params;
      const memberId = parseInt(id);
      
      // Call the delete photo server action
      const result = await deleteHealthPhoto(
        deleteDialog.photo.entryId, 
        memberId, 
        deleteDialog.photo.photoField
      );
      
      if (result.success) {
        // Update the local state by refetching data
        const history = await getMemberHealthHistory(memberId, 50);
        const allEntries = history.filter(entry => 
          entry.photo_front || 
          entry.photo_side || 
          entry.photo_back ||
          entry.member_health_weight
        );
        
        const processedTimeline = processHealthHistoryToTimeline(allEntries);
        setTimelineData(processedTimeline);
        
        // Close dialog
        setDeleteDialog({ isOpen: false, photo: null, isDeleting: false });
        
        console.log(result.message);
      } else {
        console.error("Failed to delete photo:", result.error);
        setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
        alert(`เกิดข้อผิดพลาด: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
      alert("เกิดข้อผิดพลาดในการลบรูปภาพ");
    }
  };

  const cancelDeletePhoto = () => {
    setDeleteDialog({ isOpen: false, photo: null, isDeleting: false });
  };

  const handleViewPhoto = (photoUrl, photoType) => {
    setPhotoViewer({
      isOpen: true,
      photoUrl: photoUrl,
      photoType: photoType
    });
  };

  const closePhotoViewer = () => {
    setPhotoViewer({
      isOpen: false,
      photoUrl: null,
      photoType: null
    });
  };

  // Handle escape key to close photo viewer
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && photoViewer.isOpen) {
        closePhotoViewer();
      }
    };

    if (photoViewer.isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when viewer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [photoViewer.isOpen]);

  return (
    <div className="min-h-full bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 h-20 bg-white border-b border-gray-200 pt-2 items-center justify-center">
        <div className="flex items-center justify-between p-4 h-16">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors items-start justify-start"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">รูปภาพ</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="py-4">
        {loading ? (
          <div className="px-4">
            <LoadingState />
          </div>
        ) : error ? (
          <div className="px-4">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <p className="text-red-500 mb-2">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ลองใหม่
                </button>
              </div>
            </div>
          </div>
        ) : timelineData.length === 0 ? (
          <div className="px-4">
            <EmptyState />
          </div>
        ) : (
          <div>
            {/* Timeline Content */}
            {timelineData.map((dateGroup, index) => (
              <TimelineDateGroup
                key={index}
                date={dateGroup.date}
                photos={dateGroup.photos}
                weight={dateGroup.weight}
                isToday={isToday(dateGroup.date)}
                onDeletePhoto={handleDeletePhoto}
                onViewPhoto={handleViewPhoto}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full-Screen Photo Viewer */}
      {photoViewer.isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closePhotoViewer}
              className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity z-10"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            
            {/* Photo Type Label */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg px-4 py-2 z-10">
              <span className="text-white font-medium">
                รูปภาพ{photoViewer.photoType === "Front" ? "ด้านหน้า" : 
                      photoViewer.photoType === "Side" ? "ด้านข้าง" : "ด้านหลัง"}
              </span>
            </div>
            
            {/* Main Image */}
            <img
              src={photoViewer.photoUrl}
              alt={`${photoViewer.photoType} photo full view`}
              className="max-w-full max-h-full object-contain cursor-pointer"
              onClick={closePhotoViewer}
            />
            
            {/* Tap to close hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-lg px-4 py-2">
              <span className="text-white text-sm">แตะเพื่อปิด</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Drawer */}
      <Drawer open={deleteDialog.isOpen} onOpenChange={(open) => !deleteDialog.isDeleting && !open && cancelDeletePhoto()}>
        <DrawerContent>
          <DrawerHeader className="text-center pb-2">
            <DrawerTitle className="text-xl font-semibold">ยืนยันการลบรูปภาพ</DrawerTitle>
            <DrawerDescription className="mt-3 text-base leading-relaxed px-2">
              {deleteDialog.photo && (
                <>
                  <span className="mb-3 block">
                    คุณต้องการลบรูปภาพ
                    <span className="font-medium">
                      {deleteDialog.photo.type === "Front" ? "ด้านหน้า" : 
                       deleteDialog.photo.type === "Side" ? "ด้านข้าง" : "ด้านหลัง"}
                    </span>
                    นี้หรือไม่?
                  </span>
                </>
              )}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pt-4 pb-8 px-4 gap-3">
            <Button
              variant="destructive"
              onClick={confirmDeletePhoto}
              disabled={deleteDialog.isDeleting}
              className="w-full h-12 text-base font-medium bg-red-600 text-white"
            >
              {deleteDialog.isDeleting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white  border-t-transparent"></div>
                  กำลังลบ...
                </div>
              ) : (
                "ลบรูปภาพ"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={cancelDeletePhoto}
              disabled={deleteDialog.isDeleting}
              className="w-full h-12 text-base font-medium"
            >
              ยกเลิก
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}