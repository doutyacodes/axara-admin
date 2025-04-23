"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const logoSrc = pathname?.startsWith("/news") ? "/images/logo3.png" : "/images/logo2.png";

  return (
    <nav className="w-full bg-transparent min-h-16 border-b-4 border-[#f59e1e]">
      <div className="max-w-7xl mx-auto pr-1">
        <div className="flex items-center justify-between w-full">
          <div className="block absolute top-10 left-2 z-[999999999] md:hidden opacity-0">
            <Menu />
          </div>
          <Link href={"/"} className="mx-auto flex justify-center items-center">
          <Image
            src={logoSrc}
            width={250}
            height={250}
            alt="logo"
            className="object-contain"
          />
          </Link>
            <div>
              {!isAuthenticated && (
                <Link href={"/login"} className="font-semibold">
                  Login
                </Link>
              )}
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
