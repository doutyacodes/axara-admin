"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children, allowedRoutes = [] }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAllowed = 
      allowedRoutes.includes(pathname) || pathname.startsWith("/learn/");

    if (!loading && !isAuthenticated && !isAllowed) {
      router.replace("/login"); // Redirect to login page
    }
  }, [isAuthenticated, loading, pathname, router, allowedRoutes]);

  if (loading) {
    return <LoadingSpinner />; // Optionally, add a loading spinner
  }

  const isAllowed = 
    allowedRoutes.includes(pathname) || pathname.startsWith("/learn/");

  return isAuthenticated || isAllowed ? children : null;
};

export default ProtectedRoute;
