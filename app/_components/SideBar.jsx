"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaBook,
  FaTasks,
  FaUserFriends,
  FaMedal,
  FaHistory,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaInfoCircle,
  FaStar,
  FaBuilding,
  FaNewspaper,
  FaTrophy,
} from "react-icons/fa";
import Image from "next/image";
import { ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "../hooks/useAuth";
import { BsActivity } from "react-icons/bs";

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const { isAuthenticated, loading, logout } = useAuth();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemClick = () => {
    setIsCollapsed(true);
  };

  const navLinks = [
    { label: "Axara News", links: "/news", icon: FaNewspaper  },  // Changed to "FaBuilding" for About Us    
    // { label: "Search", links: "/search", icon: FaSearch },
    { label: "Learn", links: "/learn", icon: FaBook },
    { label: "Challenges", links: "/challenges", icon: FaTrophy },    
    // { label: "Tests", links: "/tests", icon: FaTasks },
    { label: "Activities", links: "/activities", icon: BsActivity },
    { label: "Users", links: "/users", icon: FaUserFriends },
    // { label: "Our Story", links: "/our-story", icon: FaInfoCircle },
    // { label: "Our Features", links: "/our-features", icon: FaStar },
    // { label: "About Us", links: "/about-us", icon: FaBuilding },  // Changed to "FaBuilding" for About Us    
  ];

  return (
    <>
      <div
        onClick={toggleCollapse}
        className={cn(
          "",
          isCollapsed
            ? "block absolute top-7 left-3 z-[999999999] md:hidden"
            : "hidden"
        )}
      >
        <Menu />
      </div>
      {!isCollapsed && (
        <div
          onClick={toggleCollapse}
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998] md:hidden"
        />
      )}
      <motion.div
        animate={{ width: isCollapsed ? "6rem" : "14rem" }}
        className={cn(
          "min-h-screen shadow-lg bg-[#f8f8f8] relative max-md:fixed z-[9999999] flex flex-col p-3 rounded-md lg:block ",
          isCollapsed ? "hidden" : "flex"
        )}
        initial={{ width: "6rem" }}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center justify-between rounded-full bg-orange-500 w-fit absolute -right-2 top-5 z-[99999999]"
          onClick={toggleCollapse}
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: isCollapsed ? 0 : 180 }}

            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="text-2xl font-bold text-white"
          >
            <ChevronRight />
          </motion.div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-8 space-y-4">
          {navLinks.map(({ label, icon: Icon, links }, idx) => {
            const isActive =
              links === "/"
                ? pathname === links // Exact match for the root path
                : pathname.includes(links); // Partial match for other links
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={handleItemClick} // Collapse sidebar when item is clicked
              >
                <Link
                  href={links || "/"}
                  className={cn(
                    "flex items-center p-2 hover:bg-blue-100 rounded-lg cursor-pointer",
                    isCollapsed ? "flex-col justify-center gap-2" : "flex-row"
                  )}
                >
                  <Icon
                    size={24}
                    className={isActive ? "text-red-500" : "text-black"}
                  />
                  <span
                    className={`${
                      isCollapsed ? "text-[10px] text-nowrap" : "block ml-3"
                    } transition-all duration-300 ${
                      isActive ? "text-red-500" : ""
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </motion.div>
    </>
  );
};

export default SideBar;
