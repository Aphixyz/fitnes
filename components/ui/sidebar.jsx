"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/utils";

const Sidebar = ({
  logo,
  menuItems = [],
  userRole = "member", // admin, trainer, member
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const pathname = usePathname();

  const roleBasedStyles = {
    admin: "bg-blue-600",
    trainer: "bg-indigo-600",
    member: "bg-emerald-600",
  };

  return (
    <aside
      className={cn(
        "h-screen transition-all duration-300",
        roleBasedStyles[userRole] || "bg-primary",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div
          className={cn(
            "flex items-center h-16 px-4",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && typeof logo === "string" ? (
            <Link href="/" className="text-white font-bold text-xl truncate">
              {logo}
            </Link>
          ) : typeof logo === "string" ? (
            <Link href="/" className="text-white font-bold text-xl">
              {logo.charAt(0)}
            </Link>
          ) : (
            logo
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white p-1 rounded-md hover:bg-white hover:bg-opacity-10"
          >
            {isCollapsed ? (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center py-2 px-3 rounded-md text-white transition-colors",
                  pathname === item.href
                    ? "bg-white bg-opacity-25"
                    : "hover:bg-white hover:bg-opacity-10",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                {item.icon && (
                  <span className={isCollapsed ? "" : "mr-3"}>{item.icon}</span>
                )}
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white border-opacity-20">
          {!isCollapsed && (
            <div className="text-white text-sm text-opacity-70">
              © {new Date().getFullYear()} FitTrack
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export { Sidebar };
