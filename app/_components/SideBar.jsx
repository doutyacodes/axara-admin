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
  FaMapMarkedAlt,
} from "react-icons/fa";
import Image from "next/image";
import { ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";
import { BsActivity } from "react-icons/bs";

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading, logout, user } = useAuth();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemClick = () => {
    setIsCollapsed(true);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'GET' });
    localStorage.removeItem("token");
    // Remove specific cookie (auth_token)
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    router.push("/login");
  };

// Define all available links
const allLinks = [
  { label: "Doutya Kids", links: "/news", icon: FaNewspaper },
  { label: "Doutya Perspective", links: "/viewpoint", icon: FaNewspaper },
  // { label: "Search", links: "/search", icon: FaSearch },
  { label: "Learn", links: "/learn", icon: FaBook },
  { label: "Challenges", links: "/challenges", icon: FaTrophy },
  // { label: "Tests", links: "/tests", icon: FaTasks },
  { label: "Activities", links: "/activities", icon: BsActivity },
  { label: "Users", links: "/users", icon: FaUserFriends },
  // { label: "Our Story", links: "/our-story", icon: FaInfoCircle },
  // { label: "Our Features", links: "/our-features", icon: FaStar },
  // { label: "About Us", links: "/about-us", icon: FaBuilding },
];

const newsMapLink = {
  label: "News Map",
  links: "/news-map",
  icon: FaMapMarkedAlt,
};

let navLinks = [];

// Role-based rendering
if (user?.role === "super_admin" || user?.role === "admin") {
  navLinks = [...allLinks, newsMapLink];
} else if (user?.role === "newsmap_admin") {
  navLinks = [newsMapLink];
}

  return (
    <>
      {/* Mobile Menu Button - Always visible on mobile */}
      <div
        onClick={toggleCollapse}
        className="block md:hidden absolute top-7 left-3 z-[999999999] p-2 bg-white rounded-md shadow-md"
      >
        <Menu />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <div
          onClick={toggleCollapse}
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998] md:hidden"
        />
      )}

      {/* Main Sidebar */}
      <motion.div
        animate={{ 
          width: isCollapsed ? "6rem" : "14rem",
          x: isCollapsed && window.innerWidth < 768 ? -100 : 0 
        }}
        className={cn(
          "min-h-screen shadow-lg bg-[#f8f8f8] relative z-[9999999] flex flex-col p-3 rounded-md",
          "md:block", // Always block on md screens and up
          isCollapsed ? "md:block hidden" : "block" // Hide on mobile when collapsed
        )}
        initial={{ width: "6rem" }}
      >
        {/* Sidebar Header - Collapse Toggle Button */}
        <div
          className="flex items-center justify-between rounded-full bg-orange-500 w-fit absolute -right-2 top-5 z-[99999999] cursor-pointer"
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
          
          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: navLinks.length * 0.1 }}
            onClick={handleItemClick} // Collapse sidebar when item is clicked
          >
            <div
              onClick={handleLogout}
              className={cn(
                "flex items-center p-2 hover:bg-blue-100 rounded-lg cursor-pointer mt-auto",
                isCollapsed ? "flex-col justify-center gap-2" : "flex-row"
              )}
            >
              <FaSignOutAlt
                size={24}
                className="text-black"
              />
              <span
                className={`${
                  isCollapsed ? "text-[10px] text-nowrap" : "block ml-3"
                } transition-all duration-300`}
              >
                Logout
              </span>
            </div>
          </motion.div>
        </nav>
      </motion.div>
    </>
  );
};

export default SideBar;