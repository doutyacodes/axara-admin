'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Edit, Plus, AlertCircle, AlertTriangle, Clock, Radio } from 'lucide-react';

export default function AdminNewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const router = useRouter();

const fetchNews = useCallback(async (showLoader = true) => {
  try {
    if (showLoader) {
      setLoading(true);
    }
    const res = await fetch('/api/news-map', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch news');
    }
    const data = await res.json();
    setNews(data.news);
  } catch (err) {
    setError(err.message);
  } finally {
    if (showLoader) {
      setLoading(false);
    }
  }
}, []);

useEffect(() => {
  fetchNews(true); // Show loading for initial fetch
  
  // Set up interval to refresh data every 30 seconds without loading screen
  const interval = setInterval(() => fetchNews(false), 30000);
  
  return () => clearInterval(interval);
}, [fetchNews]);

  // Calculate time remaining for a news item
  const calculateTimeRemaining = (createdAt) => {
    const currentTime = new Date();
    const newsCreatedTime = new Date(createdAt);
    const expirationTime = new Date(newsCreatedTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
    const timeRemaining = expirationTime - currentTime;
    
    if (timeRemaining <= 0) {
      return { hours: 0, minutes: 0, expired: true }; // Show expired status
    }
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, expired: false };
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;
    
    try {
      const res = await fetch(`/api/news-map/${newsToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete news');
      }
      
      // Remove the deleted news from both states
      setNews(news.filter(item => item.id !== newsToDelete.id));
      // setLiveNews(liveNews.filter(item => item.id !== newsToDelete.id));
      setShowDeleteModal(false);
      setNewsToDelete(null);
    } catch (err) {
      console.error('Error deleting news:', err);
      setError(err.message);
    }
  };

  const confirmDelete = (newsItem) => {
    setNewsToDelete(newsItem);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Component for countdown timer
  const CountdownTimer = ({ createdAt }) => {
    const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(createdAt));

    useEffect(() => {
      const timer = setInterval(() => {
        const remaining = calculateTimeRemaining(createdAt);
        setTimeRemaining(remaining);
      }, 60000); // Update every minute

      return () => clearInterval(timer);
    }, [createdAt]);

    if (!timeRemaining) {
      return null;
    }

    if (timeRemaining.expired) {
      return (
        <div className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
          <AlertCircle className="mr-1 h-3 w-3" />
          <span className="font-medium">Expired</span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
        <Clock className="mr-1 h-3 w-3" />
        <span className="font-medium">
          {timeRemaining.hours}h {timeRemaining.minutes}m left
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 text-red-800">
            <div className="w-4 h-4 border-2 border-red-800 border-t-transparent rounded-full animate-spin"></div>
            <p>Loading news...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md text-red-800">
          <p className="flex items-center"><AlertCircle className="mr-2" /> Error: {error}</p>
          <button 
            onClick={fetchNews}
            className="mt-4 px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
            News Management
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a 
              href="/news-map/breaking-news" 
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition"
            >
              <AlertTriangle className="mr-2 h-5 w-5" /> Manage Breaking News
            </a>
            <a 
              href="/news-map/create" 
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition"
            >
              <Plus className="mr-2 h-5 w-5" /> Create News
            </a>
          </div>
        </div>
        
      {/* Current News Count */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="h-5 w-5 text-red-600 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-800">Active News</h2>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {news.length} Total
          </span>
        </div>
      </div>

        {/* All News Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">All News Articles</h2>
          <button 
            onClick={() => fetchNews(false)} // No loading for manual refresh either
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {news.length === 0 ? (
          <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-4">No news articles found.</p>
            <a 
              href="/news-map/create" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Your First News Article
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map(newsItem => (
              <div key={newsItem.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="relative h-48 w-full">
                  <img
                    src={newsItem.image_url.startsWith('http') ? newsItem.image_url : `https://wowfy.in/testusr/images/${newsItem.image_url}`} 
                    alt={newsItem.title}
                    className="object-cover w-full h-full" 
                  />
                  <div className="absolute top-2 right-2">
                    <CountdownTimer createdAt={newsItem.created_at} />
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{newsItem.title}</h2>
                  <p className="text-sm text-gray-500">Source: {newsItem.source_name || 'Unknown'}</p>
                </div>
                <div className="border-t border-gray-100 p-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{formatDate(newsItem.created_at)}</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => router.push(`/news-map/edit/${newsItem.id}`)}
                      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                      aria-label="Edit news"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => confirmDelete(newsItem)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      aria-label="Delete news"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{newsToDelete?.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}