"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "react-hot-toast";
import LoadingSpinner from "../_components/LoadingSpinner";
import {
  IoChevronBackOutline,
  IoPauseCircle,
  IoPlayCircle,
  IoStopCircle,
} from "react-icons/io5";
import Link from "next/link";
import Navbar from "../_components/Navbar";
import GlobalApi from "../api/_services/GlobalApi";
import { useChildren } from "@/context/CreateContext";
import useAuth from "../hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowUpLeftFromSquare, ChevronLeft } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Function to handle scroll to a specific section and update visibility

  useEffect(()=>{
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;    
    if(!token){
      redirect("/login")
    } else {
      redirect("/news")
    }
  },[])

  return <LoadingSpinner />;
};

export default Home;
