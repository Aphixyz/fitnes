"use client";

import { useState } from "react";

export default function ExerciseImage({
  exerciseId,
  name,
  width = "100%",
  height = "100%",
}) {
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(`/exercises/${exerciseId}/0.jpg`);

  const handleError = () => {
    // ถ้าโหลดรูปหลักไม่ได้ ให้ใช้ fallback
    if (!hasError) {
      setHasError(true);
      setImageSrc("/placeholder-exercise.png");
    }
  };

  return (
    <img
      src={imageSrc}
      alt={name || "Exercise Image"}
      onError={handleError}
      className="object-cover w-full h-full"
      style={{ width, height }}
      width={56}
      height={56}
      loading="lazy"
      />
  );
}
