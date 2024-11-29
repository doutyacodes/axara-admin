"use client"
import React, { useState, useEffect } from 'react';
import { Search, Expand, Filter } from 'lucide-react';
import Image from 'next/image';
import GlobalApi from '@/app/api/GlobalApi';
import LoadingSpinner from '@/app/_components/LoadingSpinner';

const ChallengesAdminPanel = () => {
  const [age, setAge] = useState(3);
  const [entryType, setEntryType] = useState('all');
  const [submissionStatus, setSubmissionStatus] = useState('pending');
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const ageOptions = Array.from({ length: 11 }, (_, i) => i + 3);
  const entryTypeOptions = ['all', 'nil', 'points', 'fee'];
  const submissionStatusOptions = ['pending', 'approved', 'rejected'];

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await GlobalApi.FetchUserChallenges(
        age,
        entryType,
        submissionStatus
      );
      setChallenges(response.data.challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [age, entryType, submissionStatus]);

  const handleImageExpand = (image) => {
    setExpandedImage(image);
  };

  const renderChallenges = () => {
    if (isLoading) {
      return (
        <div className="col-span-full flex justify-center items-center p-8">
          <LoadingSpinner />
        </div>
      );
    }

    if (challenges.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center text-center p-8 bg-orange-50 rounded-lg">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <Search
              className="text-orange-500" 
              size={48} 
              strokeWidth={1.5}
            />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Challenges Found
          </h2>
          <p className="text-gray-600 max-w-md">
            There are no challenges matching your current filters. Try adjusting your search criteria.
          </p>
        </div>
      );
    }

    return challenges.map((challenge) => (
      <div 
        key={challenge.id} 
        className="bg-white shadow-md rounded-lg p-4 relative group"
      >
        <div className="flex justify-between items-start mb-2">
          <span 
            className={`px-3 py-1 rounded-full text-xs font-semibold 
              ${challenge.submissionStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                challenge.submissionStatus === 'approved' ? 'bg-green-100 text-green-800' : 
                'bg-red-100 text-red-800'}`}
          >
            {challenge.submissionStatus}
          </span>
          <span className="text-sm text-gray-600 bg-orange-50 px-2 py-1 rounded-full">
            {challenge.challengeDetails.entryType}
          </span>
        </div>
        <div className="mt-2">
          <h3 className="font-semibold text-gray-800 text-lg mb-1">
            {challenge.challengeDetails.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {challenge.challengeDetails.description}
          </p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {challenge.childName}, Age {challenge.childAge}
              </p>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-orange-600 mb-2">
          Challenges Admin Panel
        </h1>
        <p className="text-gray-600">Manage and review submitted challenges</p>
      </header>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-700">
            Submitted Challenges
          </h1>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            <Filter className="mr-2" size={20} />
            Filters
          </button>
        </div>

        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white shadow-md rounded-lg p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Group
              </label>
              <select
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                {ageOptions.map((ageOption) => (
                  <option key={ageOption} value={ageOption}>
                    {ageOption}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {entryTypeOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => setEntryType(type)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors 
                      ${entryType === type 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {submissionStatusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSubmissionStatus(status)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors 
                      ${submissionStatus === status 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {renderChallenges()}
        </div>
      </div>
    </div>
  );
};

export default ChallengesAdminPanel;