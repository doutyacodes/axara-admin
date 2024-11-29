"use client"
import React, { useState, useEffect } from 'react';
import { Search, Expand } from 'lucide-react';
import Image from 'next/image';
import GlobalApi from '@/app/api/GlobalApi';
import LoadingSpinner from '@/app/_components/LoadingSpinner';

const AdminActivities = () => {
  const [age, setAge] = useState(3);
  const [activityType, setActivityType] = useState('week');
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);

  const ageOptions = Array.from({ length: 11 }, (_, i) => i + 3);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await GlobalApi.FetchActivities(age, activityType);
      setActivities(response.data.activities);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [age, activityType]);

  const handleImageExpand = (image) => {
    setExpandedImage(image);
  };

  const renderActivities = () => {
    if (isLoading) {
      return (
        <div className="col-span-full flex justify-center items-center p-8">
          <LoadingSpinner />
        </div>
      );
    }

    if (activities.length === 0) {
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
            No Activities Available
          </h2>
          <p className="text-gray-600 max-w-md">
            There is no completed activities for the selected age group. Try adjusting your different age ranges.
          </p>
        </div>
      );
    }

    return activities.map((activity) => (
      <div 
        key={activity.userActivityId} 
        className="bg-white shadow-md rounded-lg p-4 relative group"
      >
        <div className="relative w-full aspect-square mb-2">
          <Image 
            src={`https://wowfy.in/testusr/images/${activity.image}`} 
            alt={activity.content}
            fill
            className="object-cover rounded-md"
          />
          <button 
            onClick={() => handleImageExpand(activity.image)}
            className="absolute top-2 right-2 bg-orange-500/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Expand className="text-white" size={20} />
          </button>
        </div>
        <div className="mt-2">
          <h3 className="font-semibold text-gray-800">{activity.childName}</h3>
          <p className="text-sm text-gray-600">{activity.content}</p>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-orange-600 mb-2">Activities Admin Panel</h1>
        <p className="text-gray-600">View all the completed activities</p>
      </header>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-700 mb-6">
          Completed Activities
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              Activity Type
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="week">Weekly Activities</option>
              <option value="normal">Normal Activities</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {renderActivities()}
        </div>
      </div>

      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <Image 
              src={`https://wowfy.in/testusr/images/${expandedImage}`} 
              alt="Expanded Activity" 
              width={800} 
              height={800} 
              className="object-contain max-w-full max-h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivities;