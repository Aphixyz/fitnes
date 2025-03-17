"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from '@/utils/utils';

const Navbar = ({
  logo,
  menuItems = [],
  rightItems,
  userRole = "member", // admin, trainer, member
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const roleBasedStyles = {
    admin: "bg-blue-600",
    trainer: "bg-indigo-600",
    member: "bg-emerald-600",
  };

  return (
    <nav className={cn(
      "border-b border-border shadow-sm",
      roleBasedStyles[userRole] || "bg-primary"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {typeof logo === "string" ? (
                <Link href="/" className="text-white font-bold text-xl">
                  {logo}
                </Link>
              ) : (
                logo
              )}
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-md",
                    pathname === item.href
                      ? "bg-opacity-25 bg-white"
                      : "hover:bg-opacity-15 hover:bg-white"
                  )}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {rightItems && rightItems}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-opacity-15 hover:bg-white focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium text-white",
                  pathname === item.href
                    ? "bg-opacity-25 bg-white"
                    : "hover:bg-opacity-15 hover:bg-white"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 bg-opacity-10 bg-white">
            <div className="px-2 space-y-1">{rightItems && rightItems}</div>
          </div>
        </div>
      )}
    </nav>
  );
};

export { Navbar };