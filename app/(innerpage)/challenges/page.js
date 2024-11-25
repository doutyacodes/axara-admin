"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import GlobalApi from "@/app/api/GlobalApi";
import EditChallenges from "./_components/EditChallenges/EditChallenges";

const ViewChallenges = () => {
  const [challengesData, setChallengesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAge, setSelectedAge] = useState(3); // Default to age 3
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [currentSection, setCurrentSection] = useState('view');

  // Fetch challenges from the backend
  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await GlobalApi.FetchChallenges({
        age: selectedAge,
        // search: searchTerm,
      });
      setChallengesData(response.data.challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [selectedAge, searchTerm]);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleEdit = (challenge) =>{
    console.log("seteselectdd chalenge", challenge);
    
    setCurrentSection('edit');
    setSelectedChallenge(challenge)
  }

  if (isLoading) {
    return <div>Loading...</div>; // Replace with a proper loading spinner if needed
  }

  return (
    // <div className="min-h-screen p-6 max-w-7xl mx-auto">
    <div className="min-h-screen bg-gray-50/30">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-orange-600 mb-2">Challenges Admin Panel</h1>
        <p className="text-gray-600">Manage your challenges</p>
      </header>
      {
        currentSection === 'view' ? (
          <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">All Challenges</h1>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
                onClick={() => window.location.href = "/challenges/create-challenges"} // Replace with your create challenge route
              >
                Create New Challenge
              </button>
            </div>
    
            {/* Filters Section */}
            <div className="flex gap-4 mb-6">
              {/* Dropdown for Age Filter */}
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(Number(e.target.value))}
                className="border border-gray-300 rounded px-4 py-2"
              >
                <option value={3}>Age 3</option>
                <option value={4}>Age 4</option>
                <option value={5}>Age 5</option>
                <option value={6}>Age 6</option>
                <option value={7}>Age 7</option>
                <option value={8}>Age 8</option>
                <option value={9}>Age 9</option>
                <option value={10}>Age 10</option>
                <option value={11}>Age 11</option>
                <option value={12}>Age 12</option>
                <option value={13}>Age 13</option>
              </select>
    
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-full"
              />
            </div>
    
            {/* Challenges Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {challengesData.length > 0 ? (
                challengesData.map((challenge, index) => (
                  <div
                    key={challenge.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    {/* Title Section */}
                    <div className="p-3 text-center font-medium">
                      Axara Added a Challenge
                    </div>
    
                    {/* Image */}
                    <img
                      src={challenge.image}
                      alt={challenge.title}
                      className="w-full h-40 object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
    
                    {/* Title */}
                    <div className="p-4 text-center">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {challenge.title}
                      </h2>
                    </div>
    
                    {/* Footer Section */}
                    <div className="flex justify-between items-center bg-gray-50 px-4 py-3 text-sm text-gray-600">
                      <span>📅 {formatDate(challenge.show_date)}</span>
                      <span className="font-medium">
                        Entry Fee:{" "}
                        {challenge.entry_type === "nill"
                          ? "NILL"
                          : challenge.entry_type === "points"
                          ? `${challenge.entry_fee} Points`
                          : `₹${challenge.entry_fee}`}
                      </span>
                    </div>
    
                    {/* Edit Button */}
                    <div className="p-4">
                      {/* <Link
                        href={`/edit-challenge/${challenge.id}`} // Replace with your edit route
                        
                      >
                        Edit Challenge
                      </Link> */}
                      <button
                        className="text-center w-full block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                        onClick={()=>{handleEdit(challenge)}} // Replace with your create challenge route
                      >
                        Edit Challenge
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                // No Challenges Available Message
                <div className="col-span-full text-center text-gray-600 mt-4">
                <h2 className="text-lg font-semibold">
                  No challenges are available for the selected age group.
                </h2>
                <p>Try selecting a different age group or modify your search.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <EditChallenges challengesData ={selectedChallenge}/>
        )
      }

    </div>
  );
};

export default ViewChallenges;
