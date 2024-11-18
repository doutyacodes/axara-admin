"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import GlobalApi from "@/app/api/_services/GlobalApi";
import { useRouter } from "next/navigation";
import WelcomeCard from "@/app/_components/WelcomeCard";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

const ChildrenContext = createContext();

export const ChildrenProvider = ({ children }) => {
  const [childrenData, setChildrenData] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedWeeks, setSelectedWeeks] = useState(null);
  const [selectedDob, setSelectedDob] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const updateChildrenData = (data) => {
    setChildrenData(data);
  };

  const selectChild = (childId) => {
    const selectedChild = childrenData.find(
      (child) => child.id === parseInt(childId)
    );
    console.log("selectedChild", selectedChild);
    if (selectedChild) {
      setSelectedChildId(selectedChild.id);
      setSelectedAge(selectedChild.age);
      setSelectedGender(selectedChild.gender);
      setSelectedName(selectedChild.name);
      setSelectedWeeks(selectedChild.weeks);
      setSelectedDob(selectedChild.dob);
      setSelectedGrade(selectedChild.grade);
      setShowPopup(true);
    }
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup, router]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        const response = await GlobalApi.GetUserChildren(token);
        const children = response.data.data;
        setChildrenData(children);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []); // Only fetch if childrenData is empty

  useEffect(() => {
    const handleSingleData = () => {
      if (!selectedChildId && childrenData.length > 0) {
        selectChild(childrenData[0].id);
        setSelectedChild(childrenData[0]);
      }
    };
    handleSingleData();
  }, [childrenData]);

  return (
    <ChildrenContext.Provider
      value={{
        childrenData,
        updateChildrenData,
        selectedChildId,
        selectChild,
        selectedAge,
        selectedGender,
        selectedName,
        selectedWeeks,
        selectedDob,
        loading,
        selectedChild,
        selectedGrade
      }}
    >
      {loading ? <LoadingSpinner /> : children}
      {showPopup && selectedName && selectedAge && (
        <WelcomeCard
          data={{
            name: selectedName,
            age: selectedAge,
            gender: selectedGender,
          }}
        />
      )}
    </ChildrenContext.Provider>
  );
};

export const useChildren = () => {
  return useContext(ChildrenContext);
};
