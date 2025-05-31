"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function ServerPagination({ pagination, trainerId }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { page, totalPages, hasNext, hasPrev } = pagination;

  // สร้าง URL สำหรับ navigation
  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `/trainer/${trainerId}/members?${params.toString()}`;
  };

  // ถ้ามีหน้าเดียวไม่แสดง pagination
  if (totalPages <= 1) return null;

  // สร้างหมายเลขหน้าที่จะแสดง
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // แสดงหมายเลขหน้าสูงสุด 5 หน้า

    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // ปรับ startPage ถ้า endPage ถึงขีดจำกัดแล้ว
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex items-center justify-between">

      <Pagination>
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              href={hasPrev ? createPageURL(page - 1) : undefined}
              className={
                !hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>

          {/* First Page + Ellipsis */}
          {pageNumbers[0] > 1 && (
            <>
              <PaginationItem>
                <PaginationLink href={createPageURL(1)}>1</PaginationLink>
              </PaginationItem>
              {pageNumbers[0] > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {/* Page Numbers */}
          {pageNumbers.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href={createPageURL(pageNumber)}
                isActive={pageNumber === page}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* Last Page + Ellipsis */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink href={createPageURL(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              href={hasNext ? createPageURL(page + 1) : undefined}
              className={
                !hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
