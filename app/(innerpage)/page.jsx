"use client";

import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import LoadingSpinner from "../_components/LoadingSpinner";
import { redirect } from "next/navigation";

const Home = () => {
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      redirect("/login");
      return;
    }

    try {
      const decoded = jwt.decode(token);
      const role = decoded?.role;

      if (role === "newsmap_admin") {
        redirect("/news-map");
      } else {
        redirect("/news");
      }
    } catch (err) {
      console.error("Token decode failed", err);
      redirect("/login");
    }
  }, []);

  return <LoadingSpinner />;
};

export default Home;
