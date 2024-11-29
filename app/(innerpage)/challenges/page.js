"use client"

import React, { useState, useEffect } from 'react';
import { Search, Expand, Filter, Check, X } from 'lucide-react';
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
  const [confirmationDialog, setConfirmationDialog] = useState(null);

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


  const handleStatusChange = async (challengeId, newStatus) => {
    try {
      setIsLoading(true);
      await GlobalApi.UpdateChallengeStatus(challengeId, newStatus);
      fetchChallenges(); // Reload challenges after status update
      setConfirmationDialog(null);
    } catch (error) {
      console.error(`Error updating challenge status:`, error);
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
            There are no challenges matching your current filters.
          </p>
        </div>
      );
    }

    return challenges.map((challenge) => (
      <div 
        key={challenge.id} 
        className="bg-white shadow-md rounded-lg p-4 relative group flex flex-col h-full"
      >
        {/* Image Section */}
        <div className="relative w-full aspect-square mb-2">
          <Image 
            src={`https://wowfy.in/testusr/images/${challenge.image}`} 
            alt={challenge.challengeDetails.title}
            fill
            className="object-cover rounded-md"
          />
          <button 
            onClick={() => handleImageExpand(challenge.image)}
            className="absolute top-2 right-2 bg-orange-500/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Expand className="text-white" size={20} />
          </button>
        </div>

        {/* Challenge Details */}
        <div className="flex-1">
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

        {/* Action Buttons */}
        <div className="mt-auto">
            <div className="flex space-x-2">
            {challenge.submissionStatus === 'pending' && (
                <>
                <button 
                    onClick={() => setConfirmationDialog({
                    id: challenge.id, 
                    action: 'approve',
                    message: 'Are you sure you want to approve this challenge?'
                    })}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center justify-center"
                >
                    <Check className="mr-2" size={20} /> Approve
                </button>
                <button 
                    onClick={() => setConfirmationDialog({
                    id: challenge.id, 
                    action: 'reject',
                    message: 'Are you sure you want to reject this challenge?'
                    })}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center justify-center"
                >
                    <X className="mr-2" size={20} /> Reject
                </button>
                </>
            )}
            {challenge.submissionStatus === 'rejected' && (
                <button 
                onClick={() => setConfirmationDialog({
                    id: challenge.id, 
                    action: 'approve',
                    message: 'Revert this challenge back to approved status?'
                })}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center justify-center"
                >
                <Check className="mr-2" size={20} /> Revert to Approved
                </button>
            )}
            {challenge.submissionStatus === 'approved' && (
                <button 
                onClick={() => setConfirmationDialog({
                    id: challenge.id, 
                    action: 'reject',
                    message: 'Are you sure you want to reject this approved challenge?'
                })}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center justify-center"
                >
                <X className="mr-2" size={20} /> Reject
                </button>
            )}
            </div>
        </div>
    </div>
    ));
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      {/* Rest of the previous component remains the same */}

      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-orange-600 mb-2">
          Challenges Admin Panel
        </h1>
        <p className="text-gray-600">Manage and review submitted challenges</p>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-orange-700">
              Submitted Challenges
            </h1>
            <div className="space-x-6">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
                onClick={() => window.location.href = "/challenges/create-challenges"} // Replace with your create challenge route
              >
                Create New Challenge
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
                onClick={() => window.location.href = "/challenges/review-challenges"} // Replace with your create challenge route
              >
                View Submitted Challenge
              </button>
            </div>
        </div> */}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-700">
            Submitted Challenges
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = "/challenges/create-challenges"} 
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-2 font-medium transition-all duration-300 
              bg-gradient-to-r from-orange-500 to-orange-600 text-white 
              hover:from-orange-600 hover:to-orange-700 
              focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2
              shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="absolute bottom-0 left-0 h-1 w-full bg-orange-700 opacity-50 group-hover:opacity-0 transition-opacity duration-300"></span>
              <span className="relative flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Challenge
              </span>
            </button>
            <button
              onClick={() => window.location.href = "/challenges/view-all-challenges"}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-2 font-medium transition-all duration-300 
              bg-gradient-to-r from-blue-500 to-blue-600 text-white 
              hover:from-blue-600 hover:to-blue-700 
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
              shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="absolute bottom-0 left-0 h-1 w-full bg-blue-700 opacity-50 group-hover:opacity-0 transition-opacity duration-300"></span>
              <span className="relative flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                View All Challenges
              </span>
            </button>
          </div>
        </div>

                  {/* <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            <Filter className="mr-2" size={20} />
            Filters
          </button> */}

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {renderChallenges()}
        </div>
      </div>
      
      {/* Image Expansion Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <Image 
              src={`https://wowfy.in/testusr/images/${expandedImage}`} 
              alt="Expanded Challenge Image" 
              width={800} 
              height={800} 
              className="object-contain max-w-full max-h-full"
            />
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Action</h2>
            <p className="mb-6 text-gray-600">{confirmationDialog.message}</p>
            <div className="flex space-x-4">
              <button 
                onClick={() => handleStatusChange(
                  confirmationDialog.id, 
                  confirmationDialog.action
                )}
                className={`flex-1 px-4 py-2 rounded-md text-white ${
                  confirmationDialog.action === 'approve' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Yes, {confirmationDialog.action}
              </button>
              <button 
                onClick={() => setConfirmationDialog(null)}
                className="flex-1 px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengesAdminPanel;