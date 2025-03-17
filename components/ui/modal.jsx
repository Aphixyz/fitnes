"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from '@/utils/utils';

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  showCloseButton = true,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              {title && (
                <h3 className="text-xl font-semibold text-foreground">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                className="ml-4 text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export { Modal };