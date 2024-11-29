"use client";

import React, { useState, useEffect } from "react";
import GlobalApi from "@/app/api/GlobalApi";
import EditChallenges from "../_components/EditChallenges/EditChallenges";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import { Search } from "lucide-react";

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
    return <div><LoadingSpinner /></div>;
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
            </div>
    
            {/* Filters Section */}
            <div className="flex gap-4 mb-6">
              {/* Dropdown for Age Filter */}
              <div className="relative w-full max-w-xs">
                <select
                  value={selectedAge}
                  onChange={(e) => setSelectedAge(Number(e.target.value))}
                  className="appearance-none w-full bg-white border-2 border-blue-500 text-gray-800 
                            py-3 px-4 rounded-lg shadow-md 
                            focus:outline-none focus:ring-2 focus:ring-blue-400 
                            transition duration-300 ease-in-out 
                            hover:border-blue-600 
                            text-base font-medium"
                >
                  {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((age) => (
                    <option 
                      key={age} 
                      value={age} 
                      className="bg-white text-gray-800 hover:bg-blue-50"
                    >
                      Age {age}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg 
                    className="fill-current h-5 w-5" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                    />
                  </svg>
                </div>
              </div>
    
              {/* Search Bar */}
              {/* <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-full"
              /> */}
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
                      src={`https://wowfy.in/testusr/images/${challenge.image}`}
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
                <div className="col-span-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <Search
                      className="text-blue-500" 
                      size={48} 
                      strokeWidth={1.5}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    No Challenges Available
                  </h2>
                  <p className="text-gray-600 max-w-md">
                    We couldn&apos;t find any challenges for the selected age group.Try adjusting your search or exploring different age ranges.
                  </p>
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
