"use client";

import React, { Component } from "react";

class ProgressErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // อัพเดท state เพื่อแสดง fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("Progress Chart Error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // ส่งข้อมูล error ไปยัง monitoring service (optional)
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // เรียก callback สำหรับ retry ถ้ามี
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              เกิดข้อผิดพลาดในการแสดงกราฟ
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              ไม่สามารถโหลดข้อมูลความก้าวหน้าได้ กรุณาลองใหม่อีกครั้ง
            </p>

            {/* Error details (แสดงในโหมด development) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  รายละเอียดข้อผิดพลาด (Development Mode)
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-700">
                  <pre className="whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200 text-sm font-medium"
              >
                🔄 ลองใหม่
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200 text-sm font-medium"
              >
                ♻️ รีเฟรชหน้า
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper สำหรับใช้งานง่าย
const ErrorBoundary = ({ children, onRetry, fallback }) => {
  return (
    <ProgressErrorBoundary onRetry={onRetry} fallback={fallback}>
      {children}
    </ProgressErrorBoundary>
  );
};

// Custom error fallback components
export const ChartErrorFallback = (error, retry) => (
  <div className="h-64 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
    <div className="text-center p-4">
      <div className="text-red-500 text-2xl mb-2">📊❌</div>
      <p className="text-red-600 text-sm font-medium mb-2">
        ไม่สามารถโหลดกราฟได้
      </p>
      <button
        onClick={retry}
        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
      >
        ลองใหม่
      </button>
    </div>
  </div>
);

export const CardErrorFallback = (error, retry) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="text-center">
      <div className="text-red-500 text-lg mb-1">⚠️</div>
      <p className="text-red-600 text-xs mb-2">ข้อผิดพลาด</p>
      <button
        onClick={retry}
        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
      >
        ลองใหม่
      </button>
    </div>
  </div>
);

export default ErrorBoundary;
