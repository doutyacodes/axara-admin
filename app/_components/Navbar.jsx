"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="w-full bg-transparent min-h-16 border-b-4 border-[#f59e1e]">
      <div className="max-w-7xl mx-auto pr-1">
        <div className="flex items-center justify-between w-full">
          <div className="block absolute top-10 left-2 z-[999999999] md:hidden opacity-0">
            <Menu />
          </div>
          <Link href={"/"} className="mx-auto flex justify-center items-center">
            <Image
              src={"/images/logo2.png"}
              width={120}
              height={120}
              alt="logo"
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
