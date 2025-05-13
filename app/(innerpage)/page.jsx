"use client";

import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import LoadingSpinner from "../_components/LoadingSpinner";
import { redirect } from "next/navigation";

const Home = () => {

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/verify-token", { method: "GET" });

      if (!res.ok) {
        redirect("/login");
        return;
      }

      const data = await res.json();
      const role = data.role;

      if (role === "newsmap_admin") {
        redirect("/news-map");
      } else {
        redirect("/news");
      }
    };

    checkAuth().catch((err) => {
      console.error("Unexpected error in auth check", err);
      redirect("/login");
    });
  
    checkAuth();
  }, []);
  

  return <LoadingSpinner />;
};

export default Home;
