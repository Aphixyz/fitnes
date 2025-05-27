"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useSWRInfinite from "swr/infinite";

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};

export default function useExerciseSearch(searchTerm, filters, pageSize = 20) {
  // SWR cache key
  const getKey = useCallback(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.data?.length) return null;

      const offset = pageIndex * pageSize;

      const url = new URL("/api/exercises", window.location.origin);
      url.searchParams.append("limit", pageSize.toString());
      url.searchParams.append("offset", offset.toString());

      if (searchTerm) {
        url.searchParams.append("q", searchTerm);
      }

      Object.entries(filters).forEach(([key, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          values.forEach((value) => {
            url.searchParams.append(key, value);
          });
        }
      });

      return url.toString();
    },
    [searchTerm, JSON.stringify(filters), pageSize]
  );

  // useSWRInfinite สำหรับ infinite loading
  const {
    data: pages,
    error,
    size,
    setSize,
    isValidating,
    mutate,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 นาที
  });

  // ดึงข้อมูลตัวเลือกสำหรับ filter
  const [filterOptions, setFilterOptions] = useState({
    muscles: [],
    equipment: [],
    levels: [],
    categories: [],
    mechanics: [],
  });

  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const response = await fetch("/api/exercise-filters");
        if (response.ok) {
          const data = await response.json();
          setFilterOptions(data);
        }
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    }

    fetchFilterOptions();
  }, []);

  // รวมข้อมูลและสถานะ
  const isLoading = !pages && !error;
  const isLoadingMore = isValidating && pages?.length > 0;
  const exercises = pages ? pages.flatMap((page) => page.data || []) : [];
  const totalCount = pages && pages.length > 0 ? pages[0].total : 0;
  const hasMore =
    pages && pages.length > 0 ? exercises.length < totalCount : false;

  // ฟังก์ชันสำหรับโหลดข้อมูลเพิ่มเติม
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setSize(size + 1);
    }
  }, [isLoadingMore, hasMore, setSize, size]);

  // Intersection Observer สำหรับ infinite scroll
  const observerRef = useRef(null);
  const loaderRef = useCallback(
    (node) => {
      // หากกำลังโหลดข้อมูล ไม่ต้อง observe
      if (isLoadingMore) return;

      // ทำลาย observer เดิม
      if (observerRef.current) observerRef.current.disconnect();

      // สร้าง observer ใหม่
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      // เริ่ม observe element
      if (node) observerRef.current.observe(node);
    },
    [isLoadingMore, hasMore, loadMore]
  );

  return {
    exercises,
    isLoading,
    isLoadingMore,
    totalCount,
    hasMore,
    loadMore,
    filterOptions,
    loaderRef,
    error,
  };
}
