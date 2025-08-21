"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const MultiRangeSlider = React.forwardRef(({
  className,
  value = [30, 60], // [proteinEnd, fatEnd] - carbs auto-calculated
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenThumbs = 5,
  disabled = false,
  colors = {
    protein: "bg-green-500",
    fat: "bg-orange-500", 
    carb: "bg-purple-500"
  },
  labels = {
    protein: "Protein",
    fat: "Fat",
    carb: "Carbohydrates"
  },
  ...props
}, ref) => {
  const [isDragging, setIsDragging] = React.useState(null);
  const [isHovering, setIsHovering] = React.useState(null);
  const sliderRef = React.useRef(null);
  
  React.useImperativeHandle(ref, () => sliderRef.current);

  const [proteinEnd, fatEnd] = value;
  const proteinPercent = proteinEnd;
  const fatPercent = fatEnd - proteinEnd;
  const carbPercent = max - fatEnd;

  const getPercentageFromPosition = (clientX) => {
    if (!sliderRef.current) return 0;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.min(max, Math.max(min, ((clientX - rect.left) / rect.width) * (max - min) + min));
    return Math.round(percentage / step) * step;
  };

  const handleMouseDown = (e, thumbIndex) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(thumbIndex);
  };

  const handleMouseMove = React.useCallback((e) => {
    if (isDragging === null || !onValueChange) return;
    
    const newPosition = getPercentageFromPosition(e.clientX);
    const [currentProteinEnd, currentFatEnd] = value;
    
    if (isDragging === 0) { // Protein handle
      const newProteinEnd = Math.max(
        min + minStepsBetweenThumbs, 
        Math.min(newPosition, currentFatEnd - minStepsBetweenThumbs)
      );
      onValueChange([newProteinEnd, currentFatEnd]);
    } else if (isDragging === 1) { // Fat handle  
      const newFatEnd = Math.max(
        currentProteinEnd + minStepsBetweenThumbs,
        Math.min(newPosition, max - minStepsBetweenThumbs)
      );
      onValueChange([currentProteinEnd, newFatEnd]);
    }
  }, [isDragging, value, onValueChange, min, max, minStepsBetweenThumbs]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(null);
  }, []);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTrackClick = (e) => {
    if (disabled || isDragging !== null) return;
    
    const clickPosition = getPercentageFromPosition(e.clientX);
    const [currentProteinEnd, currentFatEnd] = value;
    
    // Determine which handle is closer and move that one
    const distanceToProtein = Math.abs(clickPosition - currentProteinEnd);
    const distanceToFat = Math.abs(clickPosition - currentFatEnd);
    
    if (distanceToProtein < distanceToFat) {
      // Move protein handle
      const newProteinEnd = Math.max(
        min + minStepsBetweenThumbs,
        Math.min(clickPosition, currentFatEnd - minStepsBetweenThumbs)
      );
      onValueChange([newProteinEnd, currentFatEnd]);
    } else {
      // Move fat handle
      const newFatEnd = Math.max(
        currentProteinEnd + minStepsBetweenThumbs,
        Math.min(clickPosition, max - minStepsBetweenThumbs)
      );
      onValueChange([currentProteinEnd, newFatEnd]);
    }
  };

  // Touch support for mobile devices
  const handleTouchStart = (e, thumbIndex) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(thumbIndex);
  };

  const handleTouchMove = React.useCallback((e) => {
    if (isDragging === null || !onValueChange) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const newPosition = getPercentageFromPosition(touch.clientX);
    const [currentProteinEnd, currentFatEnd] = value;
    
    if (isDragging === 0) { // Protein handle
      const newProteinEnd = Math.max(
        min + minStepsBetweenThumbs, 
        Math.min(newPosition, currentFatEnd - minStepsBetweenThumbs)
      );
      onValueChange([newProteinEnd, currentFatEnd]);
    } else if (isDragging === 1) { // Fat handle  
      const newFatEnd = Math.max(
        currentProteinEnd + minStepsBetweenThumbs,
        Math.min(newPosition, max - minStepsBetweenThumbs)
      );
      onValueChange([currentProteinEnd, newFatEnd]);
    }
  }, [isDragging, value, onValueChange, min, max, minStepsBetweenThumbs]);

  const handleTouchEnd = React.useCallback(() => {
    setIsDragging(null);
  }, []);

  // Add global touch event listeners
  React.useEffect(() => {
    if (isDragging !== null) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  return (
    <div className={cn("relative w-full", className)} {...props}>
      {/* Increased padding to ensure handles are always visible */}
      <div className="py-6 px-3">
        {/* Track Container */}
        <div
          ref={sliderRef}
          className="relative h-4 w-full bg-gray-200 rounded-full cursor-pointer select-none shadow-inner"
          onClick={handleTrackClick}
        >
          {/* Active ranges showing macro distribution */}
          <div 
            className={cn("absolute h-full rounded-l-full transition-all duration-200", colors.protein)}
            style={{ 
              left: '0%',
              width: `${Math.max(0, proteinPercent)}%` 
            }}
          />
          <div 
            className={cn("absolute h-full transition-all duration-200", colors.fat)}
            style={{ 
              left: `${Math.max(0, proteinPercent)}%`,
              width: `${Math.max(0, fatPercent)}%` 
            }}
          />
          <div 
            className={cn("absolute h-full rounded-r-full transition-all duration-200", colors.carb)}
            style={{ 
              left: `${Math.max(0, proteinPercent + fatPercent)}%`,
              width: `${Math.max(0, carbPercent)}%` 
            }}
          />

          {/* Enhanced visual dividers */}
          <div className="absolute inset-0 pointer-events-none">
            {proteinPercent > 0 && proteinPercent < 100 && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm"
                style={{ left: `${proteinPercent}%`, transform: 'translateX(-1px)' }}
              />
            )}
            {fatEnd < 100 && fatEnd > 0 && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm"
                style={{ left: `${fatEnd}%`, transform: 'translateX(-1px)' }}
              />
            )}
          </div>
        </div>

        {/* Protein Handle - Enhanced visibility */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white border-3 border-green-500 rounded-full cursor-grab transition-all duration-200 shadow-lg hover:shadow-xl",
            isDragging === 0 && "cursor-grabbing scale-125 shadow-2xl border-green-600 ring-4 ring-green-200",
            isHovering === 0 && "scale-110 shadow-xl ring-2 ring-green-300",
            disabled && "cursor-not-allowed opacity-50",
            "focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50",
            // Ensure handle stays above track
            "z-30"
          )}
          style={{ 
            left: `${Math.min(Math.max(proteinPercent, 0), 100)}%`,
            borderWidth: '3px'
          }}
          onMouseDown={(e) => handleMouseDown(e, 0)}
          onMouseEnter={() => setIsHovering(0)}
          onMouseLeave={() => setIsHovering(null)}
          onTouchStart={(e) => handleTouchStart(e, 0)}
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-label={`${labels.protein} percentage`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={proteinPercent}
          onKeyDown={(e) => {
            if (disabled) return;
            const [currentProteinEnd, currentFatEnd] = value;
            let newProteinEnd = currentProteinEnd;
            
            switch (e.key) {
              case 'ArrowLeft':
              case 'ArrowDown':
                newProteinEnd = Math.max(min + minStepsBetweenThumbs, currentProteinEnd - step);
                break;
              case 'ArrowRight':
              case 'ArrowUp':
                newProteinEnd = Math.min(currentFatEnd - minStepsBetweenThumbs, currentProteinEnd + step);
                break;
              case 'Home':
                newProteinEnd = min + minStepsBetweenThumbs;
                break;
              case 'End':
                newProteinEnd = currentFatEnd - minStepsBetweenThumbs;
                break;
              default:
                return;
            }
            
            e.preventDefault();
            onValueChange([newProteinEnd, currentFatEnd]);
          }}
        >
          {/* Enhanced inner circle */}
          <div className="absolute inset-0.5 bg-green-500 rounded-full transition-all duration-200 shadow-sm" />
          
          {/* Improved tooltip */}
          <div className={cn(
            "absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-md shadow-lg whitespace-nowrap transition-all duration-200 pointer-events-none",
            (isHovering === 0 || isDragging === 0) ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-1"
          )}>
            {proteinPercent.toFixed(1)}%
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-green-600" />
          </div>
        </div>

        {/* Fat Handle - Enhanced visibility and distinction */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white border-3 border-orange-500 rounded-full cursor-grab transition-all duration-200 shadow-lg hover:shadow-xl",
            isDragging === 1 && "cursor-grabbing scale-125 shadow-2xl border-orange-600 ring-4 ring-orange-200",
            isHovering === 1 && "scale-110 shadow-xl ring-2 ring-orange-300",
            disabled && "cursor-not-allowed opacity-50",
            "focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50",
            // Ensure handle stays above track and above protein handle when overlapping
            "z-30"
          )}
          style={{ 
            left: `${Math.min(Math.max(fatEnd, 0), 100)}%`,
            borderWidth: '3px'
          }}
          onMouseDown={(e) => handleMouseDown(e, 1)}
          onMouseEnter={() => setIsHovering(1)}
          onMouseLeave={() => setIsHovering(null)}
          onTouchStart={(e) => handleTouchStart(e, 1)}
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-label={`${labels.fat} percentage`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={fatEnd}
          onKeyDown={(e) => {
            if (disabled) return;
            const [currentProteinEnd, currentFatEnd] = value;
            let newFatEnd = currentFatEnd;
            
            switch (e.key) {
              case 'ArrowLeft':
              case 'ArrowDown':
                newFatEnd = Math.max(currentProteinEnd + minStepsBetweenThumbs, currentFatEnd - step);
                break;
              case 'ArrowRight':
              case 'ArrowUp':
                newFatEnd = Math.min(max - minStepsBetweenThumbs, currentFatEnd + step);
                break;
              case 'Home':
                newFatEnd = currentProteinEnd + minStepsBetweenThumbs;
                break;
              case 'End':
                newFatEnd = max - minStepsBetweenThumbs;
                break;
              default:
                return;
            }
            
            e.preventDefault();
            onValueChange([currentProteinEnd, newFatEnd]);
          }}
        >
          {/* Enhanced inner circle with distinct styling */}
          <div className="absolute inset-0.5 bg-orange-500 rounded-full transition-all duration-200 shadow-sm" />
          
          {/* Improved tooltip */}
          <div className={cn(
            "absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-orange-600 text-white text-xs font-semibold rounded-md shadow-lg whitespace-nowrap transition-all duration-200 pointer-events-none",
            (isHovering === 1 || isDragging === 1) ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-1"
          )}>
            {fatPercent.toFixed(1)}%
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
});

MultiRangeSlider.displayName = "MultiRangeSlider";

export { MultiRangeSlider };