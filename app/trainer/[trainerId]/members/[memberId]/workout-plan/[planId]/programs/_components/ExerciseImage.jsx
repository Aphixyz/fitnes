"use client";

import { useState } from "react";
import Image from "next/image";

export default function ExerciseImage({
  id,
  name,
  width = 60,
  height = 60,
  className = "",
}) {
  const [error, setError] = useState(false);

  // สร้าง path ของรูปภาพ
  const imageSrc = `/exercises/${id}/0.jpg`;

  // Fallback image เมื่อไม่พบรูปภาพ
  const fallbackSrc = "/images/exercise-placeholder.png";

  return (
    <div
      style={{ width, height }}
      className={`overflow-hidden bg-gray-100 flex items-center justify-center relative ${className}`}
    >
      <Image
        src={error ? fallbackSrc : imageSrc}
        alt={name}
        width={width}
        height={height}
        onError={() => setError(true)}
        className="object-cover"
      />
    </div>
  );
}
