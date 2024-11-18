import React from "react";
import ProtectedRoute from "../_components/ProtectedRoute";
import { ChildrenProvider } from "@/context/CreateContext";
import Navbar from "../_components/Navbar";
import SideBar from "../_components/SideBar";
import RightSideBar from "../_components/RightSideBar";

const ProtectLayout = ({ children }) => {
  return (
    <ProtectedRoute allowedRoutes={["/", "/our-story", "/about-us","/our-features","/about-us"]}>
      {/* <ChildrenProvider> */}
        <div className="relative min-h-screen flex bg-gradient-to-br from-orange-100 via-white to-orange-50">
          <SideBar />

          {/* Content */}
          <div className="flex-grow relative z-10 p-3">
            <Navbar />
            {children}
          </div>
          {/* <RightSideBar /> */}
        </div>
      {/* </ChildrenProvider> */}
    </ProtectedRoute>
  );
};

export default ProtectLayout;
