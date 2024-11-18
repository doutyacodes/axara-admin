// hooks/useAuth.js
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    try {
      const decoded = jwt.decode(token);
      if (decoded) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error decoding token", error);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("token"); // Remove token from storage
    setIsAuthenticated(false); // Update state
    router.replace("/login"); // Redirect to login page
  };

  return { isAuthenticated, loading, logout };
};

export default useAuth;
