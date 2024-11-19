"use client";

import { useEffect, useState } from "react";

import LoadingSpinner from "../_components/LoadingSpinner";

import { redirect, useRouter } from "next/navigation";

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
